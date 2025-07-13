import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CategoryProductList = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:4000/api/products/category/${categoryName}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, [categoryName]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Products in {categoryName}</h2>

      {products.length === 0 ? (
        <p>No products found in this category.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="border rounded shadow p-4 bg-white">
              <img
                src={`http://localhost:4000/uploads/${product.image}`}
                alt={product.productName}
                className="h-40 w-full object-contain mb-4"
              />
              <h3 className="font-semibold">{product.productName}</h3>
              <p className="text-sm text-gray-600">{product.brand}</p>
              <p className="text-blue-600 font-bold">Rs. {product.salePrice}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryProductList;
