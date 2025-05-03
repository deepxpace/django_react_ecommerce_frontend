import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiInstance from "../../utils/axios";
import { SERVER_URL, PAYPAL_CLIENT_ID } from "../../utils/constants";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { formatCurrency } from "../../utils/currencyUtils";

import { Toast, AlertFailed } from "../base/Alert";

function Checkout() {
  const [order, setOrder] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe"); // Default to stripe

  const param = useParams();
  const navigate = useNavigate();

  const initialOptions = {
    clientId: PAYPAL_CLIENT_ID,
    currency: "NPR",
    intent: "capture",
    components: "buttons",
  };

  const createPayPalOrder = async (data, actions) => {
    try {
      return await actions.order.create({
        purchase_units: [
          {
            amount: {
              currency_code: "NPR",
              value: order.total.toString(),
            },
            description: "Order payment",
          },
        ],
      });
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      throw error;
    }
  };

  const onApprovePayPalOrder = async (data, actions) => {
    try {
      const captureResult = await actions.order.capture();

      // Extract relevant details
      const {
        payer: {
          name: { given_name: payerName },
        },
        status,
        id: paypal_order_id,
      } = captureResult;

      if (status === "COMPLETED") {
        navigate(
          `/payment-success/${order.oid}/?paypal_order_id=${paypal_order_id}`
        );
      }

      return captureResult;
    } catch (error) {
      console.error("Error capturing PayPal order:", error);
      throw error;
    }
  };

  const onErrorHandler = (error) => {
    console.error("PayPal error:", error);
  };

  const getProgressWidth = () => {
    switch (order?.payment_status) {
      case "completed":
        return "100%";
      case "processing":
        return "75%";
      default:
        return "50%";
    }
  };

  const fetchOrderData = () => {
    apiInstance.get(`checkout/${param.order_oid}/`).then((res) => {
      setOrder(res.data);
      
      // Check if any order item has a coupon applied
      const hasAppliedCoupon =
        res.data?.orderitem?.some(
          (item) => item.coupon && item.coupon.length > 0
        ) || false;
      setCouponApplied(hasAppliedCoupon);
    });
  };

  const applyCoupon = async () => {
    if (!order?.oid) return;

    const formData = new FormData();
    formData.append("order_oid", order.oid);
    formData.append("coupon_code", couponCode);

    try {
      const response = await apiInstance.post("coupon/", formData);
      fetchOrderData();

      if (response.data.status === "success") {
        setCouponApplied(true);
      }

      Toast.fire({
        icon: response.data.status,
        title: response.data.message,
      });

      if (response.data.status === "warning") {
        Toast.fire({
          icon: "info",
          title: "To use a different coupon, please create a new cart",
        });
      }
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Failed to apply coupon",
      });
    }
  };

  const payWithStripe = (event) => {
    setPaymentLoading(true);
    event.target.form.submit();
  };

  // Handle Cash on Delivery payment
  const handleCashOnDelivery = async () => {
    try {
      setPaymentLoading(true);
      
      // Get cart ID from localStorage
      const cartId = localStorage.getItem("cart_id");
      
      // Call your backend API to mark this order as Cash on Delivery
      const response = await apiInstance.post(`order/cod/${order?.oid}/`, {
        cart_id: cartId
      });
      
      if (response.data.success) {
        Toast.fire({
          icon: "success",
          title: "Order placed successfully with Cash on Delivery!",
        });
        
        // Navigate to success page
        navigate(`/payment-success/${order?.oid}/?payment_method=cash_on_delivery`);
      } else {
        Toast.fire({
          icon: "error",
          title: response.data.message || "Failed to place order",
        });
      }
    } catch (error) {
      console.error("Cash on Delivery error:", error);
      AlertFailed.fire({
        icon: "error",
        title: "Failed to place order with Cash on Delivery",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isLoggedIn || !user) {
        AlertFailed.fire({
          icon: "error",
          title: "Please login to continue",
        });
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        AlertFailed.fire({
          icon: "error",
          title: "Your cart is empty",
        });
        navigate("/cart");
        return;
      }

      // Get cart ID from localStorage
      const cartId = localStorage.getItem("cart_id");

      const orderData = {
        user: user.id,
        cart: cart.id,
        cart_id: cartId,
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        total_amount: cartTotal,
        full_name: user.full_name || `${user.first_name} ${user.last_name}`,
        email: user.email,
        mobile: user.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
      };

      const response = await apiInstance.post("/create-order/", orderData);

      if (response.data.error) {
        AlertFailed.fire({
          icon: "error",
          title: response.data.error,
        });
        return;
      }

      if (paymentMethod === "card") {
        const stripeResponse = await apiInstance.post(
          `/stripe-checkout/${response.data.order_oid}/`
        );
        if (stripeResponse.data.url) {
          window.location.href = stripeResponse.data.url;
          return;
        }
      } else if (paymentMethod === "cod") {
        // Handle Cash on Delivery
        const codResponse = await apiInstance.post(`/order/cod/${response.data.order_oid}/`, {
          cart_id: cartId
        });
        
        if (codResponse.data.success) {
          AlertSuccess.fire({
            icon: "success",
            title: "Order placed successfully with Cash on Delivery!",
          });
          
          // Clear cart data since order was completed
          useCartStore.getState().clearCart();
          
          navigate("/payment-success");
          return;
        }
      }

      AlertSuccess.fire({
        icon: "success",
        title: "Order placed successfully!",
      });

      navigate("/payment-success");
    } catch (error) {
      console.error("Checkout error:", error);
      AlertFailed.fire({
        icon: "error",
        title: error.response?.data?.detail || "Failed to place order",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, []);

  return (
    <div className="py-5 bg-white" style={{ minHeight: "100vh" }}>
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
                        className="rounded-circle border-warning mx-auto d-flex align-items-center justify-content-center bg-warning border border-2"
                        style={{
                          width: "35px",
                          height: "35px",
                          marginTop: "-16px",
                        }}
                      >
                        <i className="fas fa-shopping-cart text-white"></i>
                      </div>
                      <p className="small mt-2 mb-0">Cart</p>
                    </div>
                    <div className="col-4 text-center">
                      <div
                        className="rounded-circle border-warning mx-auto d-flex align-items-center justify-content-center bg-white border border-2"
                        style={{
                          width: "35px",
                          height: "35px",
                          marginTop: "-16px",
                        }}
                      >
                        <i className="fas fa-clipboard-list text-secondary"></i>
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
            {/* Order Details Card */}
            <div className="card border-0">
              <div className="card-body px-4">
                <div className="d-flex pb-3 border-bottom justify-content-between align-items-center">
                  <h5 className="mb-0 fw-semibold text-dark">
                    <i className="fas fa-shopping-bag me-2 text-secondary"></i>
                    Order #{order?.oid}
                  </h5>
                  <span className="badge bg-warning text-capitalize">
                    {order?.order_status}
                  </span>
                </div>
              </div>
              <div className="card-body px-4">
                {/* Date and Status */}
                <div className="mb-4 pb-3 border-bottom">
                  <div className="row">
                    <div className="col-6">
                      <p className="small text-muted mb-1">Order Date</p>
                      <p className="mb-0">
                        {new Date(order?.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-6 text-end">
                      <p className="small text-muted mb-1">Payment Status</p>
                      <p className="mb-0 text-capitalize">
                        {order?.payment_status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vendor Info */}
                {order?.vendor?.map((v, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center mb-4 pb-3 border-bottom"
                  >
                    <img
                      src={v.image}
                      alt={v.name}
                      className="rounded-circle"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="ms-3">
                      <h6 className="mb-1 fw-semibold text-dark">{v.name}</h6>
                      <p className="small text-muted mb-0">{v.description}</p>
                    </div>
                  </div>
                ))}

                {/* Shipping Information Accordion */}
                <style>
                  {`
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
            .shipping-accordion .accordion-body {
              padding: 1rem 0;
            }
                  `}
                </style>
                <div
                  className="accordion shipping-accordion"
                  id="shippingAccordion"
                >
                  <div className="accordion-item border-0">
                    <h2 className="accordion-header" id="headingShipping">
                      <button
                        className="accordion-button px-0"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseShipping"
                        aria-expanded="true"
                        aria-controls="collapseShipping"
                      >
                        <h5 className="fw-semibold text-dark mb-0">
                          <i className="fas fa-truck me-2 text-muted"></i>
                          Shipping Details
                        </h5>
                      </button>
                    </h2>
                    <div
                      id="collapseShipping"
                      className="accordion-collapse collapse show"
                      aria-labelledby="headingShipping"
                    >
                      <div className="accordion-body">
                        <div className="row g-3">
                          {[
                            {
                              icon: "user",
                              label: "Full Name",
                              cols: 6,
                              value: order?.full_name,
                            },
                            {
                              icon: "envelope",
                              label: "Email",
                              cols: 6,
                              value: order?.email,
                            },
                            {
                              icon: "phone",
                              label: "Phone",
                              cols: 6,
                              value: order?.mobile,
                            },
                            {
                              icon: "map-marker-alt",
                              label: "Address",
                              cols: 12,
                              value: order?.address,
                            },
                            {
                              icon: "city",
                              label: "City",
                              cols: 4,
                              value: order?.city,
                            },
                            {
                              icon: "map",
                              label: "State",
                              cols: 4,
                              value: order?.state,
                            },
                            {
                              icon: "flag",
                              label: "Country",
                              cols: 4,
                              value: order?.country,
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
                                  type="text"
                                  className="form-control border-1"
                                  placeholder={field.label}
                                  value={field.value}
                                  readOnly
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div
              className="card border-0 shadow-sm"
              style={{ position: "sticky", top: "1rem", borderRadius: "12px" }}
            >
              <div className="card-body p-4">
                <h5 className="mb-4 fw-semibold text-dark">
                  <i className="fas fa-receipt me-2 text-muted"></i>
                  Order Summary
                </h5>
                {/* Price Breakdown */}
                <div className="mb-4">
                  {[
                    { label: "Subtotal", value: order?.sub_total },
                    {
                      label: "Shipping",
                      value: order?.shipping_amount,
                    },
                    { label: "Tax", value: order?.tax_fee },
                    {
                      label: "Service Fee",
                      value: order?.service_fee,
                    },
                    {
                      label: "Savings",
                      value: order?.saved,
                      isNegative: true,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="d-flex justify-content-between mb-2"
                    >
                      <div className="d-flex align-items-center">
                        <span className="text-muted small">{item.label}</span>
                      </div>
                      <span className={`small ${item.isNegative ? "text-success" : ""}`}>
                        {item.isNegative && Number(item.value) > 0 ? "-" : ""}
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="my-3" />

                {/* Total */}
                <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(order?.total)}</span>
                </div>

                <div className="mb-4">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control border-1"
                      placeholder="Coupon code"
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponApplied}
                      value={couponCode}
                    />
                    <button
                      onClick={applyCoupon}
                      className="btn btn-dark border-0"
                      disabled={couponApplied || !couponCode.trim()}
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <small className="text-muted">
                      Coupon already applied. To use a different coupon, please
                      create a new cart.
                    </small>
                  )}
                </div>

                {/* Payment Method Selection */}
                <div className="mb-4">
                  <h6 className="mb-3">Select Payment Method</h6>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="stripe"
                      value="stripe"
                      checked={paymentMethod === "stripe"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label d-flex align-items-center" htmlFor="stripe">
                      <i className="fab fa-stripe text-primary me-2"></i>
                      Credit/Debit Card (Stripe)
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="paypal"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label d-flex align-items-center" htmlFor="paypal">
                      <i className="fab fa-paypal text-primary me-2"></i>
                      PayPal
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="cod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label d-flex align-items-center" htmlFor="cod">
                      <i className="fas fa-money-bill-wave text-success me-2"></i>
                      Cash on Delivery
                    </label>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-4">
                  <div className="row g-2">
                    {paymentMethod === "stripe" && (
                      <div className="col-12">
                        {paymentLoading === true && (
                          <form
                            action={`${SERVER_URL}/api/v1/stripe-checkout/${order?.oid}/`}
                          >
                            <button
                              disabled
                              onClick={payWithStripe}
                              type="submit"
                              className="btn w-100 d-flex justify-content-center align-items-center py-3 fw-semibold text-white shadow-sm"
                              style={{
                                backgroundColor: "#635bff",
                                transition: "all 0.3s ease",
                                border: "none",
                                ...(window.CSS &&
                                  CSS.supports("(--a: 0)", {
                                    ":hover": {
                                      filter: "brightness(90%)",
                                    },
                                  })),
                              }}
                            >
                              <i className="fas fa-spinner fa-spin me-2"></i>
                              Processing...
                            </button>
                          </form>
                        )}

                        {paymentLoading === false && (
                          <form
                            method="POST"
                            action={`${SERVER_URL}/api/v1/stripe-checkout/${order?.oid}/`}
                          >
                            <button
                              onClick={payWithStripe}
                              type="submit"
                              className="btn w-100 d-flex justify-content-center align-items-center py-3 fw-semibold text-white shadow-sm"
                              style={{
                                backgroundColor: "#635bff",
                                transition: "all 0.3s ease",
                                border: "none",
                                ...(window.CSS &&
                                  CSS.supports("(--a: 0)", {
                                    ":hover": {
                                      filter: "brightness(90%)",
                                    },
                                  })),
                              }}
                            >
                              <i className="fab fa-stripe me-2"></i>
                              Pay with Stripe
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {paymentMethod === "paypal" && (
                      <div className="col-12">
                        <PayPalScriptProvider options={initialOptions}>
                          <PayPalButtons
                            className="mt-3"
                            createOrder={createPayPalOrder}
                            onApprove={onApprovePayPalOrder}
                            onError={onErrorHandler}
                          />
                        </PayPalScriptProvider>
                      </div>
                    )}

                    {paymentMethod === "cod" && (
                      <div className="col-12">
                        <button
                          onClick={handleCashOnDelivery}
                          disabled={paymentLoading}
                          className="btn w-100 d-flex justify-content-center align-items-center py-3 fw-semibold text-white shadow-sm"
                          style={{
                            backgroundColor: "#28a745",
                            transition: "all 0.3s ease",
                            border: "none",
                          }}
                        >
                          {paymentLoading ? (
                            <>
                              <i className="fas fa-spinner fa-spin me-2"></i>
                              Processing...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-money-bill-wave me-2"></i>
                              Place Order (Cash on Delivery)
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Badges */}
                <div className="text-center">
                  <div className="d-flex justify-content-center gap-2 mb-2">
                    <i className="fab fa-cc-visa fa-2x text-muted"></i>
                    <i className="fab fa-cc-mastercard fa-2x text-muted"></i>
                    <i className="fab fa-cc-amex fa-2x text-muted"></i>
                  </div>
                  <div className="mt-3 small text-muted">
                    <i className="fas fa-shield-alt me-2"></i>
                    Secure Payment Processing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
