import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { uploadService } from '@/lib/services/upload.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';

const presignSchema = z.object({
  filename: z.string().min(1).max(500),
  contentType: z.string().min(1).max(100),
  size: z.number().positive(),
  context: z.string().min(1).max(50),
});

// ============================================================
// POST /api/uploads/presign
// Get a presigned S3 upload URL
// ============================================================

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const data = presignSchema.parse(body);

    const result = await uploadService.getPresignedUrl({
      ...data,
      userId: user.id,
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
});
