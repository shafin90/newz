import { Request, Response } from 'express';
import News from '../models/News';
import axios from 'axios';

const LIBRETRANSLATE_URL = 'https://libretranslate.com/translate';
const LANGS = ['en', 'de', 'es', 'fr', 'it', 'ru', 'ar', 'tr'];

async function translateText(text: string, source: string, target: string): Promise<string> {
  try {
    if (source === target) return text;
    const res = await axios.post(LIBRETRANSLATE_URL, {
      q: text,
      source,
      target,
      format: 'text'
    }, {
      headers: { 'accept': 'application/json' }
    });
    return res.data.translatedText;
  } catch (e: any) {
    console.error('Translation error:', e.response?.data || e.message);
    return '';
  }
}

export const getAllNews = async (req: Request, res: Response) => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const total = await News.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const news = await News.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const langRaw = (req as any).language;
    const result = news.map((item: any) => {
      const lang: keyof typeof item.title = ['en','de','es','fr','it','ru','ar','tr'].includes(langRaw) ? langRaw : 'en';
      return {
        id: item._id,
        title: item.title[lang] || item.title['en'],
        content: item.content[lang] || item.content['en'],
        coverImage: item.coverImage,
        views: item.views,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });
    res.json({ data: result, totalPages });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createNews = async (req: Request, res: Response) => {
  try {
    console.log('File received:', req.file);
    let { title, content, originalLang } = req.body;
    // Parse title/content if sent as JSON strings (from FormData)
    if (typeof title === 'string') title = JSON.parse(title);
    if (typeof content === 'string') content = JSON.parse(content);
    if (!title || !content || !originalLang) {
      return res.status(400).json({ message: 'Title, content, and originalLang are required' });
    }
    // Only save the original language, do not translate
    const newsData: any = {
      title: { [originalLang]: title[originalLang] },
      content: { [originalLang]: content[originalLang] },
      originalLang,
      coverImage: req.file ? `/uploads/${req.file.filename}` : undefined
    };
    const news = new News(newsData);
    await news.save();
    res.status(201).json(news);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err });
  }
};

export const updateNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const updateData: any = {};
    if (title) updateData['title'] = title;
    if (content) updateData['content'] = content;
    if (req.file) updateData['coverImage'] = `/uploads/${req.file.filename}`;
    const news = await News.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err });
  }
};

export const deleteNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const news = await News.findByIdAndDelete(id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json({ message: 'News deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err });
  }
};

export const testI18n = (req: Request, res: Response) => {
  const t = req.t;
  res.json({
    greeting: t('greeting'),
    news: t('news')
  });
};

export const getNewsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const langRaw = (req as any).language;
    const news = await News.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
    if (!news) return res.status(404).json({ message: 'News not found' });
    const lang: keyof typeof news.title = ['en','de','es','fr','it','ru','ar','tr'].includes(langRaw) ? langRaw : 'en';
    res.json({
      _id: news._id,
      title: news.title[lang] || news.title['en'],
      content: news.content[lang] || news.content['en'],
      coverImage: news.coverImage,
      views: news.views,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt
    });
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err });
  }
};

export const getNewsAnalytics = async (req: Request, res: Response) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    const analytics = news.map((item: any) => ({
      _id: item._id,
      title: item.title['en'],
      views: item.views,
      createdAt: item.createdAt
    }));
    res.json({ total: news.length, analytics });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateNewsTranslation = async (req: Request, res: Response) => {
  try {
    const { id, lang } = req.params;
    const { title, content } = req.body;
    if (!LANGS.includes(lang)) {
      return res.status(400).json({ message: 'Invalid language code' });
    }
    const updateData: any = {};
    if (title) updateData[`title.${lang}`] = title;
    if (content) updateData[`content.${lang}`] = content;
    const news = await News.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err });
  }
}; 