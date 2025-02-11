import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OptimizerDto {
  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  runs: number;
}

class SettingsDto {
  @ValidateNested()
  @Type(() => OptimizerDto)
  optimizer: OptimizerDto;

  @IsOptional()
  @IsString()
  evmVersion?: string;
}

export class ImportDto {
  @IsString()
  name: string;

  @IsString()
  contents: string;
}

class SourceDto {
  @IsString()
  content: string;
}

export class VerifyRequestDto {
  @IsString()
  address: string;

  @ValidateNested()
  @Type(() => SettingsDto)
  settings: SettingsDto;

  @IsString()
  version: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportDto)
  imports?: ImportDto[];

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsObject()
  sources?: Record<string, SourceDto>;

  @IsOptional()
  @IsObject()
  libraries?: Record<string, string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  constructorArguments?: string[];

  @IsOptional()
  @IsString()
  encodedConstructorArguments?: string;

  @IsOptional()
  @IsString()
  bytecode?: string;
}
