import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import apiInstance from "../../utils/axios";
import UserData from "../plugin/UserData";
import { Link } from "react-router-dom";
import moment from "moment";

function OrderDetailVendor() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [order, setOrder] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const [filteredOrderItems, setFilteredOrderItems] = useState([]);

  const userData = UserData();
  const param = useParams();

  useEffect(() => {
    apiInstance
      .get(`vendor/orders/${userData?.vendor_id}/${param.order_oid}/`)
      .then((res) => {
        setOrder(res.data);
        // Filter order items for current vendor only
        const vendorItems = res.data.orderitem.filter(
          (item) => item.vendor.id === userData?.vendor_id
        );
        setOrderItems(vendorItems);

        // Calculate totals for current vendor's items only
        const vendorTotals = {
          sub_total: vendorItems.reduce(
            (sum, item) => sum + parseFloat(item.sub_total),
            0
          ),
          shipping_amount: vendorItems.reduce(
            (sum, item) => sum + parseFloat(item.shipping_amount),
            0
          ),
          service_fee: vendorItems.reduce(
            (sum, item) => sum + parseFloat(item.service_fee),
            0
          ),
          tax_fee: vendorItems.reduce(
            (sum, item) => sum + parseFloat(item.tax_fee),
            0
          ),
          total: vendorItems.reduce(
            (sum, item) => sum + parseFloat(item.total),
            0
          ),
          saved: vendorItems.reduce(
            (sum, item) => sum + parseFloat(item.saved),
            0
          ),
        };

        // Update order with vendor-specific totals
        setOrder((prev) => ({
          ...prev,
          sub_total: vendorTotals.sub_total.toFixed(2),
          shipping_amount: vendorTotals.shipping_amount.toFixed(2),
          service_fee: vendorTotals.service_fee.toFixed(2),
          tax_fee: vendorTotals.tax_fee.toFixed(2),
          total: vendorTotals.total.toFixed(2),
          saved: vendorTotals.saved.toFixed(2),
        }));
      });
  }, [userData?.vendor_id, param.order_oid]);

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar Toggle Button (visible on mobile) */}
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
                      ${order.total}
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
                                      Qty: {item.qty} × ${item.price}
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
                              <span className="fw-medium">${item.price}</span>
                            </td>
                            <td className="py-3">
                              <div>
                                <span className="fw-medium">
                                  ${item.sub_total}
                                </span>
                                {parseFloat(item.saved) > 0 && (
                                  <div className="text-success small">
                                    Saved: ${item.saved}
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
                    <span>${order.sub_total}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Shipping</span>
                    <span>${order.shipping_amount}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Tax</span>
                    <span>${order.tax_fee}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Service Fee</span>
                    <span>${order.service_fee}</span>
                  </div>
                  {parseFloat(order.saved) > 0 && (
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-success">Total Discount</span>
                      <span className="text-success">-${order.saved}</span>
                    </div>
                  )}
                  <hr />
                  <div className="d-flex justify-content-between mb-0">
                    <span className="h5 mb-0">Total</span>
                    <span className="h5 mb-0">${order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default OrderDetailVendor;
