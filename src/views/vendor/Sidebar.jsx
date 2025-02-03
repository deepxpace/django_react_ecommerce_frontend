import { useState, useEffect } from "react";
import apiInstance from "../../utils/axios";
import moment from "moment";
import { Link, NavLink } from "react-router-dom";

function Sidebar() {
  const [profile, setProfile] = useState({});

  return (
    <div className="h-100 d-flex flex-column">
      {/* Mobile Accordion Button */}
      <button
        className="btn btn-outline-secondary d-lg-none w-100 rounded-0 border-0 border-bottom"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#sidebarAccordion"
        aria-expanded="false"
        aria-controls="sidebarAccordion"
        style={{
          backgroundColor: "transparent",
          color: "inherit",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "transparent")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
      >
        <div className="d-flex justify-content-between align-items-center">
          <span>Account Menu</span>
          <i className="bi bi-chevron-down"></i>
        </div>
      </button>

      {/* Sidebar Content */}
      <style>{`
        .nav-link.active {
          background-color:rgb(245, 245, 245);
          color: white;
        }
        .nav-link.active:hover {
          background-color:rgb(238, 238, 238);
        }
      `}</style>
      <div
        className="accordion accordion-flush d-lg-block collapse"
        id="sidebarAccordion"
      >
        <div className="accordion-item">
          <div className="accordion-body p-0">
            {/* Profile Section */}
            <div className="border rounded">
              <div className="p-4 text-center">
                <h5 className="h6 mb-1 fw-semibold text-truncate px-2">
                  Account
                </h5>
                {/* <small className="text-muted">
                  Member Since {moment(profile.date).format("D MMMM YYYY")}
                </small> */}
              </div>

              {/* Navigation Menu */}
              <nav className="pb-3">
                <ul className="nav flex-column gap-2">
                  {[
                    {
                      to: "/vendor/dashboard/",
                      icon: "bi-house-door",
                      text: "Dashboard",
                    },
                    {
                      to: "/vendor/products/",
                      icon: "bi-box-seam",
                      text: "Products",
                    },
                    {
                      to: "/vendor/orders/",
                      icon: "bi-cart-check",
                      text: "Orders",
                    },
                    {
                      to: "/vendor/earning/",
                      icon: "bi-currency-dollar",
                      text: "Earnings",
                    },
                    {
                      to: "/vendor/reviews/",
                      icon: "bi-star",
                      text: "Reviews",
                    },
                    {
                      to: "/vendor/faq/",
                      icon: "bi-question-circle",
                      text: "FAQs",
                    },
                    {
                      to: "/vendor/coupon/",
                      icon: "bi-tags",
                      text: "Coupon and Discount",
                    },
                    {
                      to: "/vendor/customers/",
                      icon: "bi-people",
                      text: "Customers",
                    },
                    {
                      to: "/vendor/notifications/",
                      icon: "bi-bell",
                      text: "Notifications",
                    },
                    {
                      to: "/vendor/message/",
                      icon: "bi-chat-left-text",
                      text: "Messages",
                    },
                    {
                      to: "/vendor/settings/",
                      icon: "bi-gear",
                      text: "Settings",
                    },
                    {
                      to: "/help",
                      icon: "bi-question-circle",
                      text: "Help Center",
                    },
                  ].map((item, index) => (
                    <li className="nav-item" key={index}>
                      <NavLink
                        to={item.to}
                        className="nav-link d-flex align-items-center p-3 text-dark hover-primary"
                        activeClassName="active bg-primary bg-opacity-10" // React Router 5.x
                        style={{ transition: "all 0.2s" }}
                      >
                        <i
                          className={`bi ${item.icon} me-3`}
                          style={{ width: "24px" }}
                        ></i>
                        <span className="flex-grow-1">{item.text}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Logout Button */}
            <div className="pt-3 mt-auto">
              <Link
                to={"/logout"}
                className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
                style={{ gap: "0.5rem" }}
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
