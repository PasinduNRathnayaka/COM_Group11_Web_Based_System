import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../../components/seller/ProductCard"; // Adjust path as needed

const CategoryProductList = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:4000/api/products/category/${categoryName}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, [categoryName]);

  const handleEdit = (product) => {
    console.log("Edit clicked for:", product);
    // Navigate or open modal
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Products in {categoryName}</h2>

      {products.length === 0 ? (
        <p className="text-gray-600">No products found in this category.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryProductList;
