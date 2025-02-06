import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import apiInstance from "../../utils/axios";
import { Toast, AlertFailed } from "../base/Alert";

const Shop = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    category: "",
    priceRange: "",
    rating: "",
    inStock: false,
    sortBy: "newest",
    featured: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Enhanced fetch with error handling
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        const [shopRes, productsRes] = await Promise.all([
          apiInstance.get(`shop/${slug}/`),
          apiInstance.get(`vendor-products/${slug}/`),
        ]);
        setShop(shopRes.data);
        setProducts(productsRes.data);

        // Set initial price range based on products
        const prices = productsRes.data.map((p) => parseFloat(p.price));
        setPriceRange({
          min: Math.floor(Math.min(...prices)),
          max: Math.ceil(Math.max(...prices)),
        });
      } catch (error) {
        AlertFailed(error.message || "Failed to fetch shop data");
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [slug]);

  // Enhanced categories with counts
  const categories = useMemo(() => {
    const categoryMap = products.reduce((acc, product) => {
      const category = product.category.title;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(categoryMap).map(([title, count]) => ({
      title,
      count,
    }));
  }, [products]);

  // Price stats
  const priceStats = useMemo(() => {
    const prices = products.map((p) => parseFloat(p.price));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
    };
  }, [products]);

  // Enhanced filtering with multiple criteria
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes(product.category.title);

        const matchesPrice =
          parseFloat(product.price) >= priceRange.min &&
          parseFloat(product.price) <= priceRange.max;

        const matchesRating = filters.rating
          ? product.rating >= parseInt(filters.rating)
          : true;

        const matchesStock = filters.inStock ? product.in_stock : true;

        const matchesFeatured = filters.featured ? product.featured : true;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesPrice &&
          matchesRating &&
          matchesStock &&
          matchesFeatured
        );
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "price-asc":
            return parseFloat(a.price) - parseFloat(b.price);
          case "price-desc":
            return parseFloat(b.price) - parseFloat(a.price);
          case "rating":
            return (b.product_rating || 0) - (a.product_rating || 0);
          case "popularity":
            return b.views - a.views;
          case "orders":
            return b.orders - a.orders;
          case "oldest":
            return new Date(a.date) - new Date(b.date);
          default: // newest
            return new Date(b.date) - new Date(a.date);
        }
      });
  }, [products, filters, searchQuery, priceRange, selectedCategories]);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      category: "",
      priceRange: "",
      rating: "",
      inStock: false,
      sortBy: "newest",
      featured: false,
    });
    setSearchQuery("");
    setPriceRange({ min: priceStats.min, max: priceStats.max });
    setSelectedCategories([]);
    setCurrentPage(1);
  };

  // Toggle category selection
  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-dark mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading shop data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container py-4">
      {/* Shop Header with enhanced styling */}
      <div className="">
        <div className="card border mb-4 overflow-hidden">
          <div className="card-body p-4">
            <div className="row align-items-center gy-4">
              <div className="col-lg-3 text-center text-lg-start">
                <img
                  src={shop?.image}
                  className="rounded img-thumbnail"
                  style={{
                    width: "180px",
                    height: "180px",
                    objectFit: "cover",
                  }}
                  alt={shop?.name}
                />
              </div>
              <div className="col-lg-6">
                <h2 className="fw-bold mb-3">{shop?.name}</h2>
                <p className="text-muted mb-4">{shop?.description}</p>
                <div className="d-flex flex-wrap gap-4 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-telephone me-2"></i>
                    <span className="">{shop?.mobile}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-envelope me-2"></i>
                    <span className="">{shop?.user.email}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-calendar-check me-2"></i>
                    <span className="">
                      Member since {new Date(shop?.date).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Statistics */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card border h-100">
              <div className="card-body">
                <h6 className="text-muted mb-2">Total Products</h6>
                <h3 className="mb-0">{products.length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card borderh-100">
              <div className="card-body">
                <h6 className="text-muted mb-2">Categories</h6>
                <h3 className="mb-0">{categories.length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border h-100">
              <div className="card-body">
                <h6 className="text-muted mb-2">Average Price</h6>
                <h3 className="mb-0">${priceStats.avg.toFixed(2)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border h-100">
              <div className="card-body">
                <h6 className="text-muted mb-2">Active Since</h6>
                <h3 className="mb-0">{new Date(shop?.date).getFullYear()}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="card border mb-4">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search products by name or description..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Best Rating</option>
                  <option value="popularity">Most Popular</option>
                  <option value="orders">Most Orders</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filters.rating}
                  onChange={(e) =>
                    setFilters({ ...filters, rating: e.target.value })
                  }
                >
                  <option value="">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
              <div className="col-md-4 d-flex gap-2 align-items-center">
                <button
                  className={`btn btn-outline-light text-dark ${
                    viewMode === "grid" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  <i className="bi bi-grid-3x3-gap-fill"></i>
                </button>
                <button
                  className={`btn btn-outline-light text-dark ${
                    viewMode === "list" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  <i className="bi bi-list-ul"></i>
                </button>
                <button
                  className="btn btn-light"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="bi bi-funnel-fill me-2"></i>
                  Filters
                </button>
                <button
                  className="btn btn-danger ms-auto"
                  onClick={handleResetFilters}
                >
                  <i className="bi bi-x-circle-fill me-2"></i>
                  Reset
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="border-top mt-4 pt-4">
                <div className="row g-4">
                  <div className="col-md-4">
                    <h6 className="mb-3">Categories</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {categories.map(({ title, count }) => (
                        <button
                          key={title}
                          className={`btn btn-sm ${
                            selectedCategories.includes(title)
                              ? "btn-warning"
                              : "btn-outline-light text-dark"
                          }`}
                          onClick={() => handleCategoryToggle(title)}
                        >
                          {title} ({count})
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <h6 className="mb-3">Price Range</h6>
                    <div className="row g-2">
                      <div className="col-6">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) =>
                            setPriceRange({
                              ...priceRange,
                              min: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) =>
                            setPriceRange({
                              ...priceRange,
                              max: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <h6 className="mb-3">Additional Filters</h6>
                    <div className="d-flex flex-column gap-2">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="inStock"
                          checked={filters.inStock}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              inStock: e.target.checked,
                            })
                          }
                        />
                        <label className="form-check-label" htmlFor="inStock">
                          In Stock Only
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="featured"
                          checked={filters.featured}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              featured: e.target.checked,
                            })
                          }
                        />
                        <label className="form-check-label" htmlFor="featured">
                          Featured Products
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategories.length > 0 ||
          filters.inStock ||
          filters.featured ||
          filters.rating ||
          searchQuery) && (
          <div className="mb-4">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <span className="text-muted">Active Filters:</span>
              {selectedCategories.map((category) => (
                <span key={category} className="badge btn btn-warning">
                  {category}
                  <button
                    className="btn btn-link text-white p-0 ms-2"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                </span>
              ))}
              {filters.inStock && (
                <span className="badge btn btn-dark">
                  In Stock Only
                  <button
                    className="btn btn-link text-white p-0 ms-2"
                    onClick={() => setFilters({ ...filters, inStock: false })}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                </span>
              )}
              {filters.featured && (
                <span className="badge bg-warning">
                  Featured Only
                  <button
                    className="btn btn-link text-white p-0 ms-2"
                    onClick={() => setFilters({ ...filters, featured: false })}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                </span>
              )}
              {filters.rating && (
                <span className="badge bg-info">
                  {filters.rating}+ Stars
                  <button
                    className="btn btn-link text-white p-0 ms-2"
                    onClick={() => setFilters({ ...filters, rating: "" })}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="badge bg-secondary">
                  Search: {searchQuery}
                  <button
                    className="btn btn-link text-white p-0 ms-2"
                    onClick={() => setSearchQuery("")}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">
            {filteredProducts.length} Product
            {filteredProducts.length !== 1 ? "s" : ""} Found
            {searchQuery && ` for "${searchQuery}"`}
          </h5>
          <div className="text-muted">
            Showing {indexOfFirstProduct + 1}-
            {Math.min(indexOfLastProduct, filteredProducts.length)} of{" "}
            {filteredProducts.length}
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-search display-1 text-muted mb-4"></i>
            <h3>No Products Found</h3>
            <p className="text-muted">
              Try adjusting your search or filter criteria
            </p>
            <button className="btn btn-warning" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "row g-4" : ""}>
            {currentProducts.map((product) =>
              viewMode === "grid" ? (
                <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                  <div className="card h-100 border">
                    <div className="position-relative">
                      <img
                        src={product.image}
                        className="card-img-top"
                        style={{ height: "250px", objectFit: "contain" }}
                        alt={product.title}
                      />
                      <div className="position-absolute top-0 start-0 px-3 pt-2">
                        {product.featured && (
                          <span className="badge bg-warning mb-2">
                            <i className="bi bi-star-fill me-1"></i>
                            Featured
                          </span>
                        )}
                        {parseFloat(product.old_price) >
                          parseFloat(product.price) && (
                          <div className="d-block">
                            <span className="badge bg-danger">
                              <i className="bi bi-tag-fill me-1"></i>
                              Sale
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-light text-dark">
                          {product.category.title}
                        </span>
                        <small className="d-flex align-items-center">
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          <span className="pt-1">
                            {product.product_rating?.toFixed(1) || "N/A"}
                          </span>
                        </small>
                      </div>
                      <h6 className="card-title mb-3">
                        <Link
                          to={`/product/${product.slug}`}
                          className="text-decoration-none text-dark"
                        >
                          {product.title}
                        </Link>
                      </h6>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <span className="h5 text-dark mb-0">
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                          {product.old_price && (
                            <span className="text-muted text-decoration-line-through ms-2">
                              ${parseFloat(product.old_price).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <small
                          className={`badge ${
                            product.in_stock ? "bg-dark" : "bg-danger"
                          }`}
                        >
                          {product.in_stock ? "In Stock" : "Out of Stock"}
                        </small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-cart-check me-1"></i>
                          <span>{product.orders} orders</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-eye me-1"></i>
                          <span>{product.views} views</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer bg-white p-4 border-top-0">
                      <div className="d-grid gap-2">
                        <Link
                          to={`/detail/${product.slug}`}
                          className="btn btn-warning"
                        >
                          <i className="bi bi-cart-plus me-2"></i>
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={product.id} className="card mb-4 border">
                  <div className="row g-0">
                    <div className="col-md-3">
                      <img
                        src={product.image}
                        className="img-fluid rounded-start h-100"
                        style={{ objectFit: "cover" }}
                        alt={product.title}
                      />
                    </div>
                    <div className="col-md-9">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <div className="d-flex gap-2 mb-2">
                              <span className="badge bg-light text-dark">
                                {product.category.title}
                              </span>
                              {product.featured && (
                                <span className="badge bg-warning">
                                  <i className="bi bi-star-fill me-1"></i>
                                  Featured
                                </span>
                              )}
                              {product.in_stock ? (
                                <span className="badge bg-dark">In Stock</span>
                              ) : (
                                <span className="badge bg-danger">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                            <h4 className="card-title mb-0">
                              <Link
                                to={`/product/${product.slug}`}
                                className="text-decoration-none text-dark"
                              >
                                {product.title}
                              </Link>
                            </h4>
                          </div>
                          <div className="text-end">
                            <div className="h4 text-dark mb-0">
                              ${parseFloat(product.price).toFixed(2)}
                            </div>
                            {product.old_price && (
                              <div className="text-muted text-decoration-line-through">
                                ${parseFloat(product.old_price).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="card-text text-muted mb-4">
                          {product.description}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-4">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-star-fill text-warning me-2"></i>
                              <span>
                                {product.product_rating?.toFixed(1) || "N/A"}
                              </span>
                            </div>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-cart-check me-2"></i>
                              <span>{product.orders} Orders</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-eye me-2"></i>
                              <span>{product.views} Views</span>
                            </div>
                          </div>
                          <Link
                            to={`/detail/${product.slug}`}
                            className="btn btn-warning"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        <br></br>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <nav className="mt-4 text-dark">
            <ul className="pagination justify-content-center">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                style={{ backgroundColor: currentPage === 1 ? "#343a40" : "" }} // bg-dark ketika disabled
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    color: "white",
                    backgroundColor: "#343a40",
                    border: "none",
                  }} // bg-dark untuk tombol
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li
                  key={index + 1}
                  className={`page-item ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                  style={{
                    backgroundColor: currentPage === index + 1 ? "#343a40" : "", // bg-dark saat aktif
                  }}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(index + 1)}
                    style={{
                      color: currentPage === index + 1 ? "white" : "#6c757d", // text-color: white saat aktif
                      backgroundColor:
                        currentPage === index + 1 ? "#343a40" : "", // bg-dark saat aktif
                      border: "none",
                    }}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
                style={{
                  backgroundColor: currentPage === totalPages ? "#343a40" : "",
                }} // bg-dark saat disabled
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    color: "white",
                    backgroundColor: "#343a40",
                    border: "none",
                  }} // bg-dark untuk tombol
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </main>
  );
};

export default Shop;
