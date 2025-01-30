import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import apiInstance from "../../utils/axios";
import { useAuthStore } from "../../store/auth";

const StoreHeader = () => {
  const [categories, setCategories] = useState([]);

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    apiInstance.get("category/").then((res) => {
      setCategories(res.data);
    });
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-dark text-white py-2 d-none d-lg-block">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex gap-3">
                <a
                  href="#"
                  className="text-white-50 text-decoration-none small"
                >
                  <i className="fas fa-phone-alt me-1"></i> +1 234 5678
                </a>
                <a
                  href="#"
                  className="text-white-50 text-decoration-none small"
                >
                  <i className="fas fa-envelope me-1"></i> support@upfront.com
                </a>
                <a
                  href="#"
                  className="text-white-50 text-decoration-none small"
                >
                  <i className="fas fa-map-marker-alt me-1"></i> Upfront
                  Headquarters
                </a>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-end gap-3">
                <Link
                  to="/track-order"
                  className="text-white-50 text-decoration-none small"
                >
                  Track Order
                </Link>
                <Link
                  to="/shipping-policy"
                  className="text-white-50 text-decoration-none small"
                >
                  Shipping Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top py-3">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img
              height={40}
              width={40}
              src="https://img.icons8.com/?size=100&id=66760&format=png&color=D57907"
              alt="Upfront Logo"
            />
            <span className="ms-2 fw-bold">Upfront</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="d-none d-lg-flex flex-grow-1 mx-4">
            <div className="input-group">
              {/* <button className="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                {selectedCategory}
              </button>
              <ul className="dropdown-menu">
                <li><button className="dropdown-item" onClick={() => setSelectedCategory('All Categories')}>All Categories</button></li>
                {categories.map((category, index) => (
                  <li key={index}>
                    <button className="dropdown-item" onClick={() => setSelectedCategory(category.title)}>{category.title}</button>
                  </li>
                ))}
              </ul> */}
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
              />
              <button className="btn btn-warning" type="button">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar Content */}
          <div className="collapse navbar-collapse" id="navbarContent">
            {/* Search Bar - Mobile */}
            <div className="d-lg-none my-3">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                />
                <button className="btn btn-warning" type="button">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>

            {/* Navigation Items */}
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
              {/* Account Dropdown */}
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-user me-2" />
                  Account
                </a>
                <ul
                  className="dropdown-menu rounded-1"
                  aria-labelledby="navbarDropdown"
                >
                  <li>
                    <Link to={"/customer/account/"} className="dropdown-item">
                      <i className="fas fa-user"></i> Account
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to={`/customer/orders/`}>
                      <i className="fas fa-shopping-cart"></i> Orders
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to={`/customer/wishlist/`}>
                      <i className="fas fa-heart"></i> Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={`/customer/notifications/`}
                    >
                      <i className="fas fa-bell"></i> Notifications
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to={`/customer/settings/`}>
                      <i className="fas fa-gear"></i> Settings
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Vendor Dropdown */}
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-store me-2" />
                  Vendor
                </a>
                <ul
                  className="dropdown-menu rounded-1"
                  aria-labelledby="navbarDropdown"
                >
                  <li>
                    <Link className="dropdown-item" to="/vendor/dashboard/">
                      <i className="fas fa-user"></i> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/vendor/products/">
                      <i className="bi bi-grid-fill"></i> Products
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/vendor/product/new/">
                      <i className="fas fa-plus-circle"></i> Add Products
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/vendor/orders/">
                      <i className="fas fa-shopping-cart"></i> Orders
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/vendor/earning/">
                      <i className="fas fa-dollar-sign"></i> Earning
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/vendor/reviews/">
                      <i className="fas fa-star"></i> Reviews
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/vendor/coupon/">
                      <i className="fas fa-tag"></i> Coupon
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/vendor/notifications/">
                      <i className="fas fa-bell"></i> Notifications
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/vendor/settings/">
                      <i className="fas fa-gear"></i> Settings
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Auth Buttons */}
              <li className="nav-item ms-lg-4">
                <div className="d-flex gap-2 mt-4 mt-md-0">
                  {!isLoggedIn ? (
                    <>
                      <Link className="btn btn-outline-light me-2" to="/login">
                        Login
                      </Link>
                      <Link className="btn btn-warning me-2" to="/register">
                        Register
                      </Link>
                    </>
                  ) : (
                    <Link className="btn btn-danger me-2" to="/logout">
                      Logout
                    </Link>
                  )}
                  <Link
                    className="btn btn-warning position-relative"
                    to="/cart/"
                  >
                    <i className="fas fa-shopping-cart"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      0
                    </span>
                  </Link>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Categories Bar */}
      <div className="bg-light border-bottom d-none d-lg-block">
        <div className="container">
          <ul className="nav py-2 gap-4">
            {categories.slice(0, 7).map((category, index) => (
              <li key={index} className="nav-item">
                <Link
                  className="nav-link text-dark px-0"
                  to={`category/${category.title.toLowerCase()}`}
                >
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default StoreHeader;
