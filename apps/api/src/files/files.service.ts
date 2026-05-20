import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

interface UploadOptions {
  folder?: string;
  description?: string;
  tenantId: string;
  userId: string;
}

@Injectable()
export class FilesService {
  private readonly bucketName: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.bucketName = this.configService.get('MINIO_BUCKET', 'nexusos-files');
  }

  async uploadFile(file: Express.Multer.File, options: UploadOptions) {
    const fileId = crypto.randomUUID();
    const extension = file.originalname.split('.').pop() || '';
    const filename = `${options.folder || 'uploads'}/${fileId}.${extension}`;

    // In production, upload to MinIO/S3
    // For now, store metadata only
    const fileRecord = await this.prisma.file.create({
      data: {
        id: fileId,
        filename: filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/files/${fileId}`,
        tenantId: options.tenantId,
        uploadedBy: options.userId,
        metadata: {
          description: options.description,
          bucket: this.bucketName,
        },
      },
    });

    return {
      id: fileRecord.id,
      url: fileRecord.url,
      filename: fileRecord.originalName,
      size: fileRecord.size,
    };
  }

  async listFiles(tenantId: string) {
    return this.prisma.file.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFile(id: string, tenantId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id, tenantId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async deleteFile(id: string, tenantId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id, tenantId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Delete from storage (MinIO/S3) in production
    await this.prisma.file.delete({
      where: { id },
    });

    return { success: true };
  }

  async getPresignedUrl(fileId: string, expiresIn = 3600) {
    // Generate presigned URL for MinIO/S3
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // In production, use MinIO client to generate presigned URL
    return {
      url: file.url,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  }
}
