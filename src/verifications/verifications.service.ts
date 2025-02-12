import { BadRequestException, Injectable } from '@nestjs/common';
import { EVM_VERSIONS } from 'src/constants/evm.constants';
import { PrismaService } from 'src/prisma.service';
import { VerifyRequestDto } from './verify-request.dto';
import { Multer } from 'multer';
import { config } from 'src/common/constants/config';

@Injectable()
export class VerificationsService {
  constructor(private prisma: PrismaService) {}

  getEvmVersions(): string[] {
    return EVM_VERSIONS;
  }
  async verify(data: string, file: Multer.File | undefined) {
    try {
      const dataParsed: VerifyRequestDto = JSON.parse(data);

      if (!dataParsed.address) {
        throw new BadRequestException('Address is required');
      }
      if (!/^0x[a-fA-F0-9]{40}$/.test(dataParsed.address)) {
        throw new BadRequestException(`Invalid address: ${dataParsed.address}`);
      }
      if (!dataParsed.version) {
        throw new BadRequestException('Compiler version is required');
      }

      if (!this.isValidVersion(dataParsed.version)) {
        throw new BadRequestException('Invalid compiler version provided');
      }

      if (!dataParsed.name) {
        throw new BadRequestException('Contract name is required');
      }
      if (file) {
        const jsonContents = file.buffer.toString('utf-8');
        const { sources, settings } = JSON.parse(jsonContents);
        if (!sources || !settings) {
          throw new BadRequestException(
            'Error, missing sources or settings in file',
          );
        }
      } else {
        if (!dataParsed.source) {
          throw new BadRequestException(
            'Either source or sources must be provided',
          );
        }
      }

      const contract = await this.prisma.contract.findUnique({
        where: {
          address: dataParsed.address,
        },
      });

      if (!contract) {
        throw new BadRequestException('Contract not found in the database');
      }
      dataParsed.bytecode = contract.deployedCode;

      const formData = new FormData();
      formData.append('data', JSON.stringify(dataParsed));
      if (file) {
        const fileBlob = new Blob([file.buffer], { type: file.mimetype });
        formData.append('file', fileBlob, file.originalname);
      }

      const response = await fetch(
        `${config.verifier_url}/api/verifier/verify`,
        {
          method: 'POST',
          body: formData,
        },
      );
      const result = await response.json();
      const match = await this.checkResult(result);
      let saveNewItem: any;
      if (match) {
        saveNewItem = await this.prisma.verification_result.create({
          data: {
            id: crypto.randomUUID(),
            abi: JSON.stringify(result.abi),
            address: dataParsed.address,
            match: match,
            request: data,
            result: JSON.stringify(result),
            sources: JSON.stringify(result.usedSources),
            timestamp: Date.now(),
          },
        });
      }
      return {
        success: match,
        message: match
          ? 'Contract verified successfully'
          : 'Contract verification failed',
        data: {
          address: result.address,
          version: result.version,
          name: result.name,
          dataResponse: result ?? 'No data',
          storedInDB: saveNewItem ? saveNewItem.toString() : null,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Error on contract verification: ${error.message}`);
    }
  }
  private async checkResult({
    bytecodeHash,
    resultBytecodeHash,
  }): Promise<boolean> {
    try {
      if (!bytecodeHash || bytecodeHash.length !== 66) return false;
      if (!resultBytecodeHash) return false;
      return resultBytecodeHash === bytecodeHash;
    } catch (err) {
      return false;
    }
  }
  private isValidVersion(version: string): boolean {
    const solidityVersionRegex = /^\d+\.\d+\.\d+$/;
    return solidityVersionRegex.test(version);
  }
}
