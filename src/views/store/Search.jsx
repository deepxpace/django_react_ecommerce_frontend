import { useEffect, useState, useContext } from "react";
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";

import apiInstance from "../../utils/axios";
import GetCurrentAddress from "../plugin/UserCountry";
import UserData from "../plugin/UserData";
import CartID from "../plugin/CartID";
import { CartContext } from "../plugin/Context";
import ProductImage from "../../components/ProductImage";

import { Toast, AlertFailed } from "../base/Alert";

function Search() {
  // Initialization for Products and Category
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Color Selector and Picker
  const [selectedColors, setSelectedColors] = useState({});

  // Variations Selector and Picker
  const [selectedSizes, setSelectedSizes] = useState({});

  // Quantity Value
  const [qtyValues, setQtyValues] = useState({});

  // Selected Product
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const currentAddress = GetCurrentAddress();
  const userData = UserData();
  const cartID = CartID();

  const [query, setQuery] = useState(searchParams.get("query") || "");

  const categoryFromUrl = searchParams.get("category");

  const handleSizeButton = (productId, sizeName) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeName }));
  };

  const handleColorButton = (productId, colorName) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: colorName }));
  };

  const handleQtyChange = (event, productId) => {
    const newQty = parseInt(event.target.value, 10) || 1;
    setQtyValues((prev) => ({
      ...prev,
      [productId]: newQty,
    }));
    setSelectedProduct(productId);
  };

  const handleAddToCart = async (
    productId,
    price,
    shippingAmount,
    hasVariations,
    product
  ) => {
    try {
      const formData = new FormData();
      const qty = hasVariations ? qtyValues[productId] || 1 : 1;

      // Validate required selections
      const missing = [];
      if (product.size?.length > 0 && !selectedSizes[productId])
        missing.push("size");
      if (product.color?.length > 0 && !selectedColors[productId])
        missing.push("color");

      if (missing.length > 0) {
        AlertFailed.fire({
          icon: "error",
          title: `Please select: ${missing.join(" and ")}`,
        });
        return;
      }

      formData.append("product_id", productId);
      formData.append("user_id", userData?.user_id);
      formData.append("qty", qty);
      formData.append("price", price);
      formData.append("shipping_amount", shippingAmount);
      formData.append("country", currentAddress.country);
      formData.append("size", selectedSizes[productId] || "");
      formData.append("color", selectedColors[productId] || "");
      formData.append("cart_id", cartID);

      const response = await apiInstance.post("cart-view/", formData);

      // Alert the user that they have successfully add product to cart
      Toast.fire({
        icon: "success",
        title: response.data.message,
      });
    } catch (error) {
      AlertFailed.fire({
        icon: "error",
        title: "Failed to add to cart. Please try again",
      });
    }
  };

  // Initialize default selections when products load
  useEffect(() => {
    const initialSizes = {};
    const initialColors = {};

    products?.forEach((p) => {
      if (p.size?.length > 0) initialSizes[p.id] = p.size[0].name;
      if (p.color?.length > 0) initialColors[p.id] = p.color[0].name;
    });

    setSelectedSizes(initialSizes);
    setSelectedColors(initialColors);
  }, [products]);

  // Search & Filter States
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    priceRange: { min: "", max: "" },
    sort: "newest",
    inStock: false,
  });

  useEffect(() => {
    apiInstance.get("category/").then((res) => {
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setFilters((prev) => ({
        ...prev,
        category: categoryFromUrl,
      }));
    }
  }, [searchParams]);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      const params = new URLSearchParams();

      if (query) params.set("query", query);
      if (filters.category) params.set("category", filters.category);
      if (filters.priceRange.min)
        params.set("min_price", filters.priceRange.min);
      if (filters.priceRange.max)
        params.set("max_price", filters.priceRange.max);
      if (filters.sort !== "newest") params.set("sort", filters.sort);
      if (filters.inStock) params.set("in_stock", "true");

      try {
        const res = await apiInstance.get(`search/?${params.toString()}`);
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [query, filters]);

  // Modified handleFilterChange to handle category changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));

    // Update URL for filters
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(filterType, value);
    } else {
      params.delete(filterType);
    }
    setSearchParams(params);
  };

  useEffect(() => {
    if (searchParams.get("clear")) {
      setFilters({
        category: "",
        priceRange: { min: "", max: "" },
        sort: "newest",
        inStock: false,
      });
      setQuery("");

      // Reset URL to clean state without `clear=true`
      setSearchParams(new URLSearchParams());
    }
  }, [searchParams]);

  // Modified clearFilters to properly reset everything
  const clearFilters = () => {
    setFilters({
      category: "",
      priceRange: { min: "", max: "" },
      sort: "newest",
      inStock: false,
    });
    setQuery("");

    setSearchParams(new URLSearchParams());
  };

  const resetQuery = async () => {
    try {
      let endpoint = "search/?";
      const params = new URLSearchParams();

      // If a category is selected, keep it when showing all products
      if (filters.category) {
        params.append("category", filters.category);
        // Keep other filters if category is selected
        if (filters.priceRange.min)
          params.append("min_price", filters.priceRange.min);
        if (filters.priceRange.max)
          params.append("max_price", filters.priceRange.max);
        if (filters.sort !== "newest") params.append("sort", filters.sort);
        if (filters.inStock) params.append("in_stock", filters.inStock);
      }

      // Clear the search query from URL while maintaining other params
      setSearchParams(params);

      // Fetch products based on whether category is selected or not
      const response = await apiInstance.get(`${endpoint}${params}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Handle error appropriately
    }
  };

  return (
    <div>
      <main className="mt-3">
        <div className="container">
          {/* Search Bar and Sort Section */}
          <div className="mb-4">
            <div className="row align-items-center">
              <div className="col-md-6 mb-3 mb-md-0">
                <div className="input-group">
                  <span className="me-2">You Search for:</span>
                  <input
                    type="text"
                    className="border-0 bg-transparent"
                    placeholder=""
                    value={searchParams.get("query") || ""}
                    onChange={(e) => setSearchParams({ query: e.target.value })}
                    disabled // This disables the input
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex justify-content-md-end">
                  <select
                    className="form-select w-auto"
                    value={filters.sort}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                  >
                    <option value="" disabled>
                      Choose a sorting option
                    </option>
                    {/* <option value="newest">Newest First</option> */}
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Filters Sidebar */}
            <div
              className="col-lg-3 col-xl-2 mb-4 d-block d-md-inline"
              style={{ fontSize: "12px" }}
            >
              {/* Desktop Filters Sidebar */}
              <div className="card border-light d-none d-md-block">
                <div className="card-body">
                  <h5 className="card-title mb-4">Filters</h5>

                  {/* Categories */}
                  <div className="mb-4">
                    <h6>Categories</h6>
                    <select
                      className="form-select"
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Choose a category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="mb-4">
                    <h6>Price Range</h6>
                    <div className="d-flex gap-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Min"
                        value={filters.priceRange.min}
                        onChange={(e) =>
                          handleFilterChange("priceRange", {
                            ...filters.priceRange,
                            min: e.target.value,
                          })
                        }
                      />
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Max"
                        value={filters.priceRange.max}
                        onChange={(e) =>
                          handleFilterChange("priceRange", {
                            ...filters.priceRange,
                            max: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Stock Filter */}
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) =>
                          handleFilterChange("inStock", e.target.checked)
                        }
                      />
                      <p
                        className="form-check-label"
                        style={{
                          fontSize: "14px",
                        }}
                      >
                        In Stock Only
                      </p>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <button
                    className="btn btn-outline-dark w-100"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>

                  <button
                    className="btn btn-warning w-100 mt-3"
                    onClick={resetQuery}
                  >
                    Show All Products
                  </button>
                </div>
              </div>

              <style>
                {`
            .accordion-button {
              padding: 1rem 0;
            }
            .accordion-button:not(.collapsed) {
              background-color: white !important;
              color: inherit !important;
              box-shadow: none !important;
            }
            .accordion-button:focus {
              box-shadow: none !important;
              border-color: rgba(0,0,0,.125) !important;
            }
            .accordion-button:hover {
              background-color: white !important;
            }
            .accordion-button.collapsed {
              background-color: white !important;
            }
            .accordion-button::after {
              background-size: 12px !important;
            }
            .accordion .accordion-body {
              padding: 1rem 0;
            }
                  `}
              </style>

              {/* Mobile/Tablet Accordion */}
              <div className="d-block d-md-none">
                <div className="accordion" id="filterAccordion">
                  <div className="accordion-item border-0">
                    <h2 className="accordion-header" id="headingOne">
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseCategories"
                        aria-expanded="true"
                        aria-controls="collapseCategories"
                      >
                        Categories
                      </button>
                    </h2>
                    <div
                      id="collapseCategories"
                      className="accordion-collapse collapse show"
                      aria-labelledby="headingOne"
                      data-bs-parent="#filterAccordion"
                    >
                      <div className="accordion-body">
                        <select
                          className="form-select"
                          value={filters.category}
                          onChange={(e) =>
                            handleFilterChange("category", e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Choose a category
                          </option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item border-0">
                    <h2 className="accordion-header" id="headingTwo">
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsePriceRange"
                        aria-expanded="false"
                        aria-controls="collapsePriceRange"
                      >
                        Price Range
                      </button>
                    </h2>
                    <div
                      id="collapsePriceRange"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingTwo"
                      data-bs-parent="#filterAccordion"
                    >
                      <div className="accordion-body">
                        <div className="d-flex gap-2">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Min"
                            value={filters.priceRange.min}
                            onChange={(e) =>
                              handleFilterChange("priceRange", {
                                ...filters.priceRange,
                                min: e.target.value,
                              })
                            }
                          />
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Max"
                            value={filters.priceRange.max}
                            onChange={(e) =>
                              handleFilterChange("priceRange", {
                                ...filters.priceRange,
                                max: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item border-0">
                    <h2 className="accordion-header" id="headingThree">
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseStock"
                        aria-expanded="false"
                        aria-controls="collapseStock"
                      >
                        Stock Filter
                      </button>
                    </h2>
                    <div
                      id="collapseStock"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingThree"
                      data-bs-parent="#filterAccordion"
                    >
                      <div className="accordion-body">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={filters.inStock}
                            onChange={(e) =>
                              handleFilterChange("inStock", e.target.checked)
                            }
                          />
                          <p
                            className="form-check-label"
                            style={{
                              fontSize: "14px",
                            }}
                          >
                            In Stock Only
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters and Show All */}
                  <div className="mt-2">
                    <button
                      className="btn btn-outline-dark w-100"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </button>
                    <button
                      className="btn btn-warning w-100 mt-3"
                      onClick={resetQuery}
                    >
                      Show All Products
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="col-lg-9 col-xl-10">
              <section className="h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="m-0">Search Results</h4>
                  <span className="text-muted">
                    {products.length} products found
                  </span>
                </div>

                <div className="row row-cols-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3">
                  {products?.map((p, index) => (
                    <div className="col-lg-4 col-md-6 mb-2" key={index}>
                      <div className="card h-100 border shadow-sm">
                        <Link to={`/detail/${p.slug}/`}>
                          <div className="ratio ratio-4x3 p-2">
                            <ProductImage
                              src={p.image}
                              className="card-img-top object-fit-contain"
                              alt={p.title}
                            />
                          </div>
                        </Link>
                        <div className="card-body d-flex flex-column">
                          <Link
                            className="text-decoration-none"
                            to={`/detail/${p.slug}/`}
                          >
                            <h5
                              className="card-title mb-3 text-dark"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {p.title}
                            </h5>
                          </Link>
                          <a href="" className="text-reset">
                            <p>{p.category?.title}</p>
                          </a>
                          <h6 className="mb-3 mt-auto">
                            <s>${p.old_price}</s>
                            <strong className="ms-2 text-danger">
                              ${p.price}
                            </strong>
                          </h6>
                          <div className="mt-auto">
                            {/* Variations Dropdown */}
                            <div className="btn-group">
                              {p.size?.length > 0 || p.color?.length > 0 ? (
                                <>
                                  <div className="d-flex">
                                    <button
                                      className="btn btn-warning dropdown-toggle flex-grow d-flex"
                                      type="button"
                                      id="dropdownMenuClickable"
                                      data-bs-toggle="dropdown"
                                      data-bs-auto-close="outside"
                                      aria-expanded="false"
                                      style={{
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        width: "100%",
                                      }}
                                    >
                                      <span className="me-1">Select</span>
                                    </button>
                                    <ul
                                      className="dropdown-menu p-3"
                                      aria-labelledby="dropdownMenuClickable"
                                      style={{
                                        width: "280px",
                                      }}
                                    >
                                      {/* Quantity Section */}
                                      <div className="mb-3">
                                        <label className="form-label">
                                          <b>Quantity</b>
                                        </label>
                                        <input
                                          className="form-control"
                                          min={1}
                                          type="number"
                                          placeholder="1"
                                          onChange={(e) =>
                                            handleQtyChange(e, p.id)
                                          }
                                        />
                                      </div>

                                      {/* Variations or Size Options Section */}
                                      {p.size?.length > 0 && (
                                        <div className="mb-3">
                                          <label className="form-label">
                                            <b>Variation: </b>
                                            {selectedSizes[p.id] ||
                                              "Select one"}
                                          </label>
                                          <div className="d-flex flex-wrap gap-2">
                                            {p.size?.map((size, index) => (
                                              <button
                                                key={index}
                                                className={`btn btn-sm ${
                                                  selectedSizes[p.id] ===
                                                  size.name
                                                    ? "btn-warning"
                                                    : "btn-outline-secondary"
                                                }`}
                                                onClick={() => {
                                                  handleSizeButton(
                                                    p.id,
                                                    size.name
                                                  );
                                                }}
                                              >
                                                {size.name}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Color Options Section */}
                                      {p.color?.length > 0 && (
                                        <div className="mb-3">
                                          <label className="form-label">
                                            <b>Color: </b>
                                            {selectedColors[p.id] ||
                                              "Select one"}{" "}
                                          </label>
                                          <div className="d-flex flex-wrap gap-2">
                                            {p.color?.map((color, index) => (
                                              <button
                                                key={index}
                                                className={`btn rounded-circle border p-0 ${
                                                  selectedColors[p.id] ===
                                                  color.name
                                                    ? "border-warning border-3"
                                                    : ""
                                                }`}
                                                style={{
                                                  width: "30px",
                                                  height: "30px",
                                                  backgroundColor:
                                                    color.color_code,
                                                }}
                                                onClick={() =>
                                                  handleColorButton(
                                                    p.id,
                                                    color.name
                                                  )
                                                }
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Action Buttons */}
                                      <div className="d-flex mt-3">
                                        <button
                                          type="button"
                                          className="btn btn-warning flex-grow-1 me-2"
                                          onClick={() =>
                                            handleAddToCart(
                                              p.id,
                                              p.price,
                                              p.shipping_amount,
                                              true,
                                              p
                                            )
                                          }
                                        >
                                          <i className="fas fa-shopping-cart me-2" />
                                          Add to Cart
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-dark px-3"
                                        >
                                          <i className="fas fa-heart" />
                                        </button>
                                      </div>
                                    </ul>
                                    <button
                                      type="button"
                                      className="btn btn-dark px-3 ms-2"
                                    >
                                      <i className="fas fa-heart" />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="d-flex">
                                    <button
                                      type="button"
                                      className="btn btn-warning flex-grow-1 me-2"
                                      onClick={() =>
                                        handleAddToCart(
                                          p.id,
                                          p.price,
                                          p.shipping_amount,
                                          false,
                                          p
                                        )
                                      }
                                    >
                                      <i className="fas fa-shopping-cart me-2" />
                                      <span className="d-none d-sm-inline">
                                        Add to Cart
                                      </span>
                                    </button>

                                    <button
                                      type="button"
                                      className="btn btn-dark px-3"
                                    >
                                      <i className="fas fa-heart" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Search;
