import React, { useState } from "react";
import "./AddProduct.css";
//await axios.post("http://localhost:5000/api/products", productData);

function AddProduct({ onAdd }) {
  const [product, setProduct] = useState({ name: "", price: "", image: null });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: name === "image" ? URL.createObjectURL(files[0]) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const storedProducts = JSON.parse(localStorage.getItem("products") || "[]");
    localStorage.setItem("products", JSON.stringify([...storedProducts, product]));
    alert("Product added!");
    setProduct({ name: "", price: "", image: null });
  };

  return (
    <div className="add-product">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Product Name" value={product.name} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={product.price} onChange={handleChange} required />
        <input name="image" type="file" accept="image/*" onChange={handleChange} required />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}

export default AddProduct;
