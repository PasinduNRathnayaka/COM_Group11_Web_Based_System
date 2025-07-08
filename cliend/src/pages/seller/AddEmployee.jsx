import React, { useState } from "react";

/**
 * -----------------------------------------------------------------------------
 * AddEmployeeForm.jsx – Stand‑alone employee creation form with category/role
 * dropdown that allows creation of a new category (incl. image upload).
 * -----------------------------------------------------------------------------
 */

const AddEmployeeForm = () => {
  /* ──────────────────────────────── state ──────────────────────────────── */
  const [form, setForm] = useState({
    employeeId: `EMP-${Math.floor(100000 + Math.random() * 900000)}`,
    name: "",
    about: "",
    category: "",
    contact: "",
    rate: "",
    address: "",
    username: "",
    password: "",
    confirmPassword: "",
    imagePreview: null,
    gallery: [],
  });

  const [categories, setCategories] = useState(["Mechanic", "Electrician", "Sales"]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  /* ───────────────────────────── handlers ─────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) { setForm((p) => ({ ...p, imagePreview: URL.createObjectURL(file) })); }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    setForm((p) => ({ ...p, gallery: [...p.gallery, ...files] }));
  };

  const addNewCategory = () => {
    if (newCatName.trim()) {
      setCategories([...categories, newCatName]);
      setForm((p) => ({ ...p, category: newCatName }));
      setNewCatName("");
      setShowCatModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Employee submitted", form);
  };

  /* ───────────────────────────────── JSX ───────────────────────────────── */
  return (
    <div className="bg-[#f3f3f3] min-h-screen p-6">
    
      
    </div>
  );
};

export default AddEmployeeForm;
