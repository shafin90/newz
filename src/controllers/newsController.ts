import { Request, Response } from 'express';
import News from '../models/News';

export const getAllNews = async (req: Request, res: Response) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createNews = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const news = new News({ title, content });
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
    const news = await News.findByIdAndUpdate(
      id,
      { title, content },
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