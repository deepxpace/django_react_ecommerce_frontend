import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import apiInstance from "../../utils/axios";
import UserData from "../plugin/UserData";
import { Link } from "react-router-dom";

function Account() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState({});

  const userData = UserData();

  useEffect(() => {
    apiInstance.get(`user/profile/${userData?.user_id}/`).then((res) => {
      setProfile(res.data);
    });
  }, []);

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
          {/* Welcome Section */}
          <div className="rounded border p-4 mb-4 bg-white">
            <div className="d-flex align-items-center">
              <img
                src={profile.image}
                alt="Profile"
                className="rounded-circle object-fit-cover"
                width="60"
                height="60"
                style={{ border: "3px solid #f8f9fa" }}
              />
              <div className="ms-3">
                <h4 className="mb-1 fw-bold text-dark">
                  Welcome back, {profile.full_name}!
                </h4>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row g-4 mb-4">
            {[
              {
                title: "Recent Orders",
                desc: "Review all your orders",
                link: "/customer/orders/",
                btn: "View Orders",
                btnClass: "btn-warning",
              },
              {
                title: "Account Settings",
                desc: "Update your profile details",
                btn: "Edit Profile",
                btnClass: "btn-outline-dark",
              },
              {
                title: "Notifications",
                desc: "You have 3 unread messages",
                btn: "View All",
                btnClass: "btn-outline-dark",
              },
            ].map((item, index) => (
              <div className="col-md-4" key={index}>
                <div className="rounded border p-4 h-100 bg-white text-center">
                  <h3 className="h5 mb-3 text-dark">{item.title}</h3>
                  <p className="text-muted">{item.desc}</p>
                  {item.link ? (
                    <Link
                      to={item.link}
                      className={`btn ${item.btnClass} fw-bold`}
                    >
                      {item.btn}
                    </Link>
                  ) : (
                    <button className={`btn ${item.btnClass} fw-bold`}>
                      {item.btn}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Account Overview */}
          <div className="rounded border p-4 mb-4 bg-white">
            <h2 className="h4 mb-4 text-dark">Account Overview</h2>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">Email Address</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={profile.user?.email}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control bg-light"
                    value={profile.user?.phone}
                    readOnly
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Default Shipping Address
                  </label>
                  <textarea
                    className="form-control bg-light"
                    rows="3"
                    readOnly
                    value={profile.address}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity
          <div className="rounded border p-4 bg-white">
            <h2 className="h4 mb-4 text-dark">Recent Activity</h2>
            <div className="list-group">
              {[
                {
                  title: "Order #12345 placed",
                  time: "3 days ago",
                  desc: "Status: Processing",
                },
                {
                  title: "Profile updated",
                  time: "5 days ago",
                  desc: "Changed shipping address",
                },
                {
                  title: "Order #12344 delivered",
                  time: "1 week ago",
                  desc: "Successfully delivered to address",
                },
              ].map((activity, index) => (
                <div key={index} className="list-group-item border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-1 fw-bold">{activity.title}</h6>
                    <small className="text-muted">{activity.time}</small>
                  </div>
                  <p className="mb-1 text-muted">{activity.desc}</p>
                </div>
              ))}
            </div>
          </div> */}
        </main>
      </div>
    </div>
  );
}

export default Account;
