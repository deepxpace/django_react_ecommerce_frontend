import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserData from "../plugin/UserData";
import apiInstance from "../../utils/axios";
import moment from "moment";

function Orders() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: "all",
    paymentStatus: "all",
    orderStatus: "all",
    priceRange: "all",
  });
  const userData = UserData();

  useEffect(() => {
    apiInstance.get(`customer/orders/${userData?.user_id}/`).then((res) => {
      setOrders(res.data);
      setFilteredOrders(res.data);
    });
  }, []);

  // Calculate summary stats
  const totalOrders = orders?.length || 0;
  const pendingDelivery =
    orders?.filter((o) => o.order_status === "pending").length || 0;
  const fulfilledOrders =
    orders?.filter((o) => o.order_status === "fulfilled").length || 0;

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    // Apply all filters
    let result = [...orders];

    // Date Range Filter
    if (newFilters.dateRange !== "all") {
      const today = moment();
      result = result.filter((order) => {
        const orderDate = moment(order.date);
        switch (newFilters.dateRange) {
          case "today":
            return orderDate.isSame(today, "day");
          case "week":
            return orderDate.isAfter(today.clone().subtract(7, "days"));
          case "month":
            return orderDate.isAfter(today.clone().subtract(30, "days"));
          default:
            return true;
        }
      });
    }

    // Payment Status Filter
    if (newFilters.paymentStatus !== "all") {
      result = result.filter(
        (order) =>
          order.payment_status.toLowerCase() ===
          newFilters.paymentStatus.toLowerCase()
      );
    }

    // Order Status Filter
    if (newFilters.orderStatus !== "all") {
      result = result.filter(
        (order) =>
          order.order_status.toLowerCase() ===
          newFilters.orderStatus.toLowerCase()
      );
    }

    // Price Range Filter
    if (newFilters.priceRange !== "all") {
      result = result.filter((order) => {
        const total = parseFloat(order.total);
        switch (newFilters.priceRange) {
          case "under50":
            return total < 50;
          case "50to100":
            return total >= 50 && total <= 100;
          case "over100":
            return total > 100;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(result);
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
        <main className="col-lg-9 col-xl-10 ms-sm-auto px-4 py-3">
          <div className="container-fluid">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col">
                <h1 className="h3 mb-0">Orders Overview</h1>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4 mb-4 mb-md-0">
                <div
                  className="card h-100"
                  style={{ borderLeft: "4px solid #0d6efd" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="text-muted small">Total Orders</div>
                        <div className="h2 mb-0">{totalOrders}</div>
                      </div>
                      <div
                        className="p-3 rounded-circle"
                        style={{ backgroundColor: "#e7f1ff" }}
                      >
                        <i className="fas fa-shopping-cart text-primary fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4 mb-4 mb-md-0">
                <div
                  className="card h-100"
                  style={{ borderLeft: "4px solid #6f42c1" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="text-muted small">Pending Delivery</div>
                        <div className="h2 mb-0">{pendingDelivery}</div>
                      </div>
                      <div
                        className="p-3 rounded-circle"
                        style={{ backgroundColor: "#f3ebff" }}
                      >
                        <i
                          className="fas fa-clock text-purple fs-4"
                          style={{ color: "#6f42c1" }}
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div
                  className="card h-100"
                  style={{ borderLeft: "4px solid #198754" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="text-muted small">Fulfilled Orders</div>
                        <div className="h2 mb-0">{fulfilledOrders}</div>
                      </div>
                      <div
                        className="p-3 rounded-circle"
                        style={{ backgroundColor: "#e8f5e9" }}
                      >
                        <i className="fas fa-check-circle text-success fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card border mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filters.dateRange}
                      onChange={(e) =>
                        handleFilterChange("dateRange", e.target.value)
                      }
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filters.paymentStatus}
                      onChange={(e) =>
                        handleFilterChange("paymentStatus", e.target.value)
                      }
                    >
                      <option value="all">All Payment Status</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending Payment</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filters.orderStatus}
                      onChange={(e) =>
                        handleFilterChange("orderStatus", e.target.value)
                      }
                    >
                      <option value="all">All Order Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filters.priceRange}
                      onChange={(e) =>
                        handleFilterChange("priceRange", e.target.value)
                      }
                    >
                      <option value="all">All Prices</option>
                      <option value="under50">Under $50</option>
                      <option value="50to100">$50 - $100</option>
                      <option value="over100">Over $100</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="card">
              <div className="card-header py-3">
                <h6 className="card-title mb-0">Recent Orders</h6>
              </div>
              <div className="card-body">
                <div
                  className="table-responsive"
                  style={{
                    overflowX: "auto", // Horizontal scroll when content overflows
                  }}
                >
                  <table
                    className="table align-middle"
                    style={{ minWidth: "100%" }}
                  >
                    <thead className="bg-light">
                      <tr>
                        <th className="ps-3" style={{ minWidth: "120px" }}>
                          Order ID
                        </th>
                        <th style={{ minWidth: "200px" }}>Product Details</th>
                        <th style={{ minWidth: "150px" }}>Date</th>
                        <th style={{ minWidth: "150px" }}>Payment Status</th>
                        <th style={{ minWidth: "150px" }}>Order Status</th>
                        <th
                          className="text-end pe-3"
                          style={{ minWidth: "120px" }}
                        >
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.slice().reverse().map((order) => (
                        <tr key={order.id}>
                          <td className="ps-3">
                            <span className="fw-medium">#{order.oid}</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={order.orderitem[0]?.product?.image}
                                alt=""
                                className="rounded"
                                width="40"
                                height="40"
                                style={{ objectFit: "cover" }}
                              />
                              <div>
                                <div
                                  className="text-truncate"
                                  style={{
                                    maxWidth: "200px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {order.orderitem[0]?.product?.title}
                                </div>
                                <small className="text-muted">
                                  Qty: {order.orderitem[0]?.qty} × $
                                  {order.orderitem[0]?.price}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              {moment(order.date).format("MMM D, YYYY")}
                              <br />
                              <small className="text-muted">
                                {moment(order.date).format("h:mm A")}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge text-capitalize ${
                                order.payment_status === "paid"
                                  ? "bg-success-subtle text-success"
                                  : "bg-warning-subtle text-warning"
                              }`}
                            >
                              {order.payment_status}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge text-capitalize ${
                                order.order_status === "completed"
                                  ? "bg-success-subtle text-success"
                                  : order.order_status === "processing"
                                  ? "bg-primary-subtle text-primary"
                                  : "bg-warning-subtle text-warning"
                              }`}
                            >
                              {order.order_status}
                            </span>
                          </td>
                          <td className="text-end pe-3">
                            <div className="fw-medium">${order.total}</div>
                            <Link
                              to={`/customer/order/${order.oid}/`}
                              className="btn btn-sm btn-link text-decoration-none p-0 mt-1"
                              style={{ fontSize: "0.875rem" }}
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
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

export default Orders;
