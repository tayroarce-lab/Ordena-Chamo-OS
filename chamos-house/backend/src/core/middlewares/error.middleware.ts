import type { NextFunction, Request, Response } from 'express';
import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  ConnectionError,
} from 'sequelize';
import { logger } from '..//utils/logger';
import { isDevelopment } from '../../config/env';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  });
}

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(422).json({
      success: false,
      error: 'Error de validación de datos',
      details: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
    return;
  }

  if (err instanceof UniqueConstraintError) {
    res.status(409).json({
      success: false,
      error: 'El registro ya existe o viola una restricción única',
      details: err.errors.map((e) => e.message),
    });
    return;
  }

  if (err instanceof ForeignKeyConstraintError) {
    res.status(409).json({
      success: false,
      error: 'No se puede completar la operación por referencias relacionadas',
    });
    return;
  }

  if (err instanceof ConnectionError) {
    res.status(503).json({
      success: false,
      error: 'Servicio de base de datos no disponible',
    });
    return;
  }

  logger.error(err.message, { stack: err.stack });

  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    ...(isDevelopment ? { details: err.message, stack: err.stack } : {}),
  });
}
