import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserData from "../plugin/UserData";
import apiInstance from "../../utils/axios";
import moment from "moment";
import { useAuthStore } from "../../store/auth";

function OrderDetail() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [order, setOrder] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userData = UserData();
  const param = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState({
    currency_symbol: ""
  });

  useEffect(() => {
    // Fetch site settings
    apiInstance.get("site-settings/")
      .then(res => {
        setSiteSettings(res.data);
      })
      .catch(err => {
        console.error("Error fetching site settings:", err);
        // Default to $ if there's an error
        setSiteSettings({ currency_symbol: "$" });
      });
      
    setIsLoading(true);
    // Always use "current" if we're authenticated but user_id is null
    const userId = userData?.user_id || "current";
    
    apiInstance
      .get(`customer/order/${userId}/${param.order_oid}/`)
      .then((res) => {
        setOrder(res.data);
        setOrderItems(res.data.orderitem);
      })
      .catch(err => {
        console.error("Error fetching order details:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [param.order_oid, isLoggedIn]);

  const { currency_symbol } = siteSettings;

  return (
    <div className="container mt-3">
      <div className="row">
        <button
          className="btn btn-warning d-lg-none position-fixed top-0 start-0 mt-2 ms-2 z-3"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          aria-label="Toggle sidebar"
        >
          <i className={`bi bi-${isSidebarCollapsed ? "list" : "x"}`}></i>
        </button>

        <div
          className={`col-lg-3 col-xl-2 pt-3 sidebar ${
            isSidebarCollapsed ? "d-none" : ""
          } d-lg-block`}
        >
          <Sidebar />
        </div>

        <main className="col-lg-9 col-xl-10 ms-sm-auto px-4 pt-2">
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* Left Side - Order Details */}
            <div>
              <h4 className="mb-1">Order Details</h4>
              <p className="text-muted mb-0">Order #{order.oid}</p>
            </div>

            {/* Right Side - Order & Payment Status */}
            <div className="d-flex flex-column text-end">
              {/* Order Status */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Order Status:</span>
                <span
                  className={`badge ${
                    order.order_status === "delivered"
                      ? "bg-success"
                      : order.order_status === "pending"
                      ? "bg-warning"
                      : order.order_status === "processing"
                      ? "bg-info"
                      : "bg-secondary"
                  } px-3 py-2`}
                >
                  {order.order_status?.charAt(0).toUpperCase() +
                    order.order_status?.slice(1)}
                </span>
              </div>

              {/* Payment Status */}
              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="text-muted small">Payment Status:</span>
                <span
                  className={`badge ${
                    order.payment_status === "paid"
                      ? "bg-success"
                      : "bg-warning"
                  } px-3 py-2`}
                >
                  {order.payment_status?.charAt(0).toUpperCase() +
                    order.payment_status?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="card border mb-4">
            <div className="card-body p-4">
              <div className="row g-2">
                <div className="col-md-3 col-sm-6">
                  <div className="d-flex flex-column">
                    <span className="text-muted small mb-1">Order Total</span>
                    <span className="text-dark h3 mb-0 fw-bold">
                      {currency_symbol}{order.total}
                    </span>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="d-flex flex-column">
                    <span className="text-muted small mb-1">Order Date</span>
                    <span className="h5 mb-0">
                      {moment(order.date).format("MMM DD, YYYY")}
                    </span>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="d-flex flex-column">
                    <span className="text-muted small mb-1">Items</span>
                    <span className="h5 mb-0">{orderItems.length} items</span>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="d-flex flex-column">
                    <span className="text-muted small mb-1">From</span>
                    <span className="h5 mb-0">
                      {order.vendor?.length || 0} vendors
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8">
              <div className="card border mb-4">
                <div className="card-header bg-white py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Order Items</h6>
                    <div className="small text-muted">
                      From {order.vendor?.length || 0} vendors
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr className="bg-light">
                          <th style={{ minWidth: "400px", width: "45%" }}>
                            Product
                          </th>
                          <th style={{ minWidth: "150px", width: "20%" }}>
                            Vendor
                          </th>
                          <th style={{ minWidth: "120px", width: "15%" }}>
                            Price
                          </th>
                          <th style={{ minWidth: "150px", width: "20%" }}>
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="py-3">
                              <div className="d-flex align-items-start gap-3">
                                <img
                                  src={
                                    item.product.image ||
                                    "/api/placeholder/60/60"
                                  }
                                  className="rounded"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover",
                                    flexShrink: 0,
                                  }}
                                  alt={item.product.title}
                                />
                                <div className="flex-grow-1">
                                  <h6
                                    className="mb-2"
                                    style={{
                                      lineHeight: "1.4",
                                      maxWidth: "300px",
                                      wordWrap: "break-word",
                                      hyphens: "auto",
                                    }}
                                  >
                                    {item.product.title}
                                  </h6>
                                  <div className="text-muted small">
                                    <span className="d-block mb-1">
                                      {item.color && `Color: ${item.color}`}{" "}
                                      {item.size && `| Variation: ${item.size}`}
                                    </span>
                                    <span className="d-block">
                                      Qty: {item.qty} × {currency_symbol}{item.price}
                                    </span>
                                    {item.coupon && item.coupon.length > 0 && (
                                      <span className="d-block text-success">
                                        Coupon: {item.coupon[0].code} (
                                        {item.coupon[0].discount}% off)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={
                                    item.vendor.image ||
                                    "/api/placeholder/32/32"
                                  }
                                  className="rounded-circle"
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    objectFit: "cover",
                                  }}
                                  alt={item.vendor.name}
                                />
                                <div>
                                  <div className="fw-medium small">
                                    {item.vendor.name}
                                  </div>
                                  <div className="text-muted small">
                                    {item.vendor.mobile}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="fw-medium">{currency_symbol}{item.price}</span>
                            </td>
                            <td className="py-3">
                              <div>
                                <span className="fw-medium">
                                  {currency_symbol}{item.sub_total}
                                </span>
                                {parseFloat(item.saved) > 0 && (
                                  <div className="text-success small">
                                    Saved: {currency_symbol}{item.saved}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card border pb-2 mt-3">
                <div className="card-header bg-white py-3">
                  <h6 className="mb-0 card-title">Shipping Information</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-4 mb-md-0">
                      <h6 className="text-muted mb-3">
                        <i className="fas fa-map-marker-alt me-2"></i> Delivery
                        Address
                      </h6>
                      <div style={{ wordBreak: "break-word" }}>
                        <p className="mb-1">{order.full_name}</p>
                        <p className="mb-1">{order.address}</p>
                        <p className="mb-1">{order.city}</p>
                        <p className="mb-0">
                          {order.state}, {order.country}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-3">
                        <i className="fas fa-phone-alt me-2"></i> Contact
                        Information
                      </h6>
                      <div>
                        <p className="mb-1">Email: {order.email}</p>
                        <p className="mb-0">Phone: {order.mobile}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0">Order Summary</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Subtotal</span>
                    <span>{currency_symbol}{order.sub_total}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Shipping</span>
                    <span>{currency_symbol}{order.shipping_amount}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Tax</span>
                    <span>{currency_symbol}{order.tax_fee}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Service Fee</span>
                    <span>{currency_symbol}{order.service_fee}</span>
                  </div>
                  {parseFloat(order.saved) > 0 && (
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-success">Total Discount</span>
                      <span className="text-success">-{currency_symbol}{order.saved}</span>
                    </div>
                  )}
                  <hr />
                  <div className="d-flex justify-content-between mb-0">
                    <span className="h5 mb-0">Total</span>
                    <span className="h5 mb-0">{currency_symbol}{order.total}</span>
                  </div>
                </div>
              </div>

              {/* Vendor List Card */}
              <div className="card border mt-3">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0">Vendors in this order</h5>
                </div>
                <div className="card-body">
                  {order.vendor?.map((vendor) => (
                    <div
                      key={vendor.id}
                      className="d-flex align-items-center mb-3 last:mb-0"
                    >
                      <img
                        src={vendor.image || "/api/placeholder/40/40"}
                        alt={vendor.name}
                        className="rounded-circle me-3"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                        }}
                      />
                      <div>
                        <h6 className="mb-1">{vendor.name}</h6>
                        <p className="text-muted small mb-0">
                          Contact: {vendor.mobile}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default OrderDetail;
