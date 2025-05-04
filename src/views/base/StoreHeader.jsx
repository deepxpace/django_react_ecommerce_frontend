import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import apiInstance from "../../utils/axios";
import { useAuthStore } from "../../store/auth";
import { CartContext } from "../plugin/Context";
import UserData from "../plugin/UserData";
import CartID from "../plugin/CartID";
import { getImageUrl } from "../../utils/imageUtils";

const StoreHeader = () => {
  const [categories, setCategories] = useState([]);

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");

  const cartCount = useContext(CartContext);

  const navigate = useNavigate();

  useEffect(() => {
    apiInstance.get("category/").then((res) => {
      setCategories(res.data);
    });
  }, []);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleSearchSubmit = () => {
    navigate(`/search?query=${search}`);
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-light text-dark py-2 d-none d-lg-block">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex gap-3">
                <a
                  href="#"
                  className="text-dark-50 text-decoration-none small"
                >
                  <i className="fas fa-phone-alt me-1"></i> +1 234 5678
                </a>
                <a
                  href="#"
                  className="text-dark-50 text-decoration-none small"
                >
                  <i className="fas fa-envelope me-1"></i> support@koshimart.com
                </a>
                <a
                  href="#"
                  className="text-dark-50 text-decoration-none small"
                >
                  <i className="fas fa-map-marker-alt me-1"></i> Koshimart
                  Headquarters
                </a>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-end gap-3">
                <Link
                  to="/track-order"
                  className="text-dark-50 text-decoration-none small"
                >
                  Track Order
                </Link>
                <Link
                  to="/shipping-policy"
                  className="text-dark-50 text-decoration-none small"
                >
                  Shipping Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top py-3 shadow-sm">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img
              height={40}
              width={40}
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Eo_circle_orange_letter-k.svg/1200px-Eo_circle_orange_letter-k.svg.png"
              alt="Koshimart Logo"
            />
            <span className="ms-2 fw-bold" style={{ color: "#ff8c00" }}>Koshimart</span>
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
                onChange={handleSearchChange}
              />
              <button
                onClick={handleSearchSubmit}
                className="btn"
                style={{ backgroundColor: "#ff8c00", color: "white" }}
                type="button"
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler border-dark"
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
                  onChange={handleSearchChange}
                />
                <button
                  onClick={handleSearchSubmit}
                  className="btn"
                  style={{ backgroundColor: "#ff8c00", color: "white" }}
                  type="button"
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>

            {/* Navigation Items */}
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
              {/* Account Dropdown */}
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle text-dark"
                  to={"/customer/account/"}
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-user me-2" />
                  Account
                </Link>
                <ul
                  className="dropdown-menu rounded-1"
                  aria-labelledby="navbarDropdown"
                >
                  <li>
                    <Link
                      to={"/customer/account/"}
                      className="dropdown-item bg-transparent text-dark"
                    >
                      <i className="fas fa-user"></i> Account
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to={`/customer/orders/`}
                    >
                      <i className="fas fa-shopping-cart"></i> Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to={`/customer/wishlist/`}
                    >
                      <i className="fas fa-heart"></i> Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to={`/customer/notifications/`}
                    >
                      <i className="fas fa-bell"></i> Notifications
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to={`/customer/settings/`}
                    >
                      <i className="fas fa-gear"></i> Settings
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Vendor Dropdown */}
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle text-dark"
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
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to="/vendor/dashboard/"
                    >
                      <i className="fas fa-user"></i> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to="/vendor/products/"
                    >
                      <i className="bi bi-grid-fill"></i> Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to="/vendor/add-product/"
                    >
                      <i className="fas fa-plus-circle"></i> Add Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to="/vendor/orders/"
                    >
                      <i className="fas fa-shopping-cart"></i> Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to="/vendor/earning/"
                    >
                      <i className="fas fa-dollar-sign"></i> Earning
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to="/vendor/reviews/"
                    >
                      <i className="fas fa-star"></i> Reviews
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to="/vendor/coupon/"
                    >
                      <i className="fas fa-tag"></i> Coupon
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to="/vendor/notifications/"
                    >
                      <i className="fas fa-bell"></i> Notifications
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item bg-transparent text-dark"
                      to="/vendor/settings/"
                    >
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
                      <Link className="btn btn-outline-dark me-2" to="/login">
                        Login
                      </Link>
                      <Link className="btn me-2" style={{ backgroundColor: "#ff8c00", color: "white" }} to="/register">
                        Register
                      </Link>
                    </>
                  ) : (
                    <Link className="btn btn-danger me-2" to="/logout">
                      Logout
                    </Link>
                  )}
                  <Link
                    className="btn position-relative"
                    style={{ backgroundColor: "#ff8c00", color: "white" }}
                    to="/cart/"
                  >
                    <i className="fas fa-shopping-cart"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cartCount}
                    </span>
                  </Link>
                </div>
              </li>

              {/* DEBUG TOOLS - only visible in development */}
              {process.env.NODE_ENV === 'development' && (
                <li className="nav-item">
                  <Link to="/debug/image/test.jpg" className="nav-link">
                    <small>Image Debug</small>
                  </Link>
                </li>
              )}
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
                  to={`/search/?category=${category.id}`}
                >
                  {category.title}
                </Link>
              </li>
            ))}

            <Link to="/search/?clear=true" className="nav-link text-dark px-0">
              All Categories
            </Link>
          </ul>
        </div>
      </div>
    </>
  );
};

export default StoreHeader;
