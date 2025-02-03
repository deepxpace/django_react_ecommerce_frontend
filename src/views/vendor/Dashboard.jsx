import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import apiInstance from "../../utils/axios";
import UserData from "../plugin/UserData";
import { Bar } from "react-chartjs-2";

function Dashboard() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [stats, setStats] = useState({});
  const [ordersChartData, setOrdersChartData] = useState([]);
  const [productsChartData, setProductsChartData] = useState([]);
  const [timeRange, setTimeRange] = useState("last_6_months");

  const userData = UserData();

  useEffect(() => {
    apiInstance.get(`vendor/stats/${userData?.vendor_id}/`).then((res) => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        setStats(res.data[0]); // Extract first object from the array
      } else {
        setStats(res.data); // Use as-is if it's already an object
      }
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

          {/* Tables Section */}
          <div className="card border">
            <div className="card-body">
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item">
                  <button
                    className="nav-link active text-dark"
                    data-bs-toggle="tab"
                    data-bs-target="#products-tab"
                    type="button"
                  >
                    Products
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link text-dark"
                    data-bs-toggle="tab"
                    data-bs-target="#orders-tab"
                    type="button"
                  >
                    Orders
                  </button>
                </li>
              </ul>

              <div className="tab-content mt-4">
                <div className="tab-pane fade show active" id="products-tab">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th scope="col">#ID</th>
                          <th scope="col">Name</th>
                          <th scope="col">Price</th>
                          <th scope="col">Quantity</th>
                          <th scope="col">Orders</th>
                          <th scope="col">Status</th>
                          <th scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">#erituo</th>
                          <td>Turtle Neck Shirt</td>
                          <td>$20</td>
                          <td>14</td>
                          <td>26</td>
                          <td>
                            <span className="badge bg-success">Live</span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-dark me-1">
                              <i className="bi bi-eye"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-success me-1">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                        {/* Add more product rows as needed */}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="tab-pane fade" id="orders-tab">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th scope="col">#Order ID</th>
                          <th scope="col">Total</th>
                          <th scope="col">Payment Status</th>
                          <th scope="col">Delivery Status</th>
                          <th scope="col">Date</th>
                          <th scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">#trytrr</th>
                          <td>$100.90</td>
                          <td>
                            <span className="badge bg-success">Paid</span>
                          </td>
                          <td>
                            <span className="badge bg-info">Shipped</span>
                          </td>
                          <td>20th June, 2023</td>
                          <td>
                            <button className="btn btn-sm btn-outline-dark">
                              <i className="bi bi-eye"></i>
                            </button>
                          </td>
                        </tr>
                        {/* Add more order rows as needed */}
                      </tbody>
                    </table>
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

export default Dashboard;
