import { body, param, query } from 'express-validator';
import { ESTADOS_PEDIDO, METODOS_PAGO } from '../../types';

export const webhookPedidoValidator = [
  body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
  body('nombre_cliente').optional().isString().isLength({ max: 100 }),
  body('metodo_pago')
    .notEmpty()
    .isIn(METODOS_PAGO)
    .withMessage('Método de pago inválido'),
  body('notas').optional().isString().isLength({ max: 500 }),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un ítem'),
  body('items.*.producto_id').isInt({ min: 1 }).withMessage('producto_id inválido'),
  body('items.*.cantidad').isInt({ min: 1 }).withMessage('cantidad inválida'),
  body('items.*.modificadores')
    .optional({ nullable: true })
    .custom((value: unknown) => value === null || (typeof value === 'object' && !Array.isArray(value)))
    .withMessage('modificadores debe ser un objeto o null'),
];

export const actualizarEstadoValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID de pedido inválido'),
  body('estado')
    .notEmpty()
    .isIn(ESTADOS_PEDIDO)
    .withMessage('Estado inválido'),
];

export const pedidoIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID de pedido inválido'),
];

export const pedidoHistorialValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('estado').optional().isIn(ESTADOS_PEDIDO),
  query('metodo_pago').optional().isIn(METODOS_PAGO),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];
