import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({ required: false })
  folder?: string;

  @ApiProperty({ required: false })
  description?: string;
}

export class FileMetadataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  uploadedBy: string;

  @ApiProperty()
  createdAt: Date;
}
