import { IsString } from 'class-validator';

export class GetTokenByNameOrSymbolParams {
  @IsString()
  value: string;
}
