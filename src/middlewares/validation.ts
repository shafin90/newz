import { body } from 'express-validator';

export const validateNews = [
  body('title.en').isString().notEmpty(),
  body('title.de').isString().notEmpty(),
  body('title.es').isString().notEmpty(),
  body('title.fr').isString().notEmpty(),
  body('title.it').isString().notEmpty(),
  body('title.ru').isString().notEmpty(),
  body('title.ar').isString().notEmpty(),
  body('title.tr').isString().notEmpty(),
  body('content.en').isString().notEmpty(),
  body('content.de').isString().notEmpty(),
  body('content.es').isString().notEmpty(),
  body('content.fr').isString().notEmpty(),
  body('content.it').isString().notEmpty(),
  body('content.ru').isString().notEmpty(),
  body('content.ar').isString().notEmpty(),
  body('content.tr').isString().notEmpty(),
];

export const validateLogin = [
  body('username').isString().notEmpty(),
  body('password').isString().notEmpty(),
]; 