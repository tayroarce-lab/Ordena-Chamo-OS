import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

/**
 * Middleware de validación para el payload de entrada de n8n
 */
export const validatePedido = [
  body('telefono').isString().notEmpty().withMessage('El teléfono es requerido y debe ser texto.'),
  body('nombre_cliente').optional().isString().withMessage('El nombre debe ser texto.'),
  body('metodo_pago').isIn(['efectivo', 'tarjeta', 'transferencia', 'zelle']).withMessage('Método de pago inválido.'),
  body('notas').optional().isString(),
  
  body('items').isArray({ min: 1 }).withMessage('Los ítems deben ser un arreglo no vacío.'),
  body('items.*.producto_id').isInt({ gt: 0 }).withMessage('producto_id debe ser un entero positivo.'),
  body('items.*.cantidad').isInt({ gt: 0 }).withMessage('cantidad debe ser un entero positivo.'),
  body('items.*.modificadores').optional({ nullable: true }).isObject().withMessage('modificadores debe ser un objeto o null.'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Error de validación en los datos de entrada.',
        details: errors.array()
      });
    }
    next();
  }
];
