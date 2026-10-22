import { NextResponse } from 'next/server';
import { AppError } from './errors';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
}

export function apiSuccess<T>(
  data: T,
  statusCode = 200,
  pagination?: PaginationMeta
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = { data };
  if (pagination) {
    body.pagination = pagination;
  }
  return NextResponse.json(body, { status: statusCode });
}

export function apiError(
  error: unknown,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          requestId,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle unexpected errors (never leak raw stack traces or internal secrets)
  console.error('[API Error]:', error);
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal server error occurred',
        requestId,
      },
    },
    { status: 500 }
  );
}
