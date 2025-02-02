import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserData from "../plugin/UserData";
import apiInstance from "../../utils/axios";

import { Toast, AlertFailed } from "../base/Alert";

function Wishlist() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  const userData = UserData();

  const fetchWishlist = async () => {
    await apiInstance
      .get(`customer/wishlist/${userData?.user_id}/`)
      .then((res) => {
        setWishlist(res.data);
      });
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const addToWishlist = async (productId, userId) => {
    try {
      const formData = new FormData();

      formData.append("product_id", productId);
      formData.append("user_id", userId);

      const response = await apiInstance.post(
        `customer/wishlist/${userId}/`,
        formData
      );

      fetchWishlist();

      Toast.fire({
        icon: "success",
        title: response.data.message,
      });
    } catch (error) {
      AlertFailed.fire({
        icon: "error",
        title: "Something wrong. Please try again",
      });
    }
  };

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
          <div className="container">
            <h3 className="mb-3">Your Wishlist</h3>
            <div className="mt-3 row row-cols-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3">
              {wishlist?.map((w, index) => (
                <div className="col-lg-4 col-md-6 mb-4" key={index}>
                  <div className="card border-1 border-light rounded-1 h-100 d-flex flex-column">
                    <Link to={`/detail/${w.product?.slug}/`}>
                      <div className="ratio ratio-4x3 position-relative">
                        <img
                          src={w.product?.image}
                          className="object-fit-cover"
                          alt={w.product?.title}
                        />
                      </div>
                    </Link>
                    <div className="card-body d-flex flex-column">
                      <Link
                        className="text-decoration-none"
                        to={`/detail/${w.product?.slug}/`}
                      >
                        <h5
                          className="card-title mb-3 text-dark"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {w.product?.title}
                        </h5>
                      </Link>
                      <a href="" className="text-reset">
                        <p>{w.product?.category?.title}</p>
                      </a>
                      <h6 className="mb-3 mt-auto">
                        <s>${w.product?.old_price}</s>
                        <strong className="ms-2 text-danger">
                          ${w.product?.price}
                        </strong>
                      </h6>
                      <div className="mt-auto">
                        {/* Variations Dropdown */}
                        <div className="btn-group">
                          <button
                            type="button"
                            onClick={() =>
                              addToWishlist(w.product?.id, userData?.user_id)
                            }
                            className="btn btn-danger px-3"
                          >
                            <i className="fas fa-heart" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {wishlist.length < 1 && (
              <h6 className="text-center mt-3">Your wishlist is Empty </h6>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Wishlist;
