import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useEffect, useState } from "react";

import { register } from "../../utils/auth";

import { AlertFailed } from "../base/Alert";

function Register() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await register(
      fullname,
      email,
      mobile,
      password,
      password2
    );

    if (error) {
      AlertFailed.fire({
        icon: "error",
        title: "Something wrong or account already exist. Please try again",
      });
      setIsLoading(false);
    } else {
      navigate("/");
    }
  };

  return (
    <section>
      <main className="" style={{ marginBottom: 100, marginTop: 50 }}>
        <div className="container">
          {/* Section: Register form */}
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
                    <h1 className="ms-2 display-4">Welcome to Upfront!</h1>
                  </span>{" "}
                  <p className="lead">
                    We offer the best services to help you achieve your goals.
                  </p>
                  <hr className="my-4" />
                  <p className="d-none d-lg-block">
                    Discover a world of endless possibilities where you can shop
                    from a diverse range of vendors, find unique products, and
                    enjoy a seamless shopping experience. Join Upfront today and
                    elevate your online shopping journey!
                  </p>
                </div>
              </div>

              <div className="col-xl-5 col-md-8">
                <div className="card rounded-0">
                  <div className="card-body p-4">
                    <h3 className="text-center">Register</h3>
                    <br />
                    <form onSubmit={handleSubmit}>
                      <div className="form-outline mb-4">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={fullname}
                          onChange={(e) => setFullname(e.target.value)}
                          className="form-control"
                          placeholder="Your Full Name"
                          required
                        />
                      </div>

                      {/* Email input */}
                      <div className="form-outline mb-4">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="form-control"
                          placeholder="yourmail@upfront.com"
                          required
                        />
                      </div>

                      <div className="form-outline mb-4">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="phone"
                          id="phone"
                          name="phone"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          className="form-control"
                          placeholder="+1 (650) 453-2077"
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

                      <div className="form-outline mb-4">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type="password"
                          id="password2"
                          name="password2"
                          value={password2}
                          onChange={(e) => setPassword2(e.target.value)}
                          className="form-control"
                          placeholder="********"
                          required
                        />
                      </div>

                      <button className="btn btn-warning w-100" type="submit">
                        {isLoading ? (
                          <>
                            <span className="mr-2 ">Processing...</span>
                            <i className="fas fa-spinner fa-spin" />
                          </>
                        ) : (
                          <>
                            <span className="mr-2">Sign up </span>
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <p className="mt-4 text-secondary fst-italic">
                          Already have an account?{" "}
                          <Link to="/login" className="text-primary">
                            Login
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

export default Register;
