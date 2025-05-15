import { Request, Response } from 'express';
import News from '../models/News';
import { translateText } from '../api/libretranslate';
import { startOfDay, endOfDay, subDays } from 'date-fns';

const LANGS = ['en', 'de', 'es', 'fr', 'it', 'ru', 'ar', 'tr'];

const LIBRETRANSLATE_URL = 'http://localhost:5000/translate';

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
    // Prepare translations for all languages
    const titleTranslations: Record<string, string> = {};
    const contentTranslations: Record<string, string> = {};
    // Use the original for its language
    titleTranslations[originalLang] = title[originalLang];
    contentTranslations[originalLang] = content[originalLang];
    // Translate to other languages
    for (const lang of LANGS) {
      if (lang === originalLang) continue;
      titleTranslations[lang] = await translateText(title[originalLang], originalLang, lang);
      contentTranslations[lang] = await translateText(content[originalLang], originalLang, lang);
    }
    const newsData: any = {
      title: titleTranslations,
      content: contentTranslations,
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
    const { title, content, originalLang } = req.body;
    
    // Get existing news item
    const existingNews = await News.findById(id);
    if (!existingNews) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Prepare update data
    const updateData: any = {};
    
    // Handle title updates - only update provided languages
    if (title) {
      const newTitle = { ...existingNews.title };
      Object.keys(title).forEach(lang => {
        if (title[lang] && LANGS.includes(lang)) {
          newTitle[lang as keyof typeof newTitle] = title[lang];
        }
      });
      updateData.title = newTitle;
    }
    
    // Handle content updates - only update provided languages
    if (content) {
      const newContent = { ...existingNews.content };
      Object.keys(content).forEach(lang => {
        if (content[lang] && LANGS.includes(lang)) {
          newContent[lang as keyof typeof newContent] = content[lang];
        }
      });
      updateData.content = newContent;
    }
    
    // Handle cover image
    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }

    // Ensure originalLang is preserved
    updateData.originalLang = existingNews.originalLang;

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
    
    // For API requests (viewing news), return single language version
    if (req.path.includes('/api/news/')) {
      const lang: keyof typeof news.title = ['en','de','es','fr','it','ru','ar','tr'].includes(langRaw) ? langRaw : 'en';
      return res.json({
        _id: news._id,
        title: news.title[lang] || news.title['en'],
        content: news.content[lang] || news.content['en'],
        coverImage: news.coverImage,
        views: news.views,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt
      });
    }
    
    // For dashboard requests (editing news), return all language versions
    res.json({
      id: news._id,
      title: news.title,
      content: news.content,
      originalLang: news.originalLang,
      coverImage: news.coverImage,
      views: news.views,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt
    });
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
        title: item.title['en'] || Object.values(item.title)[0],
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