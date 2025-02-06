import { BadRequestException, Injectable } from '@nestjs/common';
import { EVM_VERSIONS } from 'src/constants/evm.constants';
import { PrismaService } from 'src/prisma.service';
import { VerifyRequestDto } from './verify-request.dto';
import { Multer } from 'multer';
import { isAddress } from '@rsksmart/rsk-utils';

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
      if (
        !isAddress(dataParsed.address) ||
        !dataParsed.address.includes('0x')
      ) {
        throw new BadRequestException(`Invalid address: ${dataParsed.address}`);
      }
      if (!dataParsed.version) {
        throw new BadRequestException('Compiler version is required');
      }

      if (!dataParsed.name) {
        throw new BadRequestException('Contract name is required');
      }
      if (file) {
        const jsonContents = file.buffer.toString('utf-8');
        const { sources, settings } = JSON.parse(jsonContents);
        if (!sources || !settings) {
          console.error('Invalid JSON: Missing sources or settings');
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
        `${process.env.VERIFIER_URL}/api/verifier/verify`,
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
          dataResponse: JSON.stringify(result) ?? 'No data',
          storedInDB: saveNewItem.toString(),
        },
      };
    } catch (error) {
      console.error('Error in verify function:', error);
      throw new BadRequestException('Error processing FormData');
    }
  }
  private async checkResult({ bytecodeHash, resultBytecodeHash }) {
    try {
      if (!bytecodeHash || bytecodeHash.length !== 66)
        throw new Error('Invalid bytecodeHash');
      if (!resultBytecodeHash) throw new Error('resultBytecodeHash is empty');
      return resultBytecodeHash === bytecodeHash;
    } catch (err) {
      throw new Error('error checking result: ' + err);
    }
  }
}
