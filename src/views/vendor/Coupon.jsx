import React, { useState, useEffect, useMemo } from "react";
import apiInstance from "../../utils/axios";
import Sidebar from "./Sidebar";
import UserData from "../plugin/UserData";
import moment from "moment";

import { Toast, AlertFailed } from "../base/Alert";

function Coupon() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [filterConfig, setFilterConfig] = useState({
    search: "",
    status: "all",
    discountRange: "all",
  });
  const [stats, setStats] = useState({ total_coupons: 0, active_coupons: 0 });
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [createCoupon, setCreateCoupon] = useState({
    code: "",
    discount: "",
    active: true,
  });

  const [editingCoupon, setEditingCoupon] = useState(null);

  const userData = UserData();

  const fetchCouponData = async () => {
    try {
      const [statsRes, couponsRes] = await Promise.all([
        apiInstance.get(`vendor-coupon-stats/${userData?.vendor_id}/`),
        apiInstance.get(`vendor-coupon-list/${userData?.vendor_id}/`),
      ]);
      setStats(statsRes.data[0]);
      setCoupons(couponsRes.data);
    } catch (error) {
      console.error("Error fetching coupon data:", error);
    }
  };

  useEffect(() => {
    if (userData?.vendor_id) {
      fetchCouponData();
    }
  }, [userData?.vendor_id]);

  const sortData = (data) => {
    return [...data].sort((a, b) => {
      if (sortConfig.key === "date") {
        return sortConfig.direction === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (sortConfig.key === "discount") {
        return sortConfig.direction === "asc"
          ? a.discount - b.discount
          : b.discount - a.discount;
      }
      if (sortConfig.key === "code") {
        return sortConfig.direction === "asc"
          ? a.code.localeCompare(b.code)
          : b.code.localeCompare(a.code);
      }
      return 0;
    });
  };

  const filterData = (data) => {
    return data.filter((coupon) => {
      const matchesSearch = coupon.code
        .toLowerCase()
        .includes(filterConfig.search.toLowerCase());
      const matchesStatus =
        filterConfig.status === "all"
          ? true
          : filterConfig.status === "active"
          ? coupon.active
          : !coupon.active;
      const matchesDiscount = (() => {
        switch (filterConfig.discountRange) {
          case "all":
            return true;
          case "0-25":
            return coupon.discount <= 25;
          case "26-50":
            return coupon.discount > 25 && coupon.discount <= 50;
          case "51-75":
            return coupon.discount > 50 && coupon.discount <= 75;
          case "76-100":
            return coupon.discount > 75;
          default:
            return true;
        }
      })();
      return matchesSearch && matchesStatus && matchesDiscount;
    });
  };

  const filteredAndSortedCoupons = useMemo(() => {
    return sortData(filterData(coupons));
  }, [coupons, sortConfig, filterConfig]);

  const handleDeleteCoupon = async (couponId) => {
    // Show confirmation alert
    const result = await AlertFailed.fire({
      icon: "warning",
      title: "Are you sure you want to delete this coupon?",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    // If the user confirms, proceed with the deletion
    if (result.isConfirmed) {
      try {
        await apiInstance.delete(
          `vendor-coupon-detail/${userData?.vendor_id}/${couponId}/`
        );
        Toast.fire({
          icon: "success",
          title: "Coupon deleted successfully!",
        });
        fetchCouponData();
      } catch (error) {
        Toast.fire({
          icon: "error",
          title: "Failed to delete the coupon!",
        });
      }
    }
  };

  const handleCouponChange = (event) => {
    setCreateCoupon({
      ...createCoupon,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  };

  const handleSaveCoupon = async () => {
    try {
      const formData = new FormData();
      formData.append("vendor_id", userData?.vendor_id);
      formData.append("code", createCoupon.code);
      formData.append("discount", createCoupon.discount);
      formData.append("active", createCoupon.active ? "true" : "false");

      let res;
      if (editingCoupon) {
        // 🔄 UPDATE Coupon (PATCH)
        res = await apiInstance.patch(
          `vendor-coupon-detail/${userData?.vendor_id}/${editingCoupon.id}/`,
          formData
        );
      } else {
        // 🆕 CREATE Coupon (POST)
        res = await apiInstance.post(
          `vendor-coupon-list/${userData?.vendor_id}/`,
          formData
        );
      }

      fetchCouponData();
      handleModalClose();

      Toast.fire({
        icon: "success",
        title: res.data.message || "Coupon saved successfully!",
      });
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Failed to save coupon!",
      });
    }
  };

  const handleEditCoupon = (coupon) => {
    setShowModal(true);
    setEditingCoupon(coupon); // Set mode edit
    setCreateCoupon({
      code: coupon.code,
      discount: coupon.discount,
      active: coupon.active,
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCoupon(null); // Hapus edit mode
    setCreateCoupon({
      code: "",
      discount: "",
      active: true,
    });
  };

  const handleModalShow = () => {
    setShowModal(true);
    setEditingCoupon(null); // Pastikan bukan mode edit
    setCreateCoupon({
      code: "",
      discount: "",
      active: true,
    });
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
          {/* === MODAL SECTION === */}
          {showModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(5px)",
                zIndex: 1050,
              }}
            ></div>
          )}

          {/* === MODAL CONTENT === */}
          <div
            className="bgwhite"
            style={{
              display: showModal ? "block" : "none",
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1055,
              width: "100%",
              maxWidth: "500px",
            }}
          >
            <div
              className="border rounded bg-white"
              style={{
                overflow: "hidden",
              }}
            >
              {/* === MODAL HEADER === */}
              <div
                className="bg-white"
                style={{
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h5 style={{ margin: 0 }}>
                  <i className="bi bi-ticket-perforated me-2"></i> Coupon
                  Management
                </h5>
                <button
                  className="text-secondary"
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                  onClick={handleModalClose}
                >
                  ✕
                </button>
              </div>

              {/* === MODAL BODY === */}
              <div style={{ padding: "20px", backgroundColor: "#f8f9fa" }}>
                <div style={{ marginBottom: "12px" }}>
                  <label
                    htmlFor="couponCode"
                    style={{
                      fontWeight: "600",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    id="couponCode"
                    name="code"
                    value={createCoupon.code}
                    onChange={handleCouponChange}
                    placeholder="Enter coupon code"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ced4da",
                      outline: "none",
                      transition: "border 0.2s",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label
                    htmlFor="discount"
                    style={{
                      fontWeight: "600",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={createCoupon.discount}
                    onChange={handleCouponChange}
                    placeholder="Enter discount percentage"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ced4da",
                      outline: "none",
                      transition: "border 0.2s",
                    }}
                  />
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    id="isActive"
                    name="active"
                    checked={createCoupon.active}
                    onChange={handleCouponChange}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label
                    htmlFor="isActive"
                    style={{ fontSize: "16px", cursor: "pointer" }}
                  >
                    Active
                  </label>
                </div>
              </div>

              {/* === MODAL FOOTER === */}
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f8f9fa",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  className="btn btn-light"
                  type="button"
                  style={{
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onClick={handleModalClose}
                >
                  <i className="bi bi-x-circle me-1"></i> Close
                </button>
                <button
                  className="btn btn-warning"
                  type="button"
                  style={{
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onClick={handleSaveCoupon}
                >
                  <i className="bi bi-save me-1"></i> Save Coupon
                </button>
              </div>
            </div>
          </div>
          <div>
            {/* === HEADER SECTION === */}
            <div className="row mb-4 align-items-center">
              <div className="col-12 d-flex justify-content-between align-items-center">
                <h2 className="fw-bold text-dark mb-0"> Coupon Management</h2>
                <button className="btn btn-warning" onClick={handleModalShow}>
                  <i className="bi bi-plus-circle me-2"></i> Add New Coupon
                </button>
              </div>
            </div>

            {/* === STATS OVERVIEW === */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="bg-white p-4 border rounded d-flex align-items-center">
                  <div className="icon-container me-3">
                    <i className="bi bi-tags text-primary fs-2"></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Total Coupons</h6>
                    <h4 className="fw-bold">{stats.total_coupons}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="bg-white p-4 border rounded d-flex align-items-center">
                  <div className="icon-container me-3">
                    <i className="bi bi-check-circle text-success fs-2"></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Active Coupons</h6>
                    <h4 className="fw-bold">{stats.active_coupons}</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* === FILTERS SECTION === */}
            <div className="card border mb-4">
              <div className="card-body p-4">
                <h5 className="mb-3">Filter Coupons</h5>
                <div className="row g-3">
                  {/* Search Bar */}
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search coupon code..."
                        value={filterConfig.search}
                        onChange={(e) =>
                          setFilterConfig((prev) => ({
                            ...prev,
                            search: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Filter Status */}
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={filterConfig.status}
                      onChange={(e) =>
                        setFilterConfig((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Filter Discount Range */}
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={filterConfig.discountRange}
                      onChange={(e) =>
                        setFilterConfig((prev) => ({
                          ...prev,
                          discountRange: e.target.value,
                        }))
                      }
                    >
                      <option value="all">All Discounts</option>
                      <option value="0-25">0% - 25%</option>
                      <option value="26-50">26% - 50%</option>
                      <option value="51-75">51% - 75%</option>
                      <option value="76-100">76% - 100%</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* === TABLE SECTION === */}
            <div className="card border rounded">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead className="bg-light">
                      <tr>
                        <th
                          className=""
                          onClick={() =>
                            setSortConfig({
                              key: "code",
                              direction:
                                sortConfig.key === "code" &&
                                sortConfig.direction === "asc"
                                  ? "desc"
                                  : "asc",
                            })
                          }
                          style={{ cursor: "pointer" }}
                        >
                          Code{" "}
                          {sortConfig.key === "code" && (
                            <i
                              className={`bi bi-arrow-${
                                sortConfig.direction === "asc" ? "up" : "down"
                              }`}
                            ></i>
                          )}
                        </th>
                        <th
                          className="px-4 text-center"
                          onClick={() =>
                            setSortConfig({
                              key: "discount",
                              direction:
                                sortConfig.key === "discount" &&
                                sortConfig.direction === "asc"
                                  ? "desc"
                                  : "asc",
                            })
                          }
                          style={{ cursor: "pointer" }}
                        >
                          Discount{" "}
                          {sortConfig.key === "discount" && (
                            <i
                              className={`bi bi-arrow-${
                                sortConfig.direction === "asc" ? "up" : "down"
                              }`}
                            ></i>
                          )}
                        </th>
                        <th className="px-4 text-center">Status</th>
                        <th
                          className="px-4 text-center"
                          onClick={() =>
                            setSortConfig({
                              key: "date",
                              direction:
                                sortConfig.key === "date" &&
                                sortConfig.direction === "asc"
                                  ? "desc"
                                  : "asc",
                            })
                          }
                          style={{ cursor: "pointer" }}
                        >
                          Created Date{" "}
                          {sortConfig.key === "date" && (
                            <i
                              className={`bi bi-arrow-${
                                sortConfig.direction === "asc" ? "up" : "down"
                              }`}
                            ></i>
                          )}
                        </th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedCoupons.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            <i className="bi bi-inbox fs-4 d-block mb-2"></i>
                            No coupons found
                          </td>
                        </tr>
                      ) : (
                        filteredAndSortedCoupons.map((coupon) => (
                          <tr key={coupon.id}>
                            <td>{coupon.code}</td>
                            <td className="text-center">{coupon.discount}%</td>
                            <td className="text-center">
                              <span
                                className={`badge ${
                                  coupon.active ? "bg-success" : "bg-danger"
                                }`}
                              >
                                {coupon.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="text-center">
                              {new Date(coupon.date).toLocaleDateString()}
                            </td>
                            <td className="text-center">
                              <div className="btn-group">
                                <button
                                  onClick={() => handleEditCoupon(coupon)}
                                  className="btn btn-light btn-sm"
                                  title="Edit Coupon"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  className="btn btn-light btn-sm"
                                  title="Delete Coupon"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Coupon;
