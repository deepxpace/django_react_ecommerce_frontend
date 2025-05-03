import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useEffect, useState } from "react";

import { login } from "../../utils/auth";

import { AlertFailed } from "../base/Alert";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await login(email, password);

    if (error) {
      AlertFailed.fire({
        icon: "error",
        title: error,
      });
      setIsLoading(false);
    } else {
      navigate("/");
      resetForm();
    }

    setIsLoading(false);
  };

  return (
    <section>
      <main className="" style={{ marginBottom: 100, marginTop: 50 }}>
        <div className="container">
          {/* Section: Login form */}
          <section className="">
            <div className="row d-flex justify-content-center">
              <div className="col-xl-6 col-md-10 me-2 px-4">
                <div className="jumbotron">
                  <span className="d-flex">
                    <img
                      height={60}
                      width={60}
                      src="https://img.icons8.com/?size=100&id=66760&format=png&color=D57907"
                    />
                    <h1 className="ms-2 display-4">Welcome to Kosimart!</h1>
                  </span>
                  <p className="lead">
                    We offer the best services to help you achieve your goals.
                  </p>
                  <hr className="my-4" />
                  <p className="d-none d-lg-block">
                    Discover a world of endless possibilities where you can shop
                    from a diverse range of vendors, find unique products, and
                    enjoy a seamless shopping experience. Join Kosimart today and
                    elevate your online shopping journey!
                  </p>
                </div>
              </div>

              <div className="col-xl-5 col-md-8">
                <div className="card rounded-0">
                  <div className="card-body p-4">
                    <h3 className="text-center">Login</h3>
                    <br />
                    <form onSubmit={handleLogin}>
                      {/* Email input */}
                      <div className="form-outline mb-4">
                        <label className="form-label">Email Address</label>
                        <input
                          type="text"
                          id="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="form-control"
                          placeholder="yourmail@kosimart.com"
                          required
                        />
                      </div>

                      <div className="form-outline mb-4">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="form-control"
                          placeholder="********"
                          required
                        />
                      </div>

                      <button
                        className="btn btn-warning w-100"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="mr-2 ">Processing...</span>
                            <i className="fas fa-spinner fa-spin" />
                          </>
                        ) : (
                          <>
                            <span className="mr-2">Sign In </span>
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <p className="mt-4 text-secondary fst-italic">
                          Don't have an account?{" "}
                          <Link to="/register" className="text-primary">
                            Register
                          </Link>
                        </p>
                        <p className="mt-0">
                          <Link
                            to="/forgot-password"
                            className="text-dark link-dark link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
                          >
                            Forgot Password
                          </Link>
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </section>
  );
}

export default Login;
