import { z } from 'zod';
import { PAGINATION } from '@/lib/config/constants';
import type { PaginationMeta } from './api-response';

// ============================================================
// Pagination Helpers
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  return paginationSchema.parse({
    page: searchParams.get('page') || PAGINATION.DEFAULT_PAGE,
    limit: searchParams.get('limit') || PAGINATION.DEFAULT_LIMIT,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });
}

export function getPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function getSkipTake(page: number, limit: number) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
