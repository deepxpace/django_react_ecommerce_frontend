import { useAuthStore } from "../../store/auth";
import { Link } from "react-router-dom";

function Dashboard() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);

  return (
    <>
      {isLoggedIn() ? (
        <div>
          <h1>Dashboard</h1>
          <Link to={"/logout"}>Logout</Link>
        </div>
      ) : (
        <div>
          Home Page
          <Link to={"/register"}>Register</Link>
          <br></br>
          <Link to={"/login"}>Login</Link>
        </div>
      )}
    </>
  );
}

export default Dashboard;
