// routes/Seller/category.routes.js - Updated with soft delete functionality
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Category from '../../models/Seller/Category.model.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const categoryUploadDir = path.resolve(__dirname, '../../uploads/categories');

if (!fs.existsSync(categoryUploadDir)) {
  fs.mkdirSync(categoryUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, categoryUploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Helper function to delete category image
const deleteCategoryImage = (imagePath) => {
  if (!imagePath) return;
  
  try {
    const fullPath = path.join(process.cwd(), 'uploads', imagePath.replace('/uploads/', ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('✅ Deleted category image:', fullPath);
    }
  } catch (error) {
    console.error('❌ Error deleting category image:', error);
  }
};

// POST - Create Category
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const imagePath = req.file ? `/uploads/categories/${req.file.filename}` : null;

    const newCategory = new Category({
      name,
      description,
      image: imagePath,
    });

    await newCategory.save();
    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory
    });
  } catch (err) {
    console.error('❌ Error creating category:', err);
    
    // Clean up uploaded file on error
    if (req.file) {
      const filePath = path.join(categoryUploadDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    if (err.code === 11000) {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// GET - Get all ACTIVE categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findActive().sort({ createdAt: -1 });
    
    // Add full URLs for images
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const categoriesWithUrls = categories.map(category => ({
      ...category.toObject(),
      image: category.image ? baseUrl + category.image : null
    }));
    
    res.json(categoriesWithUrls);
  } catch (err) {
    console.error('❌ Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET - Get categories in recycle bin
router.get('/recycle-bin', async (req, res) => {
  try {
    const deletedCategories = await Category.findDeleted().sort({ deletedAt: -1 });
    
    // Add full URLs for images
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const categoriesWithUrls = deletedCategories.map(category => ({
      ...category.toObject(),
      image: category.image ? baseUrl + category.image : null
    }));
    
    res.json(categoriesWithUrls);
  } catch (err) {
    console.error('❌ Error fetching deleted categories:', err);
    res.status(500).json({ error: 'Failed to fetch deleted categories' });
  }
});

// GET - Get ACTIVE category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Add full URL for image
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const categoryWithUrl = {
      ...category.toObject(),
      image: category.image ? baseUrl + category.image : null
    };
    
    res.json(categoryWithUrl);
  } catch (err) {
    console.error('❌ Error fetching category:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT - Update Category
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update category fields
    category.name = name;
    category.description = description;

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (category.image) {
        deleteCategoryImage(category.image);
      }
      category.image = `/uploads/categories/${req.file.filename}`;
    }

    await category.save();

    // Add full URL for response
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const categoryWithUrl = {
      ...category.toObject(),
      image: category.image ? baseUrl + category.image : null
    };

    res.json({ 
      message: 'Category updated successfully', 
      category: categoryWithUrl 
    });
  } catch (err) {
    console.error('❌ Error updating category:', err);
    
    // Clean up uploaded file on error
    if (req.file) {
      const filePath = path.join(categoryUploadDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    if (err.code === 11000) {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
});

// DELETE - SOFT DELETE a category (Move to Recycle Bin)
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { deletedBy, reason } = req.body;

    const category = await Category.findById(categoryId);
    if (!category || category.isDeleted) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Soft delete the category
    await category.softDelete(deletedBy || 'Unknown', reason);

    res.json({ 
      message: "Category moved to recycle bin successfully",
      category: {
        _id: category._id,
        name: category.name,
        deletedAt: category.deletedAt,
        deletedBy: category.deletedBy
      }
    });
  } catch (err) {
    console.error("❌ Failed to move category to recycle bin:", err);
    res.status(500).json({ error: "Failed to move category to recycle bin" });
  }
});

// POST - RESTORE a category from Recycle Bin
router.post('/:id/restore', async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category || !category.isDeleted) {
      return res.status(404).json({ error: "Category not found in recycle bin" });
    }

    // Restore the category
    await category.restore();

    res.json({ 
      message: "Category restored successfully",
      category: {
        _id: category._id,
        name: category.name,
        restoredAt: new Date()
      }
    });
  } catch (err) {
    console.error("❌ Failed to restore category:", err);
    res.status(500).json({ error: "Failed to restore category" });
  }
});

// DELETE - PERMANENTLY DELETE a category from Recycle Bin
router.delete('/:id/permanent', async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category || !category.isDeleted) {
      return res.status(404).json({ error: "Category not found in recycle bin" });
    }

    // Delete associated image
    if (category.image) {
      deleteCategoryImage(category.image);
    }

    await Category.findByIdAndDelete(categoryId);

    res.json({ message: "Category permanently deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to permanently delete category:", err);
    res.status(500).json({ error: "Failed to permanently delete category" });
  }
});

// POST - Clear entire category recycle bin
router.post('/recycle-bin/clear', async (req, res) => {
  try {
    const deletedCategories = await Category.findDeleted();
    
    // Delete all associated images
    for (const category of deletedCategories) {
      if (category.image) {
        deleteCategoryImage(category.image);
      }
    }

    // Permanently delete all categories in recycle bin
    const result = await Category.deleteMany({ isDeleted: true });

    res.json({ 
      message: `${result.deletedCount} categories permanently deleted from recycle bin`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("❌ Failed to clear category recycle bin:", err);
    res.status(500).json({ error: "Failed to clear category recycle bin" });
  }
});

export default router;