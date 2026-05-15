import { IsString } from 'class-validator';

export class SaveNoteDto {
  @IsString()
  noteType: string;

  @IsString()
  content: string;
}
