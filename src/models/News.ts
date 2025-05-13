import mongoose, { Schema, Document } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     News:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           $ref: '#/components/schemas/NewsLang'
 *         content:
 *           $ref: '#/components/schemas/NewsLang'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     NewsInput:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           $ref: '#/components/schemas/NewsLang'
 *         content:
 *           $ref: '#/components/schemas/NewsLang'
 *     NewsLang:
 *       type: object
 *       properties:
 *         en:
 *           type: string
 *         de:
 *           type: string
 *         es:
 *           type: string
 *         fr:
 *           type: string
 *         it:
 *           type: string
 *         ru:
 *           type: string
 *         ar:
 *           type: string
 *         tr:
 *           type: string
 */

export interface INews extends Document {
  title: {
    en: string;
    de: string;
    es: string;
    fr: string;
    it: string;
    ru: string;
    ar: string;
    tr: string;
  };
  content: {
    en: string;
    de: string;
    es: string;
    fr: string;
    it: string;
    ru: string;
    ar: string;
    tr: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema: Schema = new Schema(
  {
    title: {
      en: { type: String, required: true },
      de: { type: String, required: true },
      es: { type: String, required: true },
      fr: { type: String, required: true },
      it: { type: String, required: true },
      ru: { type: String, required: true },
      ar: { type: String, required: true },
      tr: { type: String, required: true },
    },
    content: {
      en: { type: String, required: true },
      de: { type: String, required: true },
      es: { type: String, required: true },
      fr: { type: String, required: true },
      it: { type: String, required: true },
      ru: { type: String, required: true },
      ar: { type: String, required: true },
      tr: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model<INews>('News', NewsSchema); 