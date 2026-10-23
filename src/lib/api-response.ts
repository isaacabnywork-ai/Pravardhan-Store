import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

export interface ApiSuccessResponse<T> {
  success?: boolean;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    requestId?: string;
    fields?: Record<string, string>;
    details?: unknown;
  };
}

export function apiSuccess<T>(
  data: T,
  statusCode = 200,
  pagination?: PaginationMeta
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = { success: true, data };
  if (pagination) {
    body.pagination = pagination;
  }
  return NextResponse.json(body, { status: statusCode });
}

export function formatZodFields(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'root';
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}

export function apiValidationError(
  error: ZodError,
  message = 'Please check the submitted fields.',
  requestId?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        fields: formatZodFields(error),
        details: error.format(),
        requestId,
      },
    },
    { status: 400 }
  );
}

export function apiError(
  error: unknown,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  if (error instanceof ZodError) {
    return apiValidationError(error, 'Please check the submitted fields.', requestId);
  }

  if (error instanceof AppError) {
    const fields = error.details && typeof error.details === 'object' && 'fields' in error.details
      ? (error.details as any).fields
      : undefined;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          requestId,
          fields,
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
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal server error occurred',
        requestId,
      },
    },
    { status: 500 }
  );
}
