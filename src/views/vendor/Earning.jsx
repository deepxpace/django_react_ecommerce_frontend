import { useState, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import apiInstance from "../../utils/axios";
import UserData from "../plugin/UserData";
import { Link } from "react-router-dom";
import moment from "moment";

import { Bar } from "react-chartjs-2";
import { Chart } from "chart.js/auto";

function Earning() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [earningStats, setEarningStats] = useState({});
  const [earningStatsTracker, setEarningStatsTracker] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [minRevenue, setMinRevenue] = useState("");
  const [maxRevenue, setMaxRevenue] = useState("");
  const [revenueChartData, setRevenueChartData] = useState(null);

  const userData = UserData();

  useEffect(() => {
    apiInstance.get(`vendor-earning/${userData?.vendor_id}/`).then((res) => {
      setEarningStats(res.data[0]);
    });

    apiInstance
      .get(`vendor-monthly-earning/${userData?.vendor_id}/`)
      .then((res) => {
        const sortedData = res.data.sort((a, b) => b.month - a.month);
        setEarningStatsTracker(sortedData);

        // Prepare chart data
        const monthNames = [
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

        // Create a map of month to total earning, preserving the original order
        const monthEarningsMap = new Map(
          sortedData.map((item) => [item.month, item.total_earning])
        );

        const chartData = {
          labels: monthNames.filter((_, index) =>
            monthEarningsMap.has(index + 1)
          ),
          datasets: [
            {
              label: "Monthly Revenue",
              data: monthNames
                .filter((_, index) => monthEarningsMap.has(index + 1))
                .map((_, index) => monthEarningsMap.get(index + 1)),
              backgroundColor: "rgba(25, 135, 84, 0.8)",
              borderColor: "green",
              borderWidth: 2,
              borderRadius: 5,
            },
          ],
        };

        setRevenueChartData(chartData);
      });
  }, [userData?.vendor_id]);

  // Convert month number to name
  const getMonthName = (monthNumber) => {
    return new Date(2025, monthNumber - 1, 1).toLocaleString("en-US", {
      month: "long",
    });
  };

  // Calculate revenue growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return "0%";
    const growth = ((current - previous) / previous) * 100;
    return `${growth.toFixed(1)}%`;
  };

  // Apply filters
  const filteredEarnings = earningStatsTracker.filter((e) => {
    const monthMatch = selectedMonth ? e.month == selectedMonth : true;
    const yearMatch = selectedYear
      ? new Date().getFullYear() == selectedYear
      : true;
    const revenueMatch =
      (minRevenue ? e.total_earning >= minRevenue : true) &&
      (maxRevenue ? e.total_earning <= maxRevenue : true);
    const searchMatch = searchQuery
      ? getMonthName(e.month)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        e.sales_count.toString().includes(searchQuery) ||
        e.total_earning.toString().includes(searchQuery)
      : true;

    return monthMatch && yearMatch && revenueMatch && searchMatch;
  });

  // Chart options
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
          callback: function (value) {
            return `$${value.toFixed(0)}`;
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `$${tooltipItem.raw.toFixed(2)}`;
          },
        },
      },
      legend: {
        display: true,
        position: "top",
      },
    },
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
          <div className="">
            {/* Main Stats Section - Redesigned cards with gradients and improved spacing */}
            <div className="row g-4 mb-4">
              <div className="col-12 col-md-6 col-lg-6">
                <div className="card h-100 border">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="p-3 bg-success bg-opacity-10 me-3"
                        style={{
                          borderRadius: "8px",
                          width: "60px",
                          height: "60px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="bi bi-calendar4 text-success fs-4"></i>
                      </div>
                      <div>
                        <h6 className="text-muted text-uppercase mb-1 small">
                          Monthly Revenue
                        </h6>
                        <h3 className="mb-0 fw-bold">
                          ${earningStats.monthly_revenue}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-6">
                <div className="card h-100 border">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="p-3 bg-info bg-opacity-10 me-3"
                        style={{
                          borderRadius: "8px",
                          width: "60px",
                          height: "60px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="bi bi-wallet2 text-info fs-4"></i>
                      </div>
                      <div>
                        <h6 className="text-muted text-uppercase mb-1 small">
                          Total Revenue
                        </h6>
                        <h3 className="mb-0 fw-bold">
                          ${earningStats.total_revenue}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Chart Section */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border">
                  <div className="card-body">
                    <h5 className="card-title fw-bold mb-3">Revenue Trend</h5>
                    <div style={{ height: "300px" }}>
                      {revenueChartData && (
                        <Bar data={revenueChartData} options={chartOptions} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Tracker Section - Modernized table design */}
            <div className="row">
              <div className="col-12">
                <div className="card border rounded">
                  {/* Header */}
                  <div className="card-header bg-white border-0 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 fw-bold">Revenue Tracker</h5>
                      <div className="d-flex gap-2">
                        <button className="btn btn-light btn-sm">
                          <i className="bi bi-download me-1"></i>Export
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="card-body">
                    <div className="row g-3 mb-3">
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by month, orders, or revenue..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="col-md-2">
                        <select
                          className="form-select"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                          <option value="">All Months</option>
                          {[...Array(12).keys()].map((i) => (
                            <option key={i + 1} value={i + 1}>
                              {getMonthName(i + 1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <select
                          className="form-select"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                        >
                          <option value="">All Years</option>
                          {[2023, 2024, 2025].map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Min Revenue"
                          value={minRevenue}
                          onChange={(e) => setMinRevenue(e.target.value)}
                        />
                      </div>
                      <div className="col-md-2">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Max Revenue"
                          value={maxRevenue}
                          onChange={(e) => setMaxRevenue(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                      <table className="table">
                        <thead className="bg-light">
                          <tr>
                            <th>Month</th>
                            <th className="text-center">Orders</th>
                            <th className="text-center">Revenue</th>
                            <th className="text-center">Growth</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEarnings.length > 0 ? (
                            filteredEarnings.map((e, index) => {
                              const previousMonthRevenue =
                                index < filteredEarnings.length - 1
                                  ? filteredEarnings[index + 1].total_earning
                                  : null;
                              const growth = calculateGrowth(
                                e.total_earning,
                                previousMonthRevenue
                              );

                              return (
                                <tr key={e.month}>
                                  <td>
                                    <span className="fw-medium">
                                      {getMonthName(e.month)}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    {e.sales_count}
                                  </td>
                                  <td className="text-center fw-medium">
                                    ${e.total_earning.toFixed(2)}
                                  </td>
                                  <td className="text-center">
                                    <span
                                      className={`badge ${
                                        growth.startsWith("-")
                                          ? "bg-danger"
                                          : growth === "0%"
                                          ? "bg-secondary-subtle text-secondary"
                                          : "bg-success-subtle text-success"
                                      }`}
                                    >
                                      {growth}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan="5"
                                className="text-center text-muted py-3"
                              >
                                No records found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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

export default Earning;
