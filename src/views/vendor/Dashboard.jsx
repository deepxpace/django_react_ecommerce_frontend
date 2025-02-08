import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import apiInstance from "../../utils/axios";
import UserData from "../plugin/UserData";
import { Bar } from "react-chartjs-2";
import { Chart } from "chart.js/auto";

function Dashboard() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [stats, setStats] = useState({});
  const [ordersChartData, setOrdersChartData] = useState([]);
  const [productsChartData, setProductsChartData] = useState([]);
  const [timeRange, setTimeRange] = useState("last_6_months");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "asc",
  });
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    inStock: "all",
  });

  // Advanced filtering and sorting
  const processedProducts = useMemo(() => {
    let result = [...(products || [])];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.pid.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter(
        (product) =>
          product.category.title.toLowerCase() ===
          filters.category.toLowerCase()
      );
    }

    // Price range filter
    if (filters.minPrice) {
      result = result.filter(
        (product) => parseFloat(product.price) >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      result = result.filter(
        (product) => parseFloat(product.price) <= parseFloat(filters.maxPrice)
      );
    }

    // Stock filter
    if (filters.inStock !== "all") {
      result = result.filter((product) =>
        filters.inStock === "inStock" ? product.in_stock : !product.in_stock
      );
    }

    // Sorting
    return result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [products, searchTerm, sortConfig, filters]);

  // Get unique categories
  const categories = [...new Set(products?.map((p) => p.category.title) || [])];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      inStock: "all",
    });
    setSearchTerm("");
  };

  const userData = UserData();

  useEffect(() => {
    apiInstance.get(`vendor/stats/${userData?.vendor_id}/`).then((res) => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        setStats(res.data[0]);
      } else {
        setStats(res.data);
      }
    });

    apiInstance.get(`vendor/products/${userData?.vendor_id}/`).then((res) => {
      setProducts(res.data);
    });
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const orders_response = await apiInstance.get(
          `vendor-orders-chart/${userData?.vendor_id}/?range=${timeRange}`
        );
        // Round the numbers when setting the data
        const roundedOrdersData = orders_response.data.map((item) => ({
          ...item,
          orders: Math.round(item.orders),
        }));
        setOrdersChartData(roundedOrdersData);

        const products_response = await apiInstance.get(
          `vendor-products-chart/${userData?.vendor_id}/?range=${timeRange}`
        );
        // Round the numbers when setting the data
        const roundedProductsData = products_response.data.map((item) => ({
          ...item,
          products: Math.round(item.products),
        }));
        setProductsChartData(roundedProductsData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, [timeRange]);

  const monthNames = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const order_months = ordersChartData?.map((item) => monthNames[item.month]);
  const order_counts = ordersChartData?.map((item) => item.orders);

  const product_months = productsChartData?.map(
    (item) => monthNames[item.month]
  );
  const product_counts = productsChartData?.map((item) => item.products);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // Force step size to be 1 for whole numbers
          callback: function (value) {
            return Math.round(value); // Round the y-axis labels
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            // Round the value in tooltips
            const value = Math.round(tooltipItem.raw);
            return `${tooltipItem.dataset.label}: ${value}`;
          },
        },
      },
      legend: {
        display: true,
        position: "top",
      },
    },
  };

  const order_data = {
    labels: order_months,
    datasets: [
      {
        label: "Total Orders",
        data: order_counts,
        backgroundColor: "rgba(25, 135, 84, 0.8)",
        borderColor: "green",
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const product_data = {
    labels: product_months,
    datasets: [
      {
        label: "Product",
        data: product_counts,
        backgroundColor: "rgba(13, 110, 253, 0.8)",
        borderColor: "blue",
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
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
        <main className="col-lg-9 col-xl-10 ms-sm-auto px-4 py-3">
          {/* Stats Cards Row */}
          <div className="row g-4 mb-4">
            {/* Products */}
            <div className="col-sm-6 col-xl-4">
              <div className="card h-100 border">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "rgba(25, 135, 84, 0.2)", // Bootstrap success color
                        borderRadius: "10px",
                      }}
                    >
                      <i className="bi bi-grid fs-4 text-success"></i>
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-0 text-uppercase fw-semibold">
                        Products
                      </h6>
                    </div>
                  </div>
                  <h2 className="mb-0 fw-bold">{stats.products}</h2>
                  <p className="text-muted mb-0">Total Products</p>
                </div>
              </div>
            </div>

            {/* Orders */}
            <div className="col-sm-6 col-xl-4">
              <div className="card h-100 border">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "rgba(220, 53, 69, 0.2)", // Bootstrap danger color
                        borderRadius: "10px",
                      }}
                    >
                      <i className="bi bi-cart-check fs-4 text-danger"></i>
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-0 text-uppercase fw-semibold">
                        Orders
                      </h6>
                    </div>
                  </div>
                  <h2 className="mb-0 fw-bold">{stats.orders}</h2>
                  <p className="text-muted mb-0">Total Orders</p>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="col-sm-6 col-xl-4">
              <div className="card h-100 border">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "rgba(255, 193, 7, 0.2)", // Bootstrap warning color
                        borderRadius: "10px",
                      }}
                    >
                      <i className="bi bi-currency-dollar fs-4 text-warning"></i>
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-0 text-uppercase fw-semibold">
                        Revenue
                      </h6>
                    </div>
                  </div>
                  <h2 className="mb-0 fw-bold">${stats.revenue}</h2>
                  <p className="text-muted mb-0">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold">Sales Analytics</h5>
              <select
                className="form-select w-auto"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="last_6_months">Last 6 Months</option>
                <option value="last_12_months">Last 12 Months</option>
                <option value="year_to_date">Year to Date</option>
              </select>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="card-title fw-semibold mb-3">
                      Orders Trend
                    </h6>
                    <div style={{ height: "300px" }}>
                      <Bar data={order_data} options={chartOptions} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="card-title fw-semibold mb-3">
                      Products Trend
                    </h6>
                    <div style={{ height: "300px" }}>
                      <Bar data={product_data} options={chartOptions} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div>
            {/* Header Section */}
            <div className="card border mb-3">
              <div className="card-body">
                {/* Header */}
                <div className="col-md-4 mb-3">
                  <h4 className="mb-0 d-flex align-items-center">
                    <i className="bi bi-box-seam-fill me-2"></i>
                    Product Management
                  </h4>
                </div>

                {/* Filters & Search Bar */}
                <div className="row align-items-center gy-2">
                  <div className="col-12">
                    <div className="d-flex flex-wrap gap-2">
                      {/* Search Bar */}
                      <div
                        className="flex-grow-1 flex-shrink-0"
                        style={{ minWidth: "150px" }}
                      >
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-search text-muted"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ boxShadow: "none" }}
                          />
                        </div>
                      </div>

                      {/* Category Filter */}
                      <select
                        className="form-select flex-shrink-0"
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        style={{ minWidth: "120px", flexBasis: "120px" }}
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>

                      {/* Price Range */}
                      <div className="d-flex align-items-center gap-1 flex-nowrap">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Min $"
                          name="minPrice"
                          value={filters.minPrice}
                          onChange={handleFilterChange}
                          style={{ width: "80px", maxWidth: "100%" }}
                        />
                        <span className="text-muted">—</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Max $"
                          name="maxPrice"
                          value={filters.maxPrice}
                          onChange={handleFilterChange}
                          style={{ width: "80px", maxWidth: "100%" }}
                        />
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
                        <th className="">#ID</th>
                        <th className="px-4">Product Name</th>
                        <th className="px-4 text-center">Price</th>
                        <th className="px-4 text-center">Orders</th>
                        <th className="px-4 text-center">Stage</th>
                        <th className="px-4 text-center">Stock</th>
                        <th className="text-center px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedProducts
                        .slice()
                        .reverse()
                        .map((product) => (
                          <tr key={product.id} className="align-middle">
                            <td className="">
                              <span className="fw-medium">#{product.pid}</span>
                            </td>
                            <td
                              className="d-flex align-items-center gap-3"
                              style={{ flexWrap: "nowrap" }}
                            >
                              <img
                                src={product.image}
                                alt={product.title}
                                className="rounded"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                }}
                              />
                              <div
                                style={{
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                <div
                                  className="fw-medium"
                                  style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {product.title}
                                </div>
                                <div className="small text-muted">
                                  {product.category.title}
                                </div>
                              </div>
                            </td>
                            <td className="text-center fw-medium">
                              ${product.price}
                            </td>
                            <td className="text-center">{product.orders}</td>
                            <td className="text-center text-capitalize">
                              {product.status}
                            </td>
                            <td className="text-center">
                              <span
                                className={`badge ${
                                  product.stock_qty > 10
                                    ? "bg-success-subtle text-success"
                                    : "bg-warning-subtle text-warning"
                                } px-3 py-2`}
                              >
                                {product.stock_qty}
                              </span>
                            </td>

                            <td className="text-end px-4">
                              <div className="btn-group">
                                <button
                                  className="btn btn-light btn-sm"
                                  title="View Details"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button
                                  className="btn btn-light btn-sm"
                                  title="Edit Product"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-light btn-sm"
                                  title="Delete Product"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {processedProducts.length === 0 && (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <i className="bi bi-box-seam display-1 text-muted opacity-50"></i>
                    </div>
                    <h5 className="text-muted mb-0">No products found</h5>
                    <p className="text-muted small">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* See More Button */}
          <div className="text-end py-3">
            <Link to="/vendor/products/" className="btn btn-dark">
              See More <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
