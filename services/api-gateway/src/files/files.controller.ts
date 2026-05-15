import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types';
import { CreateUploadSignatureDto } from './dto/create-upload-signature.dto';
import { RegisterFileDto } from './dto/register-file.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post('sign-upload')
  signUpload(@Body() dto: CreateUploadSignatureDto, @CurrentUser() user: AuthUser) {
    return this.files.createUploadSignature(dto, user);
  }

  @Post()
  registerUploadedFile(@Body() dto: RegisterFileDto, @CurrentUser() user: AuthUser) {
    return this.files.registerUploadedFile(dto, user);
  }
}
