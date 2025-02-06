import React, { useState, useEffect, useMemo } from "react";
import apiInstance from "../../utils/axios";
import Sidebar from "./Sidebar";
import UserData from "../plugin/UserData";
import moment from "moment";

import { Toast, AlertFailed } from "../base/Alert";
import { Link } from "react-router-dom";

function SettingsVendor() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [profile, setProfile] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const userData = UserData();

  // Fetch Profile Data
  const fetchProfileData = async () => {
    try {
      const res = await apiInstance.get(
        `vendor-shop-settings/${userData?.vendor_id}/`
      );
      setProfile(res.data);
      setImagePreview(res.data.image); // Set initial image preview
    } catch (error) {
      console.error("Failed to fetch profile data", error);
    }
  };

  // Handle Input Change
  const handleInputChange = (event) => {
    setProfile({
      ...profile,
      [event.target.name]: event.target.value,
    });
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (profile.image && profile.image instanceof File) {
      formData.append("image", profile.image);
    }
    formData.append("name", profile.name);
    formData.append("description", profile.description);

    try {
      await apiInstance.patch(
        `vendor-shop-settings/${userData?.vendor_id}/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Update state without fetching again
      setProfile((prevProfile) => ({
        ...prevProfile,
        name: profile.name,
        description: profile.description,
        image: imagePreview, // Ensure UI updates the preview
      }));

      Toast.fire({
        icon: "success",
        title: "Store Profile updated successfully",
      });
    } catch (error) {
      AlertFailed.fire({
        icon: "error",
        title: "Something went wrong. Please try again",
      });
    }
  };

  // Handle Image Change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfile({
        ...profile,
        image: file, // Update state with file
      });

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchProfileData();
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

        {/* Main Content */}
        <main className="col-lg-9 col-xl-10 ms-sm-auto px-4 pt-3">
          <div className="row">
            <div className="">
              <div className="card border">
                <div className="card-body p-4">
                  <h6 className="card-title mb-4">
                    <i className="fas fa-gear text-warning me-2"></i> Settings
                  </h6>

                  <form
                    onSubmit={handleFormSubmit}
                    encType="multipart/form-data"
                  >
                    <div className="row">
                      {/* Left Section - Profile Info */}
                      <div className="col-md-4 text-center mb-4">
                        <div
                          className="position-relative d-inline-block mb-3"
                          style={{ width: "140px", height: "140px" }}
                        >
                          <img
                            src={imagePreview || profile.image}
                            className="rounded-circle border shadow-sm"
                            alt="Profile"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <label
                            htmlFor="profileImageUpload"
                            className="position-absolute bottom-0 end-0 btn-warning text-white rounded-circle"
                            style={{
                              cursor: "pointer",
                              width: "40px",
                              height: "40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i className="fas fa-camera"></i>
                          </label>
                          <input
                            type="file"
                            id="profileImageUpload"
                            className="d-none"
                            accept="image/*"
                            onChange={handleImageChange}
                            name="image"
                          />
                        </div>
                        <p className="fw-semibold mb-2">{profile.name}</p>
                        <small className="text-muted">
                          {profile.user?.email}
                        </small>
                      </div>

                      {/* Right Section - User Details Form */}
                      <div className="col-md-8">
                        <div className="row g-3">
                          {/* Full Name */}
                          <div className="col-12">
                            <label className="form-label fw-semibold">
                              Store Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your full name"
                              value={profile.name}
                              onChange={handleInputChange}
                              name="name"
                            />
                          </div>

                          {/* Email & Mobile */}
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Email Address
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              placeholder="Enter your email"
                              value={profile.user?.email}
                              readOnly
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Mobile
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your mobile number"
                              value={profile.mobile}
                              readOnly
                            />
                          </div>

                          {/* About */}
                          <div className="col-12">
                            <label className="form-label fw-semibold">
                              About Me
                            </label>
                            <textarea
                              rows={3}
                              className="form-control"
                              placeholder="Tell us about your store"
                              value={profile.description}
                              onChange={handleInputChange}
                              name="description"
                            />
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="text-end mt-4">
                          <button
                            type="submit"
                            className="btn btn-warning px-4"
                          >
                            Save Changes
                          </button>

                          {/* View Store Button */}
                          <Link
                            to={`/vendor/${profile.slug}/`}
                            className="text-end ms-3 mt-4"
                          >
                            <button type="button" className="btn btn-dark px-4">
                              View Store
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>{" "}
        </main>
      </div>
    </div>
  );
}

export default SettingsVendor;
