import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from '../../models/Seller/Category.model.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

/** --- POST: Create New Category --- */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const newCategory = new Category({ name, image });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

/** --- PUT: Update Existing Category --- */
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const updateData = { name };

    if (req.file) {
      updateData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(updatedCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

/** --- GET: Fetch All Categories --- */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
