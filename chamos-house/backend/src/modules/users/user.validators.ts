import { body, param, query } from 'express-validator';
import { ROLES_USUARIO } from '../../types';

export const createUsuarioValidator = [
  body('telefono').notEmpty().isNumeric().isLength({ min: 7, max: 20 }),
  body('nombre').optional({ nullable: true }).isLength({ min: 2, max: 100 }),
  body('rol').isIn(['cocina', 'admin']).withMessage('Solo se pueden crear usuarios cocina o admin'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('activo').optional().isBoolean(),
];

export const updateUsuarioValidator = [
  param('id').isInt({ min: 1 }),
  body('telefono').optional().isNumeric().isLength({ min: 7, max: 20 }),
  body('nombre').optional({ nullable: true }).isLength({ min: 2, max: 100 }),
  body('rol').optional().isIn(['cocina', 'admin']),
  body('password').optional().isLength({ min: 8 }),
  body('activo').optional().isBoolean(),
];

export const usuarioIdValidator = [param('id').isInt({ min: 1 })];

export const usuarioListValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('rol').optional().isIn(ROLES_USUARIO),
  query('search').optional().isString().isLength({ max: 100 }),
];
