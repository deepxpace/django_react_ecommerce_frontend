import React, { useState, useEffect, useMemo } from "react";
import apiInstance from "../../utils/axios";
import Sidebar from "./Sidebar";
import UserData from "../plugin/UserData";
import moment from "moment";

import { Toast, AlertFailed } from "../base/Alert";
import { Link, useNavigate, useParams } from "react-router-dom";

function UpdateProduct() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("details");

  const userData = UserData();
  const param = useParams();

  const [product, setProduct] = useState([]);

  const [specifications, setSpecifications] = useState([
    {
      title: "",
      content: "",
    },
  ]);

  const [colors, setColors] = useState([
    {
      name: "",
      color_code: "",
    },
  ]);

  const [sizes, setSizes] = useState([
    {
      name: "",
      price: "",
    },
  ]);

  const [gallery, setGallery] = useState([
    {
      image: "",
    },
  ]);

  const [category, setCategory] = useState([]);

  const handleAddMore = (setStateFunction) => {
    setStateFunction((prevState) => [...prevState, {}]);
  };

  const handleRemove = (index, setStateFunction) => {
    setStateFunction((prevState) => {
      const newState = [...prevState];
      newState.splice(index, 1);

      return newState;
    });
  };

  const handleInputChange = (index, field, value, setStateFunction) => {
    setStateFunction((prevState) => {
      const newState = [...prevState];
      newState[index][field] = value;

      return newState;
    });
  };

  const handleImageChange = (index, event, setStateFunction) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setStateFunction((prevState) => {
          const newState = [...prevState];
          newState[index].image = { file, preview: reader.result };

          return newState;
        });
      };

      reader.readAsDataURL(file);
    } else {
      setStateFunction((prevState) => {
        const newState = [...prevState];
        newState[index].image = null;
        newState[index].preview = null;

        return newState;
      });
    }
  };

  const handleProductInputChange = (event) => {
    setProduct({
      ...product,
      [event.target.name]: event.target.value,
    });
  };

  const handleProductFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setProduct({
          ...product,
          image: {
            file: event.target.files[0],
            preview: reader.result,
          },
        });
      };

      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    apiInstance.get("category/").then((res) => {
      setCategory(res.data);
    });
  }, []);

  useEffect(() => {
    apiInstance
      .get(`vendor-update-product/${userData?.vendor_id}/${param.pid}/`)
      .then((res) => {
        setProduct(res.data);
        setColors(res.data.color);
        setSizes(res.data.size);
        setSpecifications(res.data.specification);
        setGallery(res.data.gallery);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Handle main product image
    if (product.image) {
      // Check if it's a new file upload
      if (product.image.file) {
        formData.append("image", product.image.file);
      } else if (typeof product.image === "string") {
        // If it's an existing image URL, don't append it
        // The backend will keep the existing image
      }
    }

    // Append other product fields
    Object.entries(product).forEach(([key, value]) => {
      // Skip image as it's handled separately
      if (key !== "image" && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Handle specifications
    specifications.forEach((specification, index) => {
      if (specification.title && specification.content) {
        formData.append(`specifications[${index}][title]`, specification.title);
        formData.append(
          `specifications[${index}][content]`,
          specification.content
        );
      }
    });

    // Handle sizes
    sizes.forEach((size, index) => {
      if (size.name && size.price) {
        formData.append(`sizes[${index}][name]`, size.name);
        formData.append(`sizes[${index}][price]`, size.price);
      }
    });

    // Handle colors
    colors.forEach((color, index) => {
      if (color.name && color.color_code) {
        formData.append(`colors[${index}][name]`, color.name);
        formData.append(`colors[${index}][color_code]`, color.color_code);
      }
    });

    // Handle gallery images
    gallery.forEach((item, index) => {
      if (item.image) {
        // Check if it's a new file upload
        if (item.image.file) {
          formData.append(`gallery[${index}][image]`, item.image.file);
        } else if (typeof item.image === "string") {
          // If it's an existing image URL, don't append it
          // The backend will keep the existing image
        }
      }
    });

    try {
      const response = await apiInstance.patch(
        `vendor-update-product/${userData?.vendor_id}/${param.pid}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Toast.fire({
        icon: "success",
        title: "Product updated successfully",
      });

      navigate("/vendor/products/");
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error.response?.data?.image?.[0] || "Error updating product",
      });
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar Toggle Button */}
        <button
          className="btn btn-warning d-lg-none position-fixed top-0 start-0 mt-2 ms-2 z-3"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          aria-label="Toggle sidebar"
        >
          <i className={`bi bi-${isSidebarCollapsed ? "list" : "x"}`}></i>
        </button>

        {/* Sidebar */}
        <div
          className={`col-lg-3 col-xl-2 pt-3 sidebar ${
            isSidebarCollapsed ? "d-none" : ""
          } d-lg-block`}
        >
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="col-lg-9 col-xl-10 ms-sm-auto px-4 pt-3">
          <div className="">
            <div className="row justify-content-center">
              <div className="">
                <nav className="nav nav-justified rounded border p-2 mb-4">
                  <a
                    className={`nav-link ${
                      activeTab === "details"
                        ? "active btn btn-dark text-white"
                        : "text-secondary"
                    }`}
                    data-bs-toggle="tab"
                    href="#details"
                    onClick={() => setActiveTab("details")}
                  >
                    <i className="bi bi-box-seam me-2"></i>Details
                  </a>
                  <a
                    className={`nav-link ${
                      activeTab === "gallery"
                        ? "active btn btn-dark text-white"
                        : "text-secondary"
                    }`}
                    data-bs-toggle="tab"
                    href="#gallery"
                    onClick={() => setActiveTab("gallery")}
                  >
                    <i className="bi bi-images me-2"></i>Gallery
                  </a>
                  <a
                    className={`nav-link ${
                      activeTab === "specs"
                        ? "active btn btn-dark text-white"
                        : "text-secondary"
                    }`}
                    data-bs-toggle="tab"
                    href="#specs"
                    onClick={() => setActiveTab("specs")}
                  >
                    <i className="bi bi-list-check me-2"></i>Specs
                  </a>
                  <a
                    className={`nav-link ${
                      activeTab === "sizes"
                        ? "active btn btn-dark text-white"
                        : "text-secondary"
                    }`}
                    data-bs-toggle="tab"
                    href="#sizes"
                    onClick={() => setActiveTab("sizes")}
                  >
                    <i className="bi bi-rulers me-2"></i>Variations
                  </a>
                  <a
                    className={`nav-link ${
                      activeTab === "colors"
                        ? "active btn btn-dark text-white"
                        : "text-secondary"
                    }`}
                    data-bs-toggle="tab"
                    href="#colors"
                    onClick={() => setActiveTab("colors")}
                  >
                    <i className="bi bi-palette me-2"></i>Colors
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <form
            className="form-group"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <div className="">
              <div className="row justify-content-center">
                <div className="">
                  <div className="tab-content" id="productTabContent">
                    <div
                      className="tab-pane fade show active"
                      id="details"
                      role="tabpanel"
                    >
                      <div className="card border p-2">
                        <div className="card-header bg-white border-0">
                          <h5 className="mb-0">
                            <i className="bi bi-box-seam me-2"></i>Product
                            Details
                          </h5>
                        </div>
                        <div className="card-body">
                          <div className="row g-4">
                            <div className="col-12 col-md-6">
                              <div className="form-group">
                                <label className="form-label fw-medium">
                                  Product Thumbnail
                                </label>
                                <div className="input-group">
                                  <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    name="image"
                                    onChange={handleProductFileChange}
                                  />
                                  <label className="input-group-text">
                                    <i className="bi bi-image"></i>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-md-6">
                              <div className="form-group">
                                <label className="form-label fw-medium">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter product title"
                                  name="title"
                                  value={product.title || ""}
                                  onChange={handleProductInputChange}
                                />
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="form-group">
                                <label className="form-label fw-medium">
                                  Description
                                </label>
                                <textarea
                                  className="form-control"
                                  rows="4"
                                  placeholder="Enter product description"
                                  name="description"
                                  value={product.description || ""}
                                  onChange={handleProductInputChange}
                                ></textarea>
                              </div>
                            </div>
                            <div className="col-12 col-md-12">
                              <div className="form-group">
                                <label className="form-label fw-medium">
                                  Category
                                </label>
                                <select
                                  className="form-select"
                                  name="category"
                                  value={product.category || ""}
                                  onChange={handleProductInputChange}
                                >
                                  <option selected disabled>
                                    Select category
                                  </option>
                                  {category?.map((c, index) => (
                                    <option key={index} value={c.id}>
                                      {c.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="col-12 col-md-6 col-lg-3">
                              <div className="form-group">
                                <label className="form-label fw-medium">
                                  Sale Price
                                </label>
                                <div className="input-group">
                                  <span className="input-group-text">$</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0.00"
                                    name="price"
                                    value={product.price || ""}
                                    onChange={handleProductInputChange}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-md-6 col-lg-3">
                              <div className="form-group">
                                <label className="form-label fw-medium">
                                  Regular Price
                                </label>
                                <div className="input-group">
                                  <span className="input-group-text">$</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0.00"
                                    name="old_price"
                                    value={product.old_price || ""}
                                    onChange={handleProductInputChange}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-md-6 col-lg-3">
                              <div className="form-group">
                                <label className="form-label fw-medium">
                                  Shipping
                                </label>
                                <div className="input-group">
                                  <span className="input-group-text">$</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0.00"
                                    name="shipping_amount"
                                    value={product.shipping_amount || ""}
                                    onChange={handleProductInputChange}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-md-6 col-lg-3">
                              <div className="form-group">
                                <label className="form-label fw-medium">
                                  Stock Quantity
                                </label>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="0"
                                  name="stock_qty"
                                  value={product.stock_qty || ""}
                                  onChange={handleProductInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="tab-pane fade" id="gallery" role="tabpanel">
                      <div className="card border p-2">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">
                            <i className="bi bi-images me-2"></i>Product Gallery
                          </h5>
                          <button
                            type="button"
                            className="btn btn-warning btn-sm"
                            onClick={() => handleAddMore(setGallery)}
                          >
                            <i className="bi bi-plus-lg me-2"></i>Add Image
                          </button>
                        </div>
                        {gallery.map((item, index) => (
                          <div className="card-body">
                            <div className="row g-4">
                              <div className="col-12">
                                <div className="upload-container border-0">
                                  <div className="row align-items-center">
                                    <div className="col-md-12">
                                      <div className="input-group">
                                        <input
                                          type="file"
                                          className="form-control"
                                          accept="image/*"
                                          onChange={(e) =>
                                            handleImageChange(
                                              index,
                                              e,
                                              setGallery
                                            )
                                          }
                                        />
                                        <label className="input-group-text">
                                          <i className="bi bi-image"></i>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="col-10 p-3">
                          <div className="row g-3">
                            {gallery.map((item, index) => (
                              <div className="col-6 col-md-4 col-lg-3">
                                <div className="card h-100 border">
                                  <div
                                    className="position-relative"
                                    style={{ paddingTop: "100%" }}
                                  >
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                                      {item.image &&
                                        (item.image.preview ? (
                                          <img
                                            style={{
                                              objectFit: "contain",
                                              width: "100%",
                                              height: "100%",
                                            }}
                                            src={item.image.preview}
                                            alt="preview"
                                          />
                                        ) : (
                                          <img
                                            style={{
                                              objectFit: "contain",
                                              width: "100%",
                                              height: "100%",
                                            }}
                                            src={item.image}
                                            alt="preview"
                                          />
                                        ))}

                                      {!item.image && (
                                        <i
                                          className="bi bi-image text-secondary"
                                          style={{ fontSize: "2rem" }}
                                        ></i>
                                      )}
                                    </div>
                                  </div>
                                  <div className="card-footer p-2 bg-white">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <small className="text-muted text-truncate">
                                        Image Preview
                                      </small>
                                      <button
                                        className="btn btn-danger btn-sm px-2 py-0"
                                        onClick={() =>
                                          handleRemove(index, setGallery)
                                        }
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {gallery < 1 && (
                          <div className="col-12" id="emptyState">
                            <div className="text-center py-5">
                              <i className="bi bi-images display-1 text-secondary mb-3"></i>
                              <p className="text-muted">
                                No images uploaded yet
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="tab-pane fade" id="specs" role="tabpanel">
                      <div className="card border p-2">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">
                            <i className="bi bi-list-check me-2"></i>
                            Specifications
                          </h5>
                          <button
                            type="button"
                            onClick={() => handleAddMore(setSpecifications)}
                            className="btn btn-warning btn-sm"
                          >
                            <i className="bi bi-plus-lg me-2"></i>Add
                            Specification
                          </button>
                        </div>
                        {specifications.map((specifications, index) => (
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-5">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Specification Title"
                                  value={specifications.title || ""}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "title",
                                      e.target.value,
                                      setSpecifications
                                    )
                                  }
                                />
                              </div>
                              <div className="col-md-5">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Specification Value"
                                  value={specifications.content || ""}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "content",
                                      e.target.value,
                                      setSpecifications
                                    )
                                  }
                                />
                              </div>
                              <div className="col-md-2">
                                <button
                                  onClick={() =>
                                    handleRemove(index, setSpecifications)
                                  }
                                  className="btn btn-danger"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {specifications < 1 && (
                          <div className="col-12" id="emptyState">
                            <div className="text-center py-5">
                              <i className="bi bi-layers display-1 text-secondary mb-3"></i>
                              <p className="text-muted">
                                No specifications yet
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="tab-pane fade" id="sizes" role="tabpanel">
                      <div className="card border p-2">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">
                            <i className="bi bi-rulers me-2"></i>Variations
                            Options
                          </h5>
                          <button
                            type="button"
                            onClick={() => handleAddMore(setSizes)}
                            className="btn btn-warning btn-sm"
                          >
                            <i className="bi bi-plus-lg me-2"></i>Add Variations
                          </button>
                        </div>
                        <div className="card-body">
                          {sizes.map((s, index) => (
                            <div className="row g-4">
                              <div className="col-md-5">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Variations (e.g., XL, 32Gb RAM, Long Sleeves)"
                                  value={s.name || ""}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "name",
                                      e.target.value,
                                      setSizes
                                    )
                                  }
                                />
                              </div>
                              <div className="col-md-5">
                                <div className="input-group">
                                  <span className="input-group-text">$</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Price for this variations"
                                    value={s.price || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        index,
                                        "price",
                                        e.target.value,
                                        setSizes
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <div className="col-md-2">
                                <button
                                  onClick={() => handleRemove(index, setSizes)}
                                  className="btn btn-danger"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}

                          {sizes < 1 && (
                            <div className="col-12" id="emptyState">
                              <div className="text-center py-5">
                                <i className="bi bi-box display-1 text-secondary mb-3"></i>
                                <p className="text-muted">No size yet</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="tab-pane fade" id="colors" role="tabpanel">
                      <div className="card border p-2">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">
                            <i className="bi bi-palette me-2"></i>Color Options
                          </h5>
                          <button
                            type="button"
                            onClick={() => handleAddMore(setColors)}
                            className="btn btn-warning btn-sm"
                          >
                            <i className="bi bi-plus-lg me-2"></i>Add Color
                          </button>
                        </div>
                        <div className="card-body">
                          {colors.map((colors, index) => (
                            <div className="row g-4 mb-4">
                              <div className="col-md-5">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Color Name"
                                  value={colors.name}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "name",
                                      e.target.value,
                                      setColors
                                    )
                                  }
                                />
                              </div>
                              <div className="col-md-5">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="black or #000 or rgb code"
                                  title="Choose color"
                                  value={colors.color_code}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "color_code",
                                      e.target.value,
                                      setColors
                                    )
                                  }
                                />
                              </div>
                              <div className="col-md-2">
                                <button
                                  onClick={() => handleRemove(index, setColors)}
                                  className="btn btn-danger"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}

                          {colors < 1 && (
                            <div className="col-12" id="emptyState">
                              <div className="text-center py-5">
                                <i className="bi bi-palette display-1 text-secondary mb-3"></i>
                                <p className="text-muted">No colors yet</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-grid gap-2 col-12 col-md-6 w-100 mt-4">
              <button type="submit" className="btn btn-warning btn-lg">
                <i className="bi bi-check-circle me-2"></i>Update Product
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default UpdateProduct;
