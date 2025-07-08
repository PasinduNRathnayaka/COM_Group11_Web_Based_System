import React, { useState } from "react";

/**
 * -----------------------------------------------------------------------------
 * AddProductForm.jsx – Stand‑alone product creation form with dynamic category
 * management (dropdown + “Add new Category” modal with image upload).
 * TailwindCSS for styling. No sidebar / header in this file.
 * -----------------------------------------------------------------------------
 */

const AddProductForm = () => {
  /* ────────────────────────────────── state ────────────────────────────────── */
  const [form, setForm] = useState({
    productId: `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
    productName: "",
    description: "",
    category: "",
    brand: "",
    code: "",
    stock: "",
    regularPrice: "",
    salePrice: "",
    tags: "",
    imagePreview: null,
    gallery: [],
  });

  const [categories, setCategories] = useState(["Battery", "Filter", "Oil"]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState(null);

  /* ─────────────────────────────── handlers ──────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleMainImgUpload = (e) => {
    const file = e.target.files[0];
    file && setForm((p) => ({ ...p, imagePreview: URL.createObjectURL(file) }));
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    setForm((p) => ({ ...p, gallery: [...p.gallery, ...files] }));
  };

  const addNewCategory = () => {
    if (newCatName.trim()) {
      setCategories((prev) => [...prev, newCatName]);
      setForm((p) => ({ ...p, category: newCatName }));
      setNewCatName("");
      setNewCatImage(null);
      setShowCatModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Product submitted", form);
    // TODO: backend integration
  };

  /* ────────────────────────────────── JSX ─────────────────────────────────── */
  return (
    <div className="bg-[#f3f3f3] min-h-screen p-6">
     
    </div>
  );
};

export default AddProductForm;
