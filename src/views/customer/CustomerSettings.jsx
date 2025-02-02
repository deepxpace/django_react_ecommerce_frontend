import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import UserData from "../plugin/UserData";
import apiInstance from "../../utils/axios";
import moment from "moment";

import { Toast, AlertFailed } from "../base/Alert";

function CustomerSettings() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const userData = UserData();

  // Fetch Profile Data
  const fetchProfileData = async () => {
    try {
      const res = await apiInstance.get(`user/profile/${userData?.user_id}/`);
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

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (profile.image && profile.image instanceof File) {
      formData.append("image", profile.image);
    }
    formData.append("full_name", profile.full_name);
    formData.append("address", profile.address);
    formData.append("city", profile.city);
    formData.append("state", profile.state);
    formData.append("country", profile.country);

    try {
      await apiInstance.patch(`user/profile/${userData?.user_id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update state without fetching again
      setProfile((prevProfile) => ({
        ...prevProfile,
        full_name: profile.full_name,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        image: imagePreview, // Ensure UI updates the preview
      }));

      Toast.fire({ icon: "success", title: "Profile updated successfully" });
    } catch (error) {
      AlertFailed.fire({
        icon: "error",
        title: "Something went wrong. Please try again",
      });
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

        <main className="col-lg-9 col-xl-10 ms-sm-auto px-4 py-3">
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
                        <p className="fw-semibold mb-2">{profile.full_name}</p>
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
                              Full Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your full name"
                              value={profile.full_name}
                              onChange={handleInputChange}
                              name="full_name"
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
                              value={profile.user?.phone}
                              readOnly
                            />
                          </div>

                          {/* Address */}
                          <div className="col-12">
                            <label className="form-label fw-semibold">
                              Address
                            </label>
                            <textarea
                              rows={3}
                              className="form-control"
                              placeholder="Enter your address"
                              value={profile.address}
                              onChange={handleInputChange}
                              name="address"
                            />
                          </div>

                          {/* City & State */}
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              City
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your city"
                              value={profile.city}
                              onChange={handleInputChange}
                              name="city"
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              State
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your state"
                              value={profile.state}
                              onChange={handleInputChange}
                              name="state"
                            />
                          </div>

                          {/* Country */}
                          <div className="col-12">
                            <label className="form-label fw-semibold">
                              Country
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your country"
                              value={profile.country}
                              onChange={handleInputChange}
                              name="country"
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
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CustomerSettings;
