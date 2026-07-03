import type { Response } from 'express';

interface SuccessBody<T> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorBody {
  success: false;
  error: string;
  details?: unknown;
}

interface PaginatedBody<T> {
  success: true;
  data: T;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function success<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response {
  const body: SuccessBody<T> = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

export function error(
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown
): Response {
  const body: ErrorBody = { success: false, error: message };
  if (details !== undefined) body.details = details;
  return res.status(statusCode).json(body);
}

export function paginated<T>(
  res: Response,
  data: T,
  total: number,
  page: number,
  limit: number
): Response {
  const body: PaginatedBody<T> = {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
  return res.status(200).json(body);
}
