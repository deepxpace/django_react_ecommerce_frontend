import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import UserData from "../plugin/UserData";
import apiInstance from "../../utils/axios";
import moment from "moment";

import { Toast } from "../base/Alert";

function CustomerNotification() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const userData = UserData();

  const fetchNotifications = () => {
    apiInstance
      .get(`customer/notification/${userData?.user_id}/`)
      .then((res) => {
        setNotifications(res.data);
      });
  };

  const markNotificationsAsSeen = (userId, notiId) => {
    apiInstance
      .get(`customer/notification/${userData?.user_id}/${notiId}/`)
      .then((res) => {
        fetchNotifications();
      });

    Toast.fire({
      icon: "success",
      title: "Marked as read",
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

        <main className="col-lg-9 col-xl-10 ms-sm-auto px-4 py-3">
          <div className="card border border">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <i className="fas fa-bell text-warning me-2"></i>
                  <h6 className="mb-0 card-title">Notifications</h6>
                </div>
                {/* <div className="d-flex align-items-center">
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="fas fa-check-double me-1"></i>
                    Mark all as read
                  </button>
                </div> */}
              </div>
            </div>

            {Array.isArray(notifications) &&
              notifications
                .slice()
                .reverse()
                .map((n, index) => (
                  <div className="card-body px-0 py-0">
                    <div className="list-group list-group-flush">
                      <div
                        className="list-group-item list-group-item-action border-top-0 border-start-0 border-end-0"
                        style={{ transition: "all 0.2s ease" }}
                      >
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="mb-0 fw-semibold">
                                Order Confirmed
                              </h6>
                              <div className="d-flex align-items-center">
                                <small className="text-muted me-3">
                                  {moment(n.date).format(
                                    "ddd, D MMMM, YYYY, h:mm A"
                                  )}
                                </small>
                                <div className="dropdown">
                                  <button
                                    className="btn btn-link btn-sm p-0 text-muted"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                  >
                                    <i className="fas fa-ellipsis-v"></i>
                                  </button>
                                  <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                      <button
                                        onClick={() =>
                                          markNotificationsAsSeen(
                                            userData?.user_id,
                                            n.id
                                          )
                                        }
                                        className="dropdown-item"
                                      >
                                        <i className="fas fa-check me-2"></i>
                                        Mark as read
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <p className="mb-1 text-muted">
                              Your order has been confirmed. Thanks for shopping
                              with Kosimart!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

            {notifications.length < 1 && (
              <span className="text-center py-4">You have no notification yet</span>
            )}
            {/* <div className="card-footer bg-white border-top-0 text-center py-3">
              <button className="btn btn-link text-decoration-none">
                View all notifications
                <i className="fas fa-chevron-right ms-1"></i>
              </button>
            </div> */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CustomerNotification;
