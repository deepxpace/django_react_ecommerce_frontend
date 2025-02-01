import { useState, useEffect } from "react";
import apiInstance from "../../utils/axios";
import UserData from "../plugin/UserData";

import moment from "moment";
import { Link, NavLink } from "react-router-dom";

function Sidebar() {
  const [profile, setProfile] = useState({});

  const userData = UserData();

  useEffect(() => {
    apiInstance.get(`user/profile/${userData?.user_id}/`).then((res) => {
      setProfile(res.data);
    });
  }, []);

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
                <small className="text-muted">
                  Member Since {moment(profile.date).format("D MMMM YYYY")}
                </small>
              </div>

              {/* Navigation Menu */}
              <nav className="pb-3">
                <ul className="nav flex-column gap-2">
                  {[
                    {
                      to: "/customer/account/",
                      icon: "bi-house",
                      text: "Dashboard",
                    },
                    {
                      to: "/customer/orders/",
                      icon: "bi-box",
                      text: "Orders",
                      badge: 2,
                    },
                    {
                      to: "/wishlist",
                      icon: "bi-heart",
                      text: "Wishlist",
                      badge: 5,
                    },
                    { to: "/settings", icon: "bi-gear", text: "Settings" },
                    {
                      to: "/updates",
                      icon: "bi-bell",
                      text: "Updates",
                      badge: 3,
                    },
                    { to: "/profile", icon: "bi-person", text: "Profile" },
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
                        {item.badge && (
                          <span className="badge bg-warning rounded-pill ms-2">
                            {item.badge}
                          </span>
                        )}
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
