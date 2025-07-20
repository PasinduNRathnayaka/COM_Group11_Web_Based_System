export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      productId,
      productName,
      description,
      category,
      brand,
      code,
      stock,
      regularPrice,
      salePrice,
      tags,
    } = req.body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) return res.status(404).json({ error: 'Product not found' });

    // Handle image update
    if (req.file) {
      // Delete old image
      if (existingProduct.image) {
        const oldImagePath = path.join('backend', existingProduct.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }

      // Save new image
      existingProduct.image = `/uploads/employees/Product/${req.file.filename}`;
    }

    // Update product fields
    existingProduct.productId = productId;
    existingProduct.productName = productName;
    existingProduct.description = description;
    existingProduct.category = category;
    existingProduct.brand = brand;
    existingProduct.code = code;
    existingProduct.stock = Number(stock);
    existingProduct.regularPrice = Number(regularPrice);
    existingProduct.salePrice = Number(salePrice);
    existingProduct.tags = tags;

    // Regenerate QR if productId changed
    const newQRFilename = `${productId}-qr.png`;
    const newQRPath = await generateQR(`Product ID: ${productId}`, newQRFilename, 'Product');
    existingProduct.qrPath = newQRPath;

    await existingProduct.save();

    res.json({ message: 'Product updated successfully', product: existingProduct });
  } catch (err) {
    console.error('❌ Error updating product:', err.message);
    res.status(500).json({ error: 'Failed to update product' });
  }
};
