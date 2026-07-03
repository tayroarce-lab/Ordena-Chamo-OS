import { body } from 'express-validator';

export const loginValidator = [
  body('telefono').notEmpty().withMessage('El teléfono es obligatorio').isString(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
];
