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
      console.log(res.data);
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
          <div className="rounded border p-4 mb-4">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <img
                  src={profile.image}
                  alt="Profile"
                  className="rounded-circle object-fit-cover"
                  width="56"
                  height="56"
                />
              </div>
              <div className="ms-3">
                <h4 className="mb-0">Welcome back, {profile.full_name}!</h4>
                {/* <p className="text-muted mb-0">Email: {profile.user?.email}</p> */}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="rounded border p-4 h-100">
                <h3 className="h5 mb-3">Recent Orders</h3>
                <p className="text-muted mb-2">You have 2 pending orders</p>
                <Link to={'/customer/orders/'} className="btn btn-warning">View Orders</Link>
              </div>
            </div>
            <div className="col-md-4">
              <div className="rounded border p-4 h-100">
                <h3 className="h5 mb-3">Account Settings</h3>
                <p className="text-muted mb-2">Update your profile details</p>
                <button className="btn btn-outline-dark">Edit Profile</button>
              </div>
            </div>
            <div className="col-md-4">
              <div className="rounded border p-4 h-100">
                <h3 className="h5 mb-3">Notifications</h3>
                <p className="text-muted mb-2">You have 3 unread messages</p>
                <button className="btn btn-outline-dark">View All</button>
              </div>
            </div>
          </div>

          {/* Account Overview */}
          <div className="rounded border p-4 mb-4">
            <h2 className="h4 mb-4">Account Overview</h2>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profile.user?.email}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={profile.user?.phone}
                    readOnly
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Default Shipping Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    readOnly
                    value={profile.address}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded border p-4">
            <h2 className="h4 mb-4">Recent Activity</h2>
            <div className="list-group">
              <div className="list-group-item">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">Order #12345 placed</h6>
                  <small className="text-muted">3 days ago</small>
                </div>
                <p className="mb-1">Status: Processing</p>
              </div>
              <div className="list-group-item">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">Profile updated</h6>
                  <small className="text-muted">5 days ago</small>
                </div>
                <p className="mb-1">Changed shipping address</p>
              </div>
              <div className="list-group-item">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">Order #12344 delivered</h6>
                  <small className="text-muted">1 week ago</small>
                </div>
                <p className="mb-1">Successfully delivered to address</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Account;
