import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Request() req: any,
  ) {
    const result = await this.filesService.uploadFile(file, {
      folder: dto.folder,
      description: dto.description,
      tenantId: req.user.tenantId,
      userId: req.user.sub,
    });

    return result;
  }

  @Get()
  async listFiles(@Request() req: any) {
    return this.filesService.listFiles(req.user.tenantId);
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Request() req: any) {
    return this.filesService.getFile(id, req.user.tenantId);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Request() req: any) {
    return this.filesService.deleteFile(id, req.user.tenantId);
  }
}
