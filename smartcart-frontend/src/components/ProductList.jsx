import React, { useEffect, useState } from "react";
import "./ProductList.css";

function ProductList({ onAddToCart }) {

    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    const categories = [
        "All",
        "Mobiles",
        "Fashion",
        "Electronics",
        "Gaming",
        "Kitchen",
        "Home Essentials"
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(
                "https://smartcart-backend-lm1p.onrender.com/api/products"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }

            const data = await response.json();
            setProducts(data);

        } catch (error) {
            console.error("Product fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter((product) => {

        const matchesSearch =
            product.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            product.category
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="product-page">

            {/* Search */}

            <div className="product-search-section">

                <div className="product-search-box">

                    <span>🔍</span>

                    <input
                        type="text"
                        placeholder="Search for products, brands and more..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />

                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                        >
                            ✕
                        </button>
                    )}

                </div>

            </div>

            {/* Categories */}

            <div className="category-bar">

                {categories.map((category) => (

                    <button
                        key={category}
                        className={
                            selectedCategory === category
                                ? "category-btn active"
                                : "category-btn"
                        }
                        onClick={() =>
                            setSelectedCategory(category)
                        }
                    >
                        {category}
                    </button>

                ))}

            </div>

            {/* Heading */}

            <div className="products-heading">

                <div>
                    <h1>Products</h1>

                    <p>
                        {filteredProducts.length} products found
                    </p>
                </div>

                {(searchTerm ||
                    selectedCategory !== "All") && (

                    <button
                        className="clear-filter-btn"
                        onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("All");
                        }}
                    >
                        Clear Filters
                    </button>

                )}

            </div>

            {/* Products */}

            {loading ? (

                <div className="product-loading">
                    Loading products...
                </div>

            ) : filteredProducts.length === 0 ? (

                <div className="no-products">

                    <div>🔍</div>

                    <h2>No Products Found</h2>

                    <p>
                        Try another product name or category.
                    </p>

                </div>

            ) : (

                <div className="product-grid">

                    {filteredProducts.map((product) => (

                        <div
                            className="product-card"
                            key={product.id}
                        >

                            {/* Product Image */}

                            <div className="product-image-container">

                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                />

                            </div>

                            <div className="product-info">

                                {/* Category */}

                                <span className="product-category">
                                    {product.category}
                                </span>

                                {/* Product Name */}

                                <h3>
                                    {product.name}
                                </h3>

                                {/* Description */}

                                <p className="product-description">
                                    {product.description}
                                </p>

                                {/* Stock */}

                                <div className="stock-info">

                                    {product.quantity > 0 ? (

                                        <span className="in-stock">
                                            Stock: {product.quantity}
                                        </span>

                                    ) : (

                                        <span className="out-of-stock">
                                            Out of Stock
                                        </span>

                                    )}

                                </div>

                                {/* Price + Cart */}

                                <div className="product-bottom">

                                    <strong>
                                        ₹{Number(
                                            product.price
                                        ).toLocaleString("en-IN")}
                                    </strong>

                                    <button
                                        className="add-cart-btn"
                                        onClick={() =>
                                            onAddToCart(product)
                                        }
                                        disabled={product.quantity <= 0}
                                    >
                                        {product.quantity > 0
                                            ? "Add to Cart"
                                            : "Out of Stock"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default ProductList;