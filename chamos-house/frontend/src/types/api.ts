export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiPaginated<T> {
  success: true;
  data: T;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}
