import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import newsRoutes from './routes/news';
import errorHandler from './middlewares/errorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'de', 'es', 'fr', 'it', 'ru', 'ar', 'tr'],
    backend: {
      loadPath: __dirname + '/../locales/{{lng}}/translation.json',
    },
    detection: {
      order: ['header', 'querystring', 'cookie'],
      caches: ['cookie'],
    },
    debug: false,
  });

app.use(i18nextMiddleware.handle(i18next));

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.use(errorHandler);

export default app; 