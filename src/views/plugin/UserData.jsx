import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../../store/auth";

function UserData() {
  // Use the store user first as the source of truth
  const storeUser = useAuthStore(state => state.user);
  
  if (storeUser && storeUser.user_id) {
    return storeUser;
  }
  
  // Fall back to tokens if the store is empty
  let access_token = Cookies.get("access_token");
  let refresh_token = Cookies.get("refresh_token");

  if (access_token && refresh_token) {
    try {
      // First try access token
      const decodedAccess = jwtDecode(access_token);
      if (decodedAccess && decodedAccess.user_id) {
        return decodedAccess;
      }
      
      // Fallback to refresh token
      const decodedRefresh = jwtDecode(refresh_token);
      if (decodedRefresh && decodedRefresh.user_id) {
        return decodedRefresh;
      }
    } catch (error) {
      console.error("Error decoding tokens:", error);
    }
  }
  
  // Return a default object with null values to prevent undefined errors
  return { 
    user_id: null,
    username: null,
    email: null
  };
}

export default UserData;
