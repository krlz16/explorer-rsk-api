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
        dataParsed.sources = JSON.stringify(sources);
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

      //Extract sources
      const sources = this.extractUsedSourcesFromRequest(dataParsed, result);

      if (match) {
        saveNewItem = await this.prisma.verification_result.create({
          data: {
            id: crypto.randomUUID(),
            abi: JSON.stringify(result.abi),
            address: dataParsed.address,
            match: match,
            request: data,
            result: JSON.stringify(result),
            sources: JSON.stringify(sources),
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
      throw new Error(`Error checking results: ${err.message}`);
    }
  }
  private isValidVersion(version: string): boolean {
    const solidityVersionRegex = /^\d+\.\d+\.\d+$/;
    return solidityVersionRegex.test(version);
  }
  private extractUsedSourcesFromRequest(
    { source, imports, sources, name }: VerifyRequestDto,
    { usedSources },
  ) {
    if (!sources) {
      // solidity source file verification method
      const sourceData = imports[0];
      // fix it with hash
      if (!usedSources) {
        return [];
      }
      if (source === sourceData.contents) {
        sourceData.file = sourceData.name;
        usedSources.unshift(sourceData);
      }
      // replaces paths in in imports
      imports = imports.map((i) => {
        let { name, contents } = i;
        usedSources.forEach((s) => {
          let { file } = s;
          contents = contents
            .split('\n')
            .map((line) => this.replaceImport(line, file))
            .join('\n');
        });
        return { contents, name };
      });

      return usedSources.map((s) => {
        let { file: name } = s;
        let imp = imports.find((i) => i.name === name);
        const { contents } = imp;
        return { name, contents };
      });
    } else {
      // standard json input verification method
      const sourcesParsed = JSON.parse(sources);
      const sourcesToSave = [];
      if (usedSources && usedSources.length > 0) {
        usedSources.forEach((s) => {
          const { file, path } = s;
          const sourceFile = sourcesParsed[path];
          const { content: contents } = sourceFile;

          if (file.split('.')[0] === name) {
            // is the main contract
            sourcesToSave.unshift({ name: file, contents });
          } else {
            sourcesToSave.push({ name: file, contents });
          }
        });
      }
      return sourcesToSave;
    }
  }
  private replaceImport(content: string, name: string) {
    const re = new RegExp(`^import\\s*"([A-Za-z-0-9_\\/\\.]*(/${name}))";$`);
    return content.replace(re, function (a, b) {
      return a.replace(b, `./${name}`);
    });
  }
}
