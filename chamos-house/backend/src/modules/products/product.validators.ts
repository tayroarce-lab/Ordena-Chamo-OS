import { body, param } from 'express-validator';

export const createProductoValidator = [
  body('nombre').notEmpty().isLength({ min: 2, max: 150 }),
  body('descripcion').optional({ nullable: true }).isString(),
  body('precio').isFloat({ min: 0.01 }),
  body('categoria').optional({ nullable: true }).isLength({ min: 2, max: 80 }),
  body('disponible').optional().isBoolean(),
];

export const updateProductoValidator = [
  param('id').isInt({ min: 1 }),
  body('nombre').optional().isLength({ min: 2, max: 150 }),
  body('descripcion').optional({ nullable: true }).isString(),
  body('precio').optional().isFloat({ min: 0.01 }),
  body('categoria').optional({ nullable: true }).isLength({ min: 2, max: 80 }),
  body('disponible').optional().isBoolean(),
];

export const productoIdValidator = [param('id').isInt({ min: 1 })];
