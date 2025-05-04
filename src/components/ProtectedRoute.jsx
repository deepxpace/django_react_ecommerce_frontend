import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useEffect, useState } from "react";
import apiInstance from "../utils/axios";

/**
 * Enhanced ProtectedRoute that handles role-based access control
 * - Checks if user is logged in
 * - For vendor routes, checks if user is a vendor
 * - Redirects to appropriate pages based on role
 */
const ProtectedRoute = ({ children, vendorOnly = false }) => {
  const loggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const allUserData = useAuthStore((state) => state.allUserData);
  const [isVendor, setIsVendor] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determine if route is a vendor route
  const isVendorRoute = window.location.pathname.includes("/admin");

  useEffect(() => {
    if (loggedIn && user) {
      // Check if we already have vendor_id in user data
      if (allUserData && allUserData.vendor_id) {
        setIsVendor(allUserData.vendor_id > 0);
        setLoading(false);
      } else {
        // Fetch user profile to check vendor status
        apiInstance.get(`user/profile/${user.user_id}/`)
          .then(res => {
            setIsVendor(res.data.is_vendor === true);
            setLoading(false);
          })
          .catch(() => {
            setIsVendor(false);
            setLoading(false);
          });
      }
    } else {
      setLoading(false);
    }
  }, [loggedIn, user, allUserData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in - redirect to login
  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  // Vendor accessing vendor route - allow
  if (isVendor && isVendorRoute) {
    return <>{children}</>;
  }

  // Customer accessing customer route - allow
  if (!isVendorRoute && !vendorOnly) {
    return <>{children}</>;
  }

  // Customer accessing vendor route - redirect to customer dashboard
  if (!isVendor && isVendorRoute) {
    return <Navigate to="/account" />;
  }

  // Vendor accessing customer-only route - redirect to vendor dashboard
  if (isVendor && !isVendorRoute && vendorOnly) {
    return <Navigate to="/admin" />;
  }

  // Default fallback - allow access
  return <>{children}</>;
};

export default ProtectedRoute; 