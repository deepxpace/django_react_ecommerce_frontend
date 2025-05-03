import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import apiInstance from "../../utils/axios";
import GetCurrentAddress from "../plugin/UserCountry";
import UserData from "../plugin/UserData";
import CartID from "../plugin/CartID";
import { CartContext } from "../plugin/Context";
import ProductImage from "../../components/ProductImage";
import { formatCurrency } from "../../utils/currencyUtils";

import { Toast, AlertFailed } from "../base/Alert";

function Products() {
  // Initialization for Products and Category
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);

  // Color Selector and Picker
  const [selectedColors, setSelectedColors] = useState({});

  // Variations Selector and Picker
  const [selectedSizes, setSelectedSizes] = useState({});

  // Quantity Value
  const [qtyValues, setQtyValues] = useState({});

  // Selected Product
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [cartCount, setCartCount] = useContext(CartContext);

  const currentAddress = GetCurrentAddress();
  const userData = UserData();
  const cartID = CartID();

  const navigate = useNavigate();

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
      formData.append("user_id", userData?.user_id || null);
      formData.append("qty", qty);
      formData.append("price", price);
      formData.append("shipping_amount", shippingAmount);
      formData.append("country", currentAddress.country);
      formData.append("size", selectedSizes[productId] || "");
      formData.append("color", selectedColors[productId] || "");
      formData.append("cart_id", cartID);

      const response = await apiInstance.post("cart-view/", formData);

      // Choose the correct URL based on user state
      let url;
      if (userData?.user_id) {
        url = `cart-list/${cartID}/${userData.user_id}/`;
      } else {
        url = `cart-list/${cartID}/`;
      }

      await apiInstance.get(url).then((res) => {
        setCartCount(res.data.length);
      });

      // Alert the user that they have successfully add product to cart
      Toast.fire({
        icon: "success",
        title: response.data.message,
      });
    } catch (error) {
      console.error("Cart error:", error);
      if (!userData?.user_id) {
        AlertFailed.fire({
          icon: "info",
          title: "Sign in to save your cart between sessions",
        });
      } else {
        AlertFailed.fire({
          icon: "error",
          title: "Failed to add to cart. Please try again",
        });
      }
    }
  };

  const handleCategoryClick = (categoryId) => {
    // Navigate to search page with category pre-selected
    navigate(`/search/?category=${categoryId}`);
  };

  const addToWishlist = async (productId, userId) => {
    try {
      const formData = new FormData();

      formData.append("product_id", productId);
      formData.append("user_id", userId);

      const response = await apiInstance.post(
        `customer/wishlist/${userId}/`,
        formData
      );

      Toast.fire({
        icon: "success",
        title: response.data.message,
      });
    } catch (error) {
      AlertFailed.fire({
        icon: "error",
        title: "Something wrong. Please try again",
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

  useEffect(() => {
    apiInstance.get("products/").then((res) => {
      setProducts(res.data);
    });
  }, []);

  useEffect(() => {
    apiInstance.get("category/").then((res) => {
      setCategory(res.data);
    });
  }, []);

  return (
    <div>
      <main className="mt-3">
        {/* Full-width Banner Section */}
        <div className="container-fluid px-0 mb-4">
          <div id="bannerCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-indicators">
              <button type="button" data-bs-target="#bannerCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
              <button type="button" data-bs-target="#bannerCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
              <button type="button" data-bs-target="#bannerCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
            </div>
            <div className="carousel-inner">
              <div className="carousel-item active">
                <div className="banner-container" style={{ position: "relative", paddingTop: "40%" }}>
                  <img 
                    src="https://images-eu.ssl-images-amazon.com/images/G/31/IN-Events/Shankhadip/MayART25/MAY25_GW_PC_Hero_H1_Sale-is-live_2X._CB795056097_.jpg" 
                    className="position-absolute top-0 start-0 w-100 h-100"
                    alt="Sale Banner 1"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
              <div className="carousel-item">
                <div className="banner-container" style={{ position: "relative", paddingTop: "40%" }}>
                  <img 
                    src="https://images-eu.ssl-images-amazon.com/images/G/31/IMG24/Smart_Watches/MAY_ART25/GW-SM-PC-3000x1200-Main-Event._CB794882394_.jpg" 
                    className="position-absolute top-0 start-0 w-100 h-100"
                    alt="Sale Banner 2"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
              <div className="carousel-item">
                <div className="banner-container" style={{ position: "relative", paddingTop: "40%" }}>
                  <img 
                    src="https://images-eu.ssl-images-amazon.com/images/G/31/img21/Wireless/vinambia/80xevent/D237922473_PC_Hero_Lifestyle_3000x1200_2._CB794984849_.jpg" 
                    className="position-absolute top-0 start-0 w-100 h-100"
                    alt="Sale Banner 3"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>

            {/* Overlay text positioned absolutely over the banners */}
            <div className="carousel-caption d-none d-md-block text-start" style={{ bottom: "20%", left: "10%", right: "auto" }}>
              <h1 className="display-4 fw-bold">Special Sale Now Live!</h1>
              <p className="lead mb-4">Incredible deals on all your favorite products</p>
              <button type="button" className="btn btn-warning btn-lg px-4 fw-bold">
                Shop Now
              </button>
            </div>

            <button className="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>

        <div className="container">
          <hr />

          <section>
            <div className="row py-lg-5 text-center">
              <div className="col-lg-6 col-md-8 mx-auto">
                <h1 className="fw-light">Featured Products</h1>
                <p className="lead text-muted">
                  Explore our handpicked featured products below—each selected
                  for its quality and appeal. Find your next favorite item
                  today!
                </p>
              </div>
            </div>
            <div className="pt-2 row row-cols-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-5 g-3">
              {products?.slice(0, 5).map((p, index) => (
                <div className="col-lg-3 col-md-6 mb-4" key={index}>
                  <div className="card border rounded h-100 d-flex flex-column">
                    <Link to={`/detail/${p.slug}/`}>
                      <div className="ratio ratio-4x3 position-relative">
                        <ProductImage
                          src={p.image}
                          className="object-fit-contain"
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
                        <s>{formatCurrency(p.old_price)}</s>
                        <strong className="ms-2 text-danger">{formatCurrency(p.price)}</strong>
                      </h6>
                      <div className="mt-auto">
                        {/* Variations Dropdown */}
                        <div className="btn-group">
                          {p.size?.length > 0 || p.color?.length > 0 ? (
                            <>
                              <div className="d-flex">
                                <button
                                  className="btn btn-warning dropdown-toggle flex-grow-1 d-flex"
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
                                      onChange={(e) => handleQtyChange(e, p.id)}
                                    />
                                  </div>

                                  {/* Variations or Size Options Section */}
                                  {p.size?.length > 0 && (
                                    <div className="mb-3">
                                      <label className="form-label">
                                        <b>Variation: </b>
                                        {selectedSizes[p.id] || "Select one"}
                                      </label>
                                      <div className="d-flex flex-wrap gap-2">
                                        {p.size?.map((size, index) => (
                                          <button
                                            key={index}
                                            className={`btn btn-sm ${
                                              selectedSizes[p.id] === size.name
                                                ? "btn-warning"
                                                : "btn-outline-secondary"
                                            }`}
                                            onClick={() => {
                                              handleSizeButton(p.id, size.name);
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
                                              backgroundColor: color.color_code,
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
                                      onClick={() =>
                                        addToWishlist(p.id, userData?.user_id)
                                      }
                                      type="button"
                                      className="btn btn-dark px-3"
                                    >
                                      <i className="fas fa-heart" />
                                    </button>
                                  </div>
                                </ul>
                                <button
                                  onClick={() =>
                                    addToWishlist(p.id, userData?.user_id)
                                  }
                                  type="button"
                                  className="btn btn-dark px-3 ms-2"
                                >
                                  <i className="fas fa-heart" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* If there's no variations on the product 
                                    Show add to cart button instead */}
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
                                  onClick={() =>
                                    addToWishlist(p.id, userData?.user_id)
                                  }
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

            {/* Category Section */}
            <div className="row py-lg-5 pt-5 text-center">
              <div className="col-lg-6 col-md-8 mx-auto">
                <h1 className="fw-light">Browse Category</h1>
              </div>
            </div>
            <div className="row mt-4">
              {category?.map((c, index) => (
                <div
                  className="col-lg-2 col-md-3 col-sm-4 col-6 mb-4 text-center"
                  key={index}
                  onClick={() => handleCategoryClick(c.id)}
                  style={{ cursor: "pointer" }}
                >
                  <ProductImage
                    src={c.image}
                    className="rounded-circle"
                    alt={c.title}
                    width="40"
                    height="40"
                  />
                  <h6>{c.title}</h6>
                </div>
              ))}
            </div>

            <div className="pt-2 row row-cols-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-5 g-3 mt-5">
              {products
                ?.sort(() => Math.random() - 0.5)
                .map((p, index) => (
                  <div className="col-lg-3 col-md-6 mb-4" key={index}>
                    <div className="card border rounded h-100 d-flex flex-column">
                      <Link to={`/detail/${p.slug}/`}>
                        <div className="ratio ratio-4x3 position-relative">
                          <ProductImage
                            src={p.image}
                            className="card-img-top p-2"
                            alt={p.title}
                            style={{ height: "200px", objectFit: "contain" }}
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
                          {/* <s>${p.old_price}</s> */}
                          <strong className="text-dark">
                            {formatCurrency(p.price)}
                          </strong>
                        </h6>
                        <div className="mt-auto">
                          {/* Variations Dropdown */}
                          <div className="btn-group">
                            {p.size?.length > 0 || p.color?.length > 0 ? (
                              <>
                                <div className="d-flex">
                                  <button
                                    className="btn btn-warning dropdown-toggle flex-grow-1 d-flex"
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
                                          {selectedSizes[p.id] || "Select one"}
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
                                        onClick={() =>
                                          addToWishlist(p.id, userData?.user_id)
                                        }
                                        type="button"
                                        className="btn btn-dark px-3"
                                      >
                                        <i className="fas fa-heart" />
                                      </button>
                                    </div>
                                  </ul>
                                  <button
                                    onClick={() =>
                                      addToWishlist(p.id, userData?.user_id)
                                    }
                                    type="button"
                                    className="btn btn-dark px-3 ms-2"
                                  >
                                    <i className="fas fa-heart" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* If there's no variations on the product 
                                    Show add to cart button instead */}
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
                                    onClick={() =>
                                      addToWishlist(p.id, userData?.user_id)
                                    }
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
      </main>
    </div>
  );
}

export default Products;
