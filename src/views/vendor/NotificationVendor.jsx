import React, { useState, useEffect, useMemo } from "react";
import apiInstance from "../../utils/axios";
import Sidebar from "./Sidebar";
import UserData from "../plugin/UserData";
import moment from "moment";

import { Toast, AlertFailed } from "../base/Alert";

function NotificationVendor() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState([]);

  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [priceRange, setPriceRange] = useState({
    min: "",
    max: "",
  });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const userData = UserData();

  const toggleAccordion = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const fetchNotiStats = async () => {
    await apiInstance
      .get(`vendor-noti-summary/${userData?.vendor_id}/`)
      .then((res) => {
        setStats(res.data[0]);
      });
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiInstance.get(
        `vendor-noti-list/${userData?.vendor_id}/`
      );

      // 🔥 Grouping Notifikasi Berdasarkan Order ID
      const groupedNotifications = response.data.reduce((acc, current) => {
        const orderId = current.order.oid;

        if (!acc[orderId]) {
          acc[orderId] = {
            ...current,
            orderItems: [], // 🔥 Buat nampung semua produk dari vendor ini
            totalOrderPrice: 0, // 🔥 Total harga semua produk vendor ini dalam order ini
          };
        }

        // 🔥 Ambil SEMUA `order_item` dalam order yang punya vendor ini
        const vendorProducts = response.data
          .filter((noti) => noti.order.oid === orderId) // 🔥 Ambil SEMUA notifikasi dalam order ini
          .map((noti) => noti.order_item) // 🔥 Ambil produk dari notifikasi
          .filter((item) => item.vendor.id === userData?.vendor_id); // 🔥 Hanya produk dari vendor lo

        // 🔥 Hapus produk yang double dalam satu order
        const uniqueProducts = [
          ...new Map(vendorProducts.map((item) => [item.id, item])).values(),
        ];

        // 🔥 Update orderItems di notifikasi
        acc[orderId].orderItems = uniqueProducts;

        // 🔥 Hitung total harga berdasarkan SEMUA produk yang diambil
        acc[orderId].totalOrderPrice = uniqueProducts.reduce(
          (sum, item) => sum + parseFloat(item.total),
          0
        );

        return acc;
      }, {});

      setNotifications(Object.values(groupedNotifications));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchNotiStats();
  }, []);

  const filterNotifications = () => {
    let filtered = [...notifications];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notification) =>
          notification.order.oid.toLowerCase().includes(query) ||
          notification.order.full_name.toLowerCase().includes(query) ||
          notification.orderItems.some((item) =>
            item.product.title.toLowerCase().includes(query)
          )
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((notification) =>
        filterStatus === "read" ? notification.seen : !notification.seen
      );
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((notification) =>
        moment(notification.date).isBetween(
          dateRange.start,
          dateRange.end,
          "day",
          "[]"
        )
      );
    }

    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter((notification) => {
        const orderTotal = notification.orderItems.reduce(
          (sum, item) => sum + parseFloat(item.total),
          0
        );
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return orderTotal >= min && orderTotal <= max;
      });
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "price_high":
        filtered.sort((a, b) => {
          const totalA = a.orderItems.reduce(
            (sum, item) => sum + parseFloat(item.total),
            0
          );
          const totalB = b.orderItems.reduce(
            (sum, item) => sum + parseFloat(item.total),
            0
          );
          return totalB - totalA;
        });
        break;
      case "price_low":
        filtered.sort((a, b) => {
          const totalA = a.orderItems.reduce(
            (sum, item) => sum + parseFloat(item.total),
            0
          );
          const totalB = b.orderItems.reduce(
            (sum, item) => sum + parseFloat(item.total),
            0
          );
          return totalA - totalB;
        });
        break;
      default:
        break;
    }

    return filtered;
  };

  const resetFilters = () => {
    setSortBy("newest");
    setFilterStatus("all");
    setSearchQuery("");
    setDateRange({ start: "", end: "" });
    setPriceRange({ min: "", max: "" });
  };

  const filteredNotifications = filterNotifications();

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
          <div className="card border">
            {/* Header */}
            <div className="card-header bg-transparent border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <i className="bi bi-bell-fill text-warning me-2"></i>
                  <h5 className="mb-0">Notifications</h5>
                </div>
                <div className="d-flex gap-2">
                  <div className="dropdown">
                    <button
                      className="btn btn-light btn-sm dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      <i className="bi bi-sort-down me-1"></i>
                      Sort By
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button
                          className={`dropdown-item ${
                            sortBy === "newest" ? "active" : ""
                          }`}
                          onClick={() => setSortBy("newest")}
                          style={{
                            backgroundColor:
                              sortBy === "newest" ? "#f8f9fa" : "",
                            color: sortBy === "newest" ? "#000" : "",
                            border: "none", // Menghilangkan border biru saat diklik
                            outline: "none", // Menghilangkan border biru saat diklik
                            boxShadow: "none", // Menghilangkan efek biru ketika tombol dipilih
                          }}
                        >
                          <i className="bi bi-arrow-down me-2"></i>
                          Newest First
                        </button>
                      </li>
                      <li>
                        <button
                          className={`dropdown-item ${
                            sortBy === "oldest" ? "active" : ""
                          }`}
                          onClick={() => setSortBy("oldest")}
                          style={{
                            backgroundColor:
                              sortBy === "oldest" ? "#f8f9fa" : "",
                            color: sortBy === "oldest" ? "#000" : "",
                            border: "none",
                            outline: "none",
                            boxShadow: "none",
                          }}
                        >
                          <i className="bi bi-arrow-up me-2"></i>
                          Oldest First
                        </button>
                      </li>
                      <li>
                        <button
                          className={`dropdown-item ${
                            sortBy === "price_high" ? "active" : ""
                          }`}
                          onClick={() => setSortBy("price_high")}
                          style={{
                            backgroundColor:
                              sortBy === "price_high" ? "#f8f9fa" : "",
                            color: sortBy === "price_high" ? "#000" : "",
                            border: "none",
                            outline: "none",
                            boxShadow: "none",
                          }}
                        >
                          <i className="bi bi-currency-dollar me-2"></i>
                          Price: High to Low
                        </button>
                      </li>
                      <li>
                        <button
                          className={`dropdown-item ${
                            sortBy === "price_low" ? "active" : ""
                          }`}
                          onClick={() => setSortBy("price_low")}
                          style={{
                            backgroundColor:
                              sortBy === "price_low" ? "#f8f9fa" : "",
                            color: sortBy === "price_low" ? "#000" : "",
                            border: "none",
                            outline: "none",
                            boxShadow: "none",
                          }}
                        >
                          <i className="bi bi-currency-dollar me-2"></i>
                          Price: Low to High
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card-body bg-transparent border-bottom py-3">
              <div className="row g-3">
                {/* Search */}
                <div className="col-12 col-md-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="col-12 col-md-4">
                  <div className="input-group">
                    <input
                      type="date"
                      className="form-control"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                    />
                    <span className="input-group-text bg-white">to</span>
                    <input
                      type="date"
                      className="form-control"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div className="col-12 col-md-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white">$</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value })
                      }
                    />
                    <span className="input-group-text bg-white">-</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="col-12 col-md-2">
                  <button className="btn btn-danger" onClick={resetFilters}>
                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((order) => (
                  <div
                    key={order.id}
                    className={`border-bottom p-3 ${!order.seen ? "" : ""}`}
                    style={{ transition: "background-color 0.2s ease" }}
                  >
                    {/* 🔥 Order Header */}
                    <div
                      className="d-flex justify-content-between align-items-center"
                      onClick={() => toggleAccordion(order.order.oid)}
                      style={{ cursor: "pointer", userSelect: "none" }}
                    >
                      <div>
                        <h6 className="mb-1">
                          Order #{order.order.oid}
                          <span className="badge bg-primary ms-2">Order</span>
                        </h6>
                        <div className="row">
                          <small className="text-muted">
                            {moment(order.date).format("MMMM D, YYYY h:mm A")}
                          </small>
                          <small role="button" className="text-muted">
                            Click to show details
                          </small>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <span className="badge bg-success text-center">
                          ${parseFloat(order.totalOrderPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* 🔥 Order Details */}
                    <div
                      className={`mt-3 overflow-hidden transition-height`}
                      style={{
                        maxHeight:
                          expandedOrder === order.order.oid ? "500px" : "0",
                        transition: "max-height 0.3s ease-in-out",
                      }}
                    >
                      {expandedOrder === order.order.oid && (
                        <>
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="row mb-3">
                              <div className="col-md-8 d-flex align-items-center">
                                <img
                                  src={item.product.image}
                                  alt={item.product.title}
                                  className="rounded me-3"
                                  style={{
                                    width: "80px",
                                    height: "80px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div>
                                  <h6 className="mb-1">{item.product.title}</h6>
                                  <p className="mb-1 text-muted">
                                    Quantity: {item.qty} • Size: {item.size} •
                                    Color: {item.color}
                                  </p>
                                  <small className="text-muted">
                                    Product ID: {item.product.pid}
                                  </small>
                                </div>
                              </div>
                              <div className="col-md-4 d-flex align-items-center justify-content-end">
                                <span className="badge bg-info">
                                  ${parseFloat(item.total).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* Customer Details */}
                          <div className="border-top pt-3">
                            <h6 className="mb-2">Customer Details</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <p className="mb-1 small">
                                  <i className="bi bi-person me-2"></i>
                                  {order.order.full_name}
                                </p>
                                <p className="mb-1 small">
                                  <i className="bi bi-envelope me-2"></i>
                                  {order.order.email}
                                </p>
                              </div>
                              <div className="col-md-6">
                                <p className="mb-1 small">
                                  <i className="bi bi-telephone me-2"></i>
                                  {order.order.mobile}
                                </p>
                                <p className="mb-0 small">
                                  <i className="bi bi-geo-alt me-2"></i>
                                  {order.order.address}, {order.order.city},{" "}
                                  {order.order.state}, {order.order.country}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox-fill fs-1"></i>
                  <p className="mt-2 mb-0">No notifications found</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="card-footer bg-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Showing {filteredNotifications.length} of{" "}
                  {notifications.length} notifications
                </small>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default NotificationVendor;
