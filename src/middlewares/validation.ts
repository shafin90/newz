import { body } from 'express-validator';

// Only require the original language for title and content
export const validateNews = [
  body('title').custom((value, { req }) => {
    const lang = req.body.originalLang;
    if (!lang || !value || !value[lang]) {
      throw new Error('Title in original language is required');
    }
    return true;
  }),
  body('content').custom((value, { req }) => {
    const lang = req.body.originalLang;
    if (!lang || !value || !value[lang]) {
      throw new Error('Content in original language is required');
    }
    return true;
  }),
  body('originalLang').isString().notEmpty().isIn(['en','de','es','fr','it','ru','ar','tr'])
];

// For translation update endpoint
export const validateNewsTranslation = [
  body('title').optional().isString(),
  body('content').optional().isString()
];

export const validateLogin = [
  body('username').isString().notEmpty(),
  body('password').isString().notEmpty(),
]; 