import { useState, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import apiInstance from "../../utils/axios";
import UserData from "../plugin/UserData";
import { Link } from "react-router-dom";

function OrdersVendor() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilter, setCurrentFilter] = useState({
    payment: "all",
    order: "all",
    date: "latest",
  });

  const userData = UserData();

  useEffect(() => {
    apiInstance.get(`vendor/orders/${userData?.vendor_id}/`).then((res) => {
      // Process orders to include only items from current vendor
      const processedOrders = res.data
        .map((order) => {
          // Filter orderitems to only include current vendor's items
          const vendorItems = order.orderitem.filter(
            (item) => item.vendor.id === userData?.vendor_id
          );

          if (vendorItems.length === 0) return null;

          // Calculate totals only for current vendor's items
          const vendorSubTotal = vendorItems.reduce(
            (sum, item) => sum + parseFloat(item.sub_total),
            0
          );
          const vendorShipping = vendorItems.reduce(
            (sum, item) => sum + parseFloat(item.shipping_amount),
            0
          );
          const vendorServiceFee = vendorItems.reduce(
            (sum, item) => sum + parseFloat(item.service_fee),
            0
          );
          const vendorTaxFee = vendorItems.reduce(
            (sum, item) => sum + parseFloat(item.tax_fee),
            0
          );
          const vendorTotal = vendorItems.reduce(
            (sum, item) => sum + parseFloat(item.total),
            0
          );

          return {
            ...order,
            orderitem: vendorItems,
            sub_total: vendorSubTotal,
            shipping_amount: vendorShipping,
            service_fee: vendorServiceFee,
            tax_fee: vendorTaxFee,
            total: vendorTotal,
          };
        })
        .filter((order) => order !== null); // Remove orders with no items from current vendor

      setOrders(processedOrders);
    });
  }, [userData?.vendor_id]);

  useEffect(() => {
    let result = [...orders];

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.oid.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (currentFilter.payment !== "all") {
      result = result.filter(
        (order) => order.payment_status === currentFilter.payment
      );
    }
    if (currentFilter.order !== "all") {
      result = result.filter(
        (order) => order.order_status === currentFilter.order
      );
    }
    if (currentFilter.date === "oldest") {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setFilteredOrders(result);
  }, [searchTerm, currentFilter, orders]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

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
          <div className="min-vh-100">
            <div className="">
              {/* Header Section */}
              <div className="card border rounded mb-4">
                <div className="card-body">
                  <div className="row align-items-center gy-3">
                    <div className="col-md-4">
                      <h4 className="mb-0 d-flex align-items-center">
                        <i className="bi bi-box-seam-fill me-2"></i>
                        Orders Management
                      </h4>
                    </div>

                    <div className="col-md-8">
                      <div className="d-flex flex-wrap gap-3 justify-content-md-end">
                        {/* Search Bar */}
                        <div
                          className="flex-grow-1"
                          style={{ maxWidth: "300px" }}
                        >
                          <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                              <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0"
                              placeholder="Search orders..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              style={{ boxShadow: "none" }}
                            />
                          </div>
                        </div>

                        {/* Filters Dropdown */}
                        <div className="dropdown">
                          <button
                            className="btn btn-light border d-flex align-items-center gap-2"
                            type="button"
                            data-bs-toggle="dropdown"
                            style={{ minWidth: "120px" }}
                          >
                            <i className="bi bi-funnel"></i>
                            Filters
                            <i className="bi bi-chevron-down ms-auto"></i>
                          </button>
                          <div
                            className="dropdown-menu dropdown-menu-end shadow-sm p-3"
                            style={{ minWidth: "240px" }}
                          >
                            <div className="mb-3">
                              <label className="form-label fw-bold small text-uppercase">
                                Payment Status
                              </label>
                              <div className="d-flex flex-column gap-2">
                                {["All", "Paid", "Pending"].map((status) => (
                                  <button
                                    key={status}
                                    className="btn btn-sm btn-light text-start"
                                    onClick={() =>
                                      setCurrentFilter({
                                        ...currentFilter,
                                        payment: status.toLowerCase(),
                                      })
                                    }
                                  >
                                    <i
                                      className={`bi bi-circle-fill me-2 ${
                                        currentFilter.payment ===
                                        status.toLowerCase()
                                          ? "text-primary"
                                          : "text-muted"
                                      }`}
                                      style={{ fontSize: "8px" }}
                                    ></i>
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="mb-3">
                              <label className="form-label fw-bold small text-uppercase">
                                Order Status
                              </label>
                              <div className="d-flex flex-column gap-2">
                                {[
                                  "All",
                                  "Pending",
                                  "Processing",
                                  "Shipped",
                                  "Delivered",
                                ].map((status) => (
                                  <button
                                    key={status}
                                    className="btn btn-sm btn-light text-start"
                                    onClick={() =>
                                      setCurrentFilter({
                                        ...currentFilter,
                                        order: status.toLowerCase(),
                                      })
                                    }
                                  >
                                    <i
                                      className={`bi bi-circle-fill me-2 ${
                                        currentFilter.order ===
                                        status.toLowerCase()
                                          ? "text-primary"
                                          : "text-muted"
                                      }`}
                                      style={{ fontSize: "8px" }}
                                    ></i>
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="form-label fw-bold small text-uppercase">
                                Date
                              </label>
                              <div className="d-flex flex-column gap-2">
                                {[
                                  { label: "Latest First", value: "latest" },
                                  { label: "Oldest First", value: "oldest" },
                                ].map((option) => (
                                  <button
                                    key={option.value}
                                    className="btn btn-sm btn-light text-start"
                                    onClick={() =>
                                      setCurrentFilter({
                                        ...currentFilter,
                                        date: option.value,
                                      })
                                    }
                                  >
                                    <i
                                      className={`bi bi-circle-fill me-2 ${
                                        currentFilter.date === option.value
                                          ? "text-primary"
                                          : "text-muted"
                                      }`}
                                      style={{ fontSize: "8px" }}
                                    ></i>
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Section */}
              <div className="card border rounded">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table">
                      <thead className="bg-light">
                        <tr>
                          <th className="">Order ID</th>
                          <th className="px-4">Customer</th>
                          <th className="px-4 text-center">Items</th>
                          <th className="px-4 text-center">Total</th>
                          <th className="px-4 text-center">Payment</th>
                          <th className="px-4 text-center">Status</th>
                          <th className="px-4 text-center ">Date</th>
                          <th className="px-4 text-center ">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.oid}>
                            <td className="">
                              <span className="fw-medium">#{order.oid}</span>
                            </td>
                            <td className="px-4">
                              <div className="fw-medium">{order.full_name}</div>
                              <div className="small text-muted">
                                {order.email}
                              </div>
                            </td>
                            <td className="px-4 text-center">
                              <span className="badge bg-light text-dark border">
                                {order.orderitem.length} items
                              </span>
                            </td>
                            <td className="fw-medium px-4">
                              {formatCurrency(order.total)}
                            </td>
                            <td className="px-4">
                              <span
                                className={`text-capitalize badge ${
                                  order.payment_status === "paid"
                                    ? "bg-success-subtle text-success"
                                    : "bg-warning-subtle text-warning"
                                } px-3 py-2`}
                              >
                                {order.payment_status}
                              </span>
                            </td>
                            <td className="px-4">
                              <span
                                className={`badge text-capitalize ${
                                  order.order_status === "delivered"
                                    ? "bg-success-subtle text-success"
                                    : order.order_status === "shipped"
                                    ? "bg-info-subtle text-info"
                                    : order.order_status === "processing"
                                    ? "bg-primary-subtle text-primary"
                                    : "bg-warning-subtle text-warning"
                                } px-3 py-2`}
                              >
                                {order.order_status}
                              </span>
                            </td>
                            <td className="px-4">
                              <div className="text-muted text-center">
                                {formatDate(order.date)}
                              </div>
                            </td>
                            <td className="text-end px-4">
                              <div className="btn-group">
                                <Link
                                  to={`/vendor/orders/${order.oid}/`}
                                  className="btn btn-light btn-sm"
                                  title="View Details"
                                >
                                  <i className="bi bi-eye"></i>
                                </Link>
                                <button
                                  className="btn btn-light btn-sm"
                                  title="Update Status"
                                >
                                  <i className="bi bi-arrow-clockwise"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredOrders.length === 0 && (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <i className="bi bi-inbox display-1 text-muted opacity-50"></i>
                      </div>
                      <h5 className="text-muted mb-0">No orders found</h5>
                      <p className="text-muted small">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default OrdersVendor;
