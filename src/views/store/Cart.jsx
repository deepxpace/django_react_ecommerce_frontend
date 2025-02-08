import { useState, useEffect, useContext } from "react";
import apiInstance from "../../utils/axios";
import UserData from "../plugin/UserData";
import CartID from "../plugin/CartID";
import GetCurrentAddress from "../plugin/UserCountry";
import { CartContext } from "../plugin/Context";

import { Toast, AlertFailed } from "../base/Alert";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState({});
  const [productQuantities, setProductQuantities] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  const [cartCount, setCartCount] = useContext(CartContext);

  const userData = UserData();
  const cartID = CartID();
  const currentAddress = GetCurrentAddress();

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchCartData = (cartId, userId) => {
    const url = userId
      ? `cart-list/${cartId}/${userId}/`
      : `cart-list/${cartId}/`;
    apiInstance.get(url).then((res) => {
      setCart(res.data);
      setCartCount(res.data.length);
    });
  };

  const fetchCartTotal = (cartId, userId) => {
    const url = userId
      ? `cart-detail/${cartId}/${userId}/`
      : `cart-detail/${cartId}/`;
    apiInstance.get(url).then((res) => setCartTotal(res.data));
  };

  if (cartID !== null && cartID !== undefined) {
    if (userData !== undefined) {
      useEffect(() => {
        fetchCartData(cartID, userData?.user_id);
        fetchCartTotal(cartID, userData?.user_id);
      }, []);
    } else {
      useEffect(() => {
        fetchCartData(cartID, null);
        fetchCartTotal(cartID, null);
      }, []);
    }
  }

  const handleQtyChange = async (event, productId) => {
    const quantity = parseInt(event.target.value) || 1;

    // Update state quantity terlebih dahulu
    setProductQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: quantity,
    }));
  };

  const handleDeleteCartItem = async (itemId) => {
    try {
      const url = userData?.user_id
        ? `cart-delete/${cartID}/${itemId}/${userData?.user_id}/`
        : `cart-delete/${cartID}/${itemId}/`;

      await apiInstance.delete(url);

      fetchCartData(cartID, userData?.user_id);
      fetchCartTotal(cartID, userData?.user_id);

      Toast.fire({
        icon: "success",
        title: "Item removed successfully",
      });
    } catch (error) {
      AlertFailed.fire({
        icon: "error",
        title: "Failed to remove from cart. Please try again",
      });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "fullName":
        setFullName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "mobile":
        setMobile(value);
        break;
      case "address":
        setAddress(value);
        break;
      case "city":
        setCity(value);
        break;
      case "state":
        setState(value);
        break;
      case "country":
        setCountry(value);
        break;
      default:
        break;
    }
  };

  const createOrder = async () => {
    if (
      !fullName ||
      !email ||
      !mobile ||
      !address ||
      !city ||
      !state ||
      !country
    ) {
      AlertFailed.fire({
        icon: "warning",
        title: "All fields are required before checkout!",
      });
    } else {
      try {
        const formData = new FormData();

        formData.append("full_name", fullName);
        formData.append("email", email);
        formData.append("mobile", mobile);
        formData.append("address", address);
        formData.append("city", city);
        formData.append("state", state);
        formData.append("country", country);
        formData.append("cart_id", cartID);
        formData.append("user_id", userData ? userData?.user_id : 0);

        const response = await apiInstance.post("create-order/", formData);

        navigate(`/checkout/${response.data.order_oid}/`);
      } catch (error) {
        AlertFailed.fire({
          icon: "error",
          title: "Failed to proceed to checkout. Please try again",
        });
      }
    }
  };

  useEffect(() => {
    const initialQuantities = {};

    cart.forEach((c) => {
      initialQuantities[c.product?.id] = c.qty;
    });

    setProductQuantities(initialQuantities);
  }, [cart]);

  useEffect(() => {

    const debounceTimer = setTimeout(async () => {
      const hasQuantityChanged = cart.some(
        (item) => productQuantities[item.product?.id] !== item.qty
      );

      if (hasQuantityChanged && !isUpdating) {
        setIsUpdating(true);

        try {
          await Promise.all(
            cart.map(async (item) => {
              const newQty = productQuantities[item.product?.id];
              if (newQty !== item.qty) {
                const formData = new FormData();
                formData.append("product_id", item.product.id);
                formData.append("user_id", userData?.user_id);
                formData.append("qty", newQty);
                formData.append("price", item.product.price);
                formData.append(
                  "shipping_amount",
                  item.product.shipping_amount
                );
                formData.append("country", currentAddress.country);
                formData.append("size", item.size);
                formData.append("color", item.color);
                formData.append("cart_id", cartID);

                await apiInstance.post("cart-view/", formData);
              }
            })
          );

          // Refresh cart data setelah update
          await fetchCartData(cartID, userData?.user_id);
          await fetchCartTotal(cartID, userData?.user_id);

          Toast.fire({
            icon: "success",
            title: "Cart updated successfully",
          });
        } catch (error) {
          AlertFailed.fire({
            icon: "error",
            title: "Failed to update cart. Please try again",
          });

          // Rollback quantities jika gagal
          const initialQuantities = {};
          cart.forEach((item) => {
            initialQuantities[item.product?.id] = item.qty;
          });
          setProductQuantities(initialQuantities);
        } finally {
          setIsUpdating(false);
        }
      }
    }, 500); // Delay 500ms sebelum melakukan update

    return () => clearTimeout(debounceTimer);
  }, [productQuantities, cart]);

  const handleIncrement = (productId, currentQty) => {
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: parseInt(currentQty) + 1,
    }));
  };

  const handleDecrement = (productId, currentQty) => {
    if (currentQty > 1) {
      setProductQuantities((prev) => ({
        ...prev,
        [productId]: parseInt(currentQty) - 1,
      }));
    }
  };

  const getProgressWidth = () => {
    // In cart page, we're at step 1 of 3
    return "15%";
  };

  return (
    <div className="py-5" style={{ minHeight: "100vh" }}>
      <div className="container">
        {/* Enhanced Order Progress */}
        <div className="mb-5">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-12">
              <div className="position-relative">
                <div className="progress bg-light" style={{ height: "3px" }}>
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    style={{
                      width: getProgressWidth(),
                    }}
                  ></div>
                </div>
                <div className="position-absolute w-100 top-0">
                  <div className="row justify-content-between">
                    <div className="col-4 text-center">
                      <div
                        className="rounded-circle border-warning mx-auto d-flex align-items-center justify-content-center bg-white border border-2"
                        style={{
                          width: "35px",
                          height: "35px",
                          marginTop: "-16px",
                        }}
                      >
                        <i className="fas fa-shopping-cart text-secondary"></i>
                      </div>
                      <p className="small mt-2 mb-0">Cart</p>
                    </div>
                    <div className="col-4 text-center">
                      <div
                        className="rounded-circle border-light mx-auto d-flex align-items-center justify-content-center bg-white border border-2"
                        style={{
                          width: "35px",
                          height: "35px",
                          marginTop: "-16px",
                        }}
                      >
                        <i className="fas fa-clipboard-list text-light"></i>
                      </div>
                      <p className="small mt-2 mb-0">Review</p>
                    </div>
                    <div className="col-4 text-center">
                      <div
                        className="rounded-circle border-light mx-auto d-flex align-items-center justify-content-center bg-white border border-2"
                        style={{
                          width: "35px",
                          height: "35px",
                          marginTop: "-16px",
                        }}
                      >
                        <i className="fas fa-credit-card text-light"></i>
                      </div>
                      <p className="small mt-2 mb-0">Payment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mt-1">
          {/* Main Content */}
          <div className="col-lg-8">
            <div className="card border-0 mb-4">
              <div className="card-body px-4">
                <h3 className="mb-4 fw-semibold text-dark">
                  Shopping Cart ({cart?.length} items)
                </h3>

                {cart?.map((c, index) => (
                  <div
                    key={index}
                    className="row align-items-center mb-4 pb-3 g-3 border-bottom position-relative"
                  >
                    {/* Product Image */}
                    <div className="col-3 col-md-2">
                      <img
                        src={c.product?.image}
                        alt="Product"
                        className="img-fluid rounded-3 border"
                        style={{ aspectRatio: "1/1", objectFit: "cover" }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="col-9 col-md-5 pe-4">
                      <h5 className="text-dark mb-1 fw-medium">
                        {c.product?.title}
                      </h5>
                      <div className="text-muted small">
                        {c.size && <div>Size: {c.size}</div>}
                        {c.color && <div>Color: {c.color}</div>}
                        <div>Seller: {c.product?.vendor?.name}</div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-6 col-md-3">
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() =>
                            handleDecrement(
                              c.product?.id,
                              productQuantities[c.product?.id] || c.qty
                            )
                          }
                          disabled={productQuantities[c.product?.id] <= 1}
                        >
                          <i className="fas fa-minus small"></i>
                        </button>

                        <input
                          type="number"
                          className="form-control form-control-sm text-center"
                          value={productQuantities[c.product?.id] || c.qty}
                          min={1}
                          onChange={(e) => handleQtyChange(e, c.product?.id)}
                          style={{ width: "60px" }}
                        />

                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() =>
                            handleIncrement(
                              c.product?.id,
                              productQuantities[c.product?.id] || c.qty
                            )
                          }
                        >
                          <i className="fas fa-plus small"></i>
                        </button>

                        {isUpdating && (
                          <span className="ms-2 text-muted">
                            <i className="fas fa-spinner fa-spin"></i>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Remove Button */}
                    <div className="col-6 col-md-2 text-end">
                      <div className="d-flex flex-column align-items-end">
                        <h6 className="mb-2 fw-semibold">${c.sub_total}</h6>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={(e) => handleDeleteCartItem(c.id)}
                          style={{ width: "fit-content" }}
                        >
                          <i className="fas fa-trash-alt me-lg-1"></i>
                          <span className="d-none d-lg-inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {cart.length < 1 && (
                  <div className="text-center py-5">
                    <i className="fas fa-shopping-cart fa-2x text-muted mb-3"></i>
                    <h4 className="text-muted fw-normal mb-2">
                      Your cart is empty
                    </h4>
                    <p className="text-muted small">
                      Start adding items to see them here
                    </p>
                  </div>
                )}

                {/* Shipping Information */}
                {cart.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-4 border-bottom pb-3">
                      <h5 className="fw-semibold text-dark mb-0">
                        <i className="fas fa-truck me-2 text-muted"></i>
                        Shipping Details
                      </h5>
                    </div>

                    <div className="row g-3">
                      {[
                        {
                          icon: "user",
                          type: "text",
                          placeholder: "Full Name",
                          cols: 6,
                          name: "fullName",
                        },
                        {
                          icon: "envelope",
                          type: "email",
                          placeholder: "Email Address",
                          cols: 6,
                          name: "email",
                        },
                        {
                          icon: "phone",
                          type: "tel",
                          placeholder: "Phone Number",
                          cols: 6,
                          name: "mobile",
                        },
                        {
                          icon: "map-marker-alt",
                          type: "text",
                          placeholder: "Delivery Address",
                          cols: 12,
                          name: "address",
                        },
                        {
                          icon: "city",
                          type: "text",
                          placeholder: "City",
                          cols: 4,
                          name: "city",
                        },
                        {
                          icon: "map",
                          type: "text",
                          placeholder: "State",
                          cols: 4,
                          name: "state",
                        },
                        {
                          icon: "flag",
                          type: "text",
                          placeholder: "Country",
                          cols: 4,
                          name: "country",
                        },
                      ].map((field, index) => (
                        <div
                          key={index}
                          className={`col-12 col-md-${field.cols}`}
                        >
                          <div className="input-group">
                            <span className="input-group-text border-1">
                              <i
                                className={`fas fa-${field.icon} text-muted`}
                              ></i>
                            </span>
                            <input
                              type={field.type}
                              className="form-control border-1"
                              placeholder={field.placeholder}
                              name={field.name}
                              onChange={handleChange}
                              {...(field.type === "tel" && {
                                pattern: "[0-9]*",
                                inputMode: "numeric",
                              })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {cart.length > 0 && (
            <div className="col-lg-4">
              <div
                className="card border-0 shadow-sm"
                style={{
                  position: "sticky",
                  top: "1rem",
                  borderRadius: "12px",
                }}
              >
                <div className="card-body p-4">
                  <h5 className="mb-4 fw-semibold text-dark">
                    <i className="fas fa-receipt me-2 text-muted"></i>
                    Order Summary
                  </h5>

                  {/* Summary Items */}
                  {[
                    { label: "Subtotal", value: cartTotal.sub_total },
                    { label: "Shipping", value: cartTotal.shipping },
                    { label: "Tax", value: cartTotal.tax },
                    { label: "Service Fee", value: cartTotal.service_fee },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="d-flex justify-content-between mb-2"
                    >
                      <span className="text-muted small">{item.label}</span>
                      <span className="small">${item.value?.toFixed(2)}</span>
                    </div>
                  ))}

                  <hr className="my-3" />

                  {/* Total */}
                  <div className="d-flex justify-content-between mb-4 fw-semibold">
                    <span>Total</span>
                    <span>${cartTotal.total?.toFixed(2)}</span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={createOrder}
                    className="btn btn-warning w-100 py-3 fw-semibold"
                  >
                    <i className="fas fa-lock me-2"></i>
                    Complete Checkout
                  </button>

                  <div className="text-center mt-3 small text-muted">
                    <i className="fas fa-shield-alt me-1"></i>
                    Secure Payment Processing
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
