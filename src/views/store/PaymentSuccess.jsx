import { useState, useEffect } from "react";
import apiInstance from "../../utils/axios";
import { useParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [order, setOrder] = useState({});
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState({
    state: "verifying",
    message: "Please hold on while we're verifying your payment",
    icon: "fas fa-spinner fa-spin",
    color: "warning",
  });

  const param = useParams();
  const urlParam = new URLSearchParams(window.location.search);
  const sessionId = urlParam.get("session_id");
  const paypal_order_id = urlParam.get("paypal_order_id");

  const statusConfigs = {
    verifying: {
      state: "verifying",
      message: "Please hold on while we're verifying your payment",
      icon: "fas fa-spinner fa-spin",
      color: "warning",
    },
    success: {
      state: "success",
      message: "Payment completed successfully",
      icon: "fas fa-check-circle",
      color: "success",
    },
    info: {
      state: "success",
      message: "Payment has already been processed",
      icon: "fas fa-check-circle",
      color: "success",
    },
    warning: {
      state: "pending",
      message: "Payment pending. Please complete your payment",
      icon: "fas fa-clock",
      color: "warning",
    },
    error: {
      state: "failed",
      message:
        "Payment verification failed. Please try again or contact support",
      icon: "fas fa-times-circle",
      color: "danger",
    },
  };

  const getProductDetails = (item) => {
    const details = [];
    if (item.qty)
      details.push(
        <span key="qty" className="me-3 d-block">
          <i className="fas fa-layer-group me-1"></i>
          Qty: {item.qty}
        </span>
      );
    if (item.size)
      details.push(
        <span key="size" className="me-3 d-block">
          <i className="fas fa-box me-1"></i>
          {item.size}
        </span>
      );
    if (item.color)
      details.push(
        <span key="color" className="me-3 d-block">
          <i className="fas fa-palette me-1"></i>
          {item.color}
        </span>
      );
    return details;
  };

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const res = await apiInstance.get(`checkout/${param.order_oid}/`);
        setOrder(res.data);
      } catch (error) {
        console.error(
          "Error fetching order data:",
          error.response?.data || error
        );
      }
    };

    if (param.order_oid) {
      fetchOrderData();
    }
  }, [param.order_oid]);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!param.order_oid) {
        return;
      }

      try {
        setPaymentStatus(statusConfigs.verifying);
        const formData = new FormData();
        formData.append("order_oid", param.order_oid);

        if (sessionId) formData.append("session_id", sessionId);
        if (paypal_order_id)
          formData.append("paypal_order_id", paypal_order_id);

        const res = await apiInstance.post(
          `payment-success/${param.order_oid}/`,
          formData
        );

        if (res.data && res.data.status && statusConfigs[res.data.status]) {
          setPaymentStatus({
            ...statusConfigs[res.data.status],
            message: res.data.message || statusConfigs[res.data.status].message,
          });
        }
      } catch (error) {
        setPaymentStatus(statusConfigs.error);
      } finally {
        setLoading(false);
      }
    };

    if (paypal_order_id || sessionId) {
      verifyPayment();
    }
  }, [param.order_oid, sessionId, paypal_order_id]); 

  const getProgressWidth = () => {
    return "100%";
  };

  const showOrderDetails = paymentStatus.state === "success";

  return (
    <div className="container py-5">
      <style>
        {`
          @keyframes checkmark {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          .success-checkmark {
            animation: checkmark 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .order-card {
            transition: transform 0.3s ease;
          }
          
          .order-card:hover {
            transform: translateY(-5px);
          }
          
          .price-item {
            transition: background-color 0.3s ease;
          }
          
          .price-item:hover {
            background-color: rgba(0,0,0,0.02);
          }

          .product-card {
            border-left: 4px solid #198754;
            transition: all 0.3s ease;
          }

          .product-card:hover {
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
          }

          .custom-shadow {
            box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.1);
          }

          .status-badge {
            position: absolute;
            top: 1rem;
            right: 1rem;
            animation: fadeIn 0.5s ease-in;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .action-button {
            transition: all 0.3s ease;
          }

          .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 0.25rem 0.5rem rgba(0,0,0,0.1);
          }
        `}
      </style>
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
                      className="rounded-circle border-warning mx-auto d-flex align-items-center justify-content-center bg-warning border border-2"
                      style={{
                        width: "35px",
                        height: "35px",
                        marginTop: "-16px",
                      }}
                    >
                      <i className="fas fa-clipboard-list text-white"></i>
                    </div>
                    <p className="small mt-2 mb-0">Review</p>
                  </div>
                  <div className="col-4 text-center">
                    <div
                      className="rounded-circle border-warning mx-auto d-flex align-items-center justify-content-center bg-warning border border-2"
                      style={{
                        width: "35px",
                        height: "35px",
                        marginTop: "-16px",
                      }}
                    >
                      <i className="fas fa-credit-card text-white"></i>
                    </div>
                    <p className="small mt-2 mb-0">Payment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card border-light overflow-hidden">
            <div
              className={`card-header bg-${paymentStatus.color} bg-gradient text-white text-center py-4 position-relative`}
            >
              <div
                className={`status-badge badge bg-white small text-${paymentStatus.color} px-2 py-2`}
              >
                Order #{order.oid}
              </div>
              <div className="success-checkmark mb-3">
                <i className={`${paymentStatus.icon} fa-4x`}></i>
              </div>
              <h1 className="display-6 fw-bold mb-2">
                {paymentStatus.state === "verifying"
                  ? "Payment Verifying..."
                  : paymentStatus.state === "success"
                  ? "Payment Successful!"
                  : paymentStatus.state === "pending"
                  ? "Payment Pending"
                  : "Payment Failed"}
              </h1>
              <p className="mb-0">
                {paymentStatus.message}
                {showOrderDetails && (
                  <>
                    <br />
                    We've sent a confirmation email to{" "}
                    <strong>{order.email}</strong>
                  </>
                )}
              </p>
            </div>

            {/* Only show order details for success state */}
            {showOrderDetails && (
              <div className="card-body p-4 p-md-5">
                {/* Customer Information */}
                <div className="row mb-5">
                  <div className="col-md-6 mb-4 mb-md-0">
                    <div className="card h-100 border-light">
                      <div className="card-body">
                        <h5 className="card-title text-dark fw-bold mb-3">
                          <i className="fas fa-user-circle me-2"></i>Customer
                          Details
                        </h5>
                        <p className="mb-1">
                          <b>{order.full_name}</b>
                        </p>
                        <p className="mb-1">
                          <i className="fas fa-envelope me-2"></i>
                          {order.email}
                        </p>
                        <p className="mb-1">
                          <i className="fas fa-phone me-2"></i>
                          {order.mobile}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card h-100 border-light">
                      <div className="card-body">
                        <h5 className="card-title text-dark fw-bold mb-3">
                          <i className="fas fa-shipping-fast me-2"></i>Shipping
                          Address
                        </h5>
                        <p className="mb-1">{order.address}</p>
                        <p className="mb-1">
                          {order.city}, {order.state}
                        </p>
                        <p className="mb-1">{order.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <h5 className="fw-bold mb-4 text-dark">
                  <i className="fas fa-shopping-bag me-2"></i>Order Items
                </h5>

                <div className="mb-5">
                  {order.orderitem?.map((item, index) => (
                    <div key={index} className="card mb-3 border-light">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <h6 className="fw-bold text-dark mb-2">
                              {item.product?.title}
                            </h6>
                            <div className="small mb-0">
                              {getProductDetails(item).length > 0 ? (
                                getProductDetails(item)
                              ) : (
                                <span className="text-muted">
                                  Standard Item
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-4 text-md-end mt-3 mt-md-0">
                            <h6 className="fw-bold mb-0">
                              ${parseFloat(item.price).toFixed(2)}
                            </h6>
                            {parseFloat(item.saved) > 0 && (
                              <small className="text-success">
                                <i className="fas fa-tag me-1"></i>
                                Saved ${parseFloat(item.saved).toFixed(2)}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="card border-light mb-4">
                  <div className="card-body">
                    <h5 className="fw-bold mb-4 text-dark">
                      <i className="fas fa-receipt me-2"></i>Price Details
                    </h5>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal</span>
                      <span>${parseFloat(order.sub_total).toFixed(2)}</span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping Fee</span>
                      <span>
                        ${parseFloat(order.shipping_amount).toFixed(2)}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Service Fee</span>
                      <span>${parseFloat(order.service_fee).toFixed(2)}</span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Tax</span>
                      <span>${parseFloat(order.tax_fee).toFixed(2)}</span>
                    </div>

                    {parseFloat(order.saved) > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>
                          <i className="fas fa-tags me-2"></i>Savings
                        </span>
                        <span>-${parseFloat(order.saved).toFixed(2)}</span>
                      </div>
                    )}

                    <hr className="my-3" />

                    <div className="d-flex justify-content-between text-dark">
                      <span className="fw-bold">Total</span>
                      <span className="fw-bold fs-5">
                        ${parseFloat(order.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="text-center">
                  <div className="row justify-content-center g-3">
                    <div className="col-md-4">
                      <button
                        className="btn btn-lg btn-warning w-100 action-button"
                        data-bs-toggle="modal"
                        data-bs-target="#orderModal"
                      >
                        <i className="fas fa-eye me-2"></i>View Order
                      </button>
                    </div>
                    <div className="col-md-4">
                      <button className="btn btn-lg btn-dark w-100 action-button">
                        <i className="fas fa-file-invoice me-2"></i>Download
                        Invoice
                      </button>
                    </div>
                    <div className="col-md-4">
                      <a
                        href="/"
                        className="btn btn-lg btn-secondary w-100 action-button"
                      >
                        <i className="fas fa-home me-2"></i>Back to Home
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show appropriate actions for non-success states */}
            {!showOrderDetails && (
              <div className="card-body p-4 text-center">
                <div className="row justify-content-center g-3">
                  {paymentStatus.state === "pending" && (
                    <div className="col-md-4">
                      <button className="btn btn-warning w-100">
                        <i className="fas fa-credit-card me-2"></i>Complete
                        Payment
                      </button>
                    </div>
                  )}
                  <div className="col-md-4">
                    <a href="/contact" className="btn btn-lg btn-warning w-100">
                      <i className="fas fa-headset me-2"></i>Contact Support
                    </a>
                  </div>
                  <div className="col-md-4">
                    <a href="/" className="btn btn-lg btn-secondary w-100">
                      <i className="fas fa-home me-2"></i>Back to Home
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <div
        className="modal fade"
        id="orderModal"
        tabIndex="-1"
        aria-labelledby="orderModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-warning text-white">
              <h5 className="modal-title text-white" id="orderModalLabel">
                Order Details
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="fw-bold">Customer Information</h6>
                  <p className="mb-1">{order.full_name}</p>
                  <p className="mb-1">{order.email}</p>
                  <p className="mb-3">{order.mobile}</p>

                  <h6 className="fw-bold">Shipping Address</h6>
                  <p className="mb-1">{order.address}</p>
                  <p className="mb-1">
                    {order.city}, {order.state}
                  </p>
                  <p>{order.country}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold">Order Summary</h6>
                  <p className="mb-1">Order ID: #{order.oid}</p>
                  <p className="mb-1">
                    Order Date: {new Date(order.date).toLocaleDateString()}
                  </p>
                  {/* <p className="mb-1 text-capitalize">
                    Payment Status:{" "}
                    <span className="badge bg-success">
                      {order.payment_status}
                    </span>
                  </p>
                  <p className="text-capitalize">
                    Order Status:{" "}
                    <span className="badge bg-info">{order.order_status}</span>
                  </p> */}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Details</th>
                      <th>Qty</th>
                      <th className="text-end">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderitem?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.product?.title}</td>
                        <td>
                          <div>
                            {getProductDetails(item).length > 0 ? (
                              <div className="small">
                                {getProductDetails(item)}
                              </div>
                            ) : (
                              <span className="text-muted small">
                                Standard Item
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{item.qty}</td>
                        <td className="text-end">
                          ${parseFloat(item.price).toFixed(2)}
                          {parseFloat(item.saved) > 0 && (
                            <div className="small text-success">
                              Saved: ${parseFloat(item.saved).toFixed(2)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan="3" className="text-end fw-bold">
                        Total:
                      </td>
                      <td className="text-end fw-bold">
                        ${parseFloat(order.total).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" className="btn btn-dark">
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
