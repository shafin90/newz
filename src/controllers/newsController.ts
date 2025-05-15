import { Request, Response } from 'express';
import News from '../models/News';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import fs from 'fs';
import path from 'path';

const LANGS = ['en', 'de', 'es', 'fr', 'it', 'ru', 'ar', 'tr'];

const LIBRETRANSLATE_URL = 'http://localhost:5000/translate';

export const getAllNews = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const total = await News.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const news = await News.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ data: news, totalPages });
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

    const newsData = {
      title: { [originalLang]: title[originalLang] },
      content: { [originalLang]: content[originalLang] },
      originalLang,
      coverImage: req.file ? `/uploads/${req.file.filename}` : undefined
    };

    const news = new News(newsData);
    await news.save();
    res.status(201).json(news);
  } catch (err) {
    console.error('Create news error:', err);
    res.status(400).json({ message: 'Invalid data', error: err });
  }
};

export const updateNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { title, content, originalLang } = req.body;
    
    // Parse title/content if sent as JSON strings (from FormData)
    if (typeof title === 'string') title = JSON.parse(title);
    if (typeof content === 'string') content = JSON.parse(content);
    
    // Get existing news item
    const existingNews = await News.findById(id);
    if (!existingNews) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Prepare update data
    const updateData: any = {};
    
    // Merge existing translations with updates for title
    if (title) {
      updateData.title = {
        ...existingNews.title,
        ...title
      };
    }
    
    // Merge existing translations with updates for content
    if (content) {
      updateData.content = {
        ...existingNews.content,
        ...content
      };
    }
    
    // Update original language if provided
    if (originalLang) {
      updateData.originalLang = originalLang;
    }
    
    // Handle cover image
    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }

    // Update the news item
    const news = await News.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(news);
  } catch (err) {
    console.error('Update error:', err);
    res.status(400).json({ message: 'Invalid data', error: err });
  }
};

export const deleteNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Delete the associated cover image if it exists
    if (news.coverImage) {
      const imagePath = path.join(__dirname, '../../', news.coverImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the news document
    await news.deleteOne();
    
    res.json({ message: 'News deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete news', error: err });
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
    const news = await News.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (err) {
    console.error('Get news error:', err);
    res.status(400).json({ message: 'Invalid data', error: err });
  }
};

export const getNewsAnalytics = async (req: Request, res: Response) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    const total = news.length;
    const totalViews = news.reduce((sum, item) => sum + (item.views || 0), 0);
    const avgViews = total > 0 ? Math.round(totalViews / total) : 0;
    const topNews = [...news]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(item => ({
        title: item.title,
        views: item.views,
      }));

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const totalViewsToday = news
      .filter(item => item.updatedAt >= todayStart && item.updatedAt <= todayEnd)
      .reduce((sum, item) => sum + (item.views || 0), 0);
    const newArticlesToday = news.filter(item => item.createdAt >= todayStart && item.createdAt <= todayEnd).length;

    const dailyViews = [];
    for (let i = 6; i >= 0; i--) {
      const day = subDays(today, i);
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const views = news
        .filter(item => item.updatedAt >= dayStart && item.updatedAt <= dayEnd)
        .reduce((sum, item) => sum + (item.views || 0), 0);
      dailyViews.push({
        date: dayStart.toISOString().slice(0, 10),
        views,
      });
    }

    res.json({
      total,
      totalViews,
      avgViews,
      topNews,
      totalViewsToday,
      newArticlesToday,
      dailyViews,
    });
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