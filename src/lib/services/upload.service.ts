import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db/client';
import { UPLOAD } from '@/lib/config/constants';
import { AppError } from '@/lib/helpers/errors';

// ============================================================
// File Upload Service (S3 Presigned URLs)
// ============================================================

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  ...(process.env.S3_ENDPOINT && { endpoint: process.env.S3_ENDPOINT }),
  ...(process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY && {
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
  }),
});

type UploadContext = keyof typeof UPLOAD.RULES;

interface GetPresignedUrlParams {
  filename: string;
  contentType: string;
  size: number;
  context: string;
  userId: string;
}

class UploadService {
  /**
   * Generate a presigned upload URL and create a file record.
   */
  async getPresignedUrl(params: GetPresignedUrlParams) {
    const context = params.context as UploadContext;
    const rules = UPLOAD.RULES[context] || UPLOAD.RULES.general;

    // Validate file size
    if (params.size > rules.maxSize) {
      throw new AppError(
        'VALIDATION_ERROR',
        `File too large. Max size: ${Math.round(rules.maxSize / 1_000_000)}MB`
      );
    }

    // Validate content type
    if (!this.isTypeAllowed(params.contentType, rules.types)) {
      throw new AppError('VALIDATION_ERROR', 'File type not allowed');
    }

    // Generate S3 key
    const fileId = uuidv4();
    const ext = params.filename.split('.').pop() || 'bin';
    const key = `uploads/${params.context}/${fileId}.${ext}`;

    // Generate presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || 'platform-uploads',
      Key: key,
      ContentType: params.contentType,
      ContentLength: params.size,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Create file record
    const cdnUrl = process.env.CDN_URL || '';
    const fileUrl = cdnUrl ? `${cdnUrl}/${key}` : uploadUrl.split('?')[0];

    const file = await db.fileUpload.create({
      data: {
        id: fileId,
        userId: params.userId,
        filename: key,
        originalName: params.filename,
        contentType: params.contentType,
        size: BigInt(params.size),
        fileUrl,
        context: params.context,
      },
    });

    return {
      uploadUrl,
      fileId: file.id,
      fileUrl: file.fileUrl,
    };
  }

  /**
   * Confirm upload complete and link to entity.
   */
  async linkToEntity(fileId: string, entityType: string, entityId: string): Promise<void> {
    await db.fileUpload.update({
      where: { id: fileId },
      data: { entityType, entityId },
    });
  }

  private isTypeAllowed(contentType: string, allowedTypes: readonly string[]): boolean {
    return allowedTypes.some((allowed) => {
      if (allowed.endsWith('/*')) {
        return contentType.startsWith(allowed.replace('/*', '/'));
      }
      return contentType === allowed;
    });
  }
}

export const uploadService = new UploadService();
