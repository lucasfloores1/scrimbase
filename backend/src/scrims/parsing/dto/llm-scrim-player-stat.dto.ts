import { IsInt, IsString } from "class-validator";

export class LlmScrimPlayerStatDto {

  @IsString()
  displayName: string;

  @IsString()
  agent: string;

  @IsInt()
  kills: number;

  @IsInt()
  deaths: number;

  @IsInt()
  assists: number;

  @IsInt()
  acs: number;

}