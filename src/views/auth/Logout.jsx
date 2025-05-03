import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { logout } from "../../utils/auth";

function Logout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    logout();
  }, []);

  return (
    <section
      className="position-relative"
      style={{
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        className="position-absolute top-0 start-0 w-100 h-100 opacity-15"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "multiply",
          zIndex: 0,
        }}
      ></div>

      <main className="position-relative py-5" style={{ zIndex: 1 }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 col-xl-8">
              <div
                className="card border-1 border-light rounded-1 overflow-hidden"
                style={{
                  animation: "cardEntrance 0.8s ease-out",
                }}
              >
                <div className="row g-0">
                  <div className="col-md-6 d-none d-md-block position-relative">
                    <div
                      className="h-100 btn-dark"
                      style={{
                        padding: "2rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="text-white mb-5">
                        <h2 className="display-6 fw-bold mb-4">
                          Kosimart Market
                        </h2>
                        <p className="lead mb-0">
                          Your trusted marketplace for quality products and
                          reliable vendors
                        </p>
                      </div>

                      <div className="text-white opacity-75">
                        <div className="d-flex align-items-center mb-3">
                          <i className="fas fa-shield-alt fa-fw me-3"></i>
                          <span>Secure transactions guaranteed</span>
                        </div>
                        <div className="d-flex align-items-center mb-3">
                          <i className="fas fa-certificate fa-fw me-3"></i>
                          <span>Verified vendors only</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-headset fa-fw me-3"></i>
                          <span>24/7 Customer support</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card-body p-4 p-xl-5">
                      <div className="text-center mb-4">
                        <div className="icon-container mb-4">
                          <img src="https://img.icons8.com/?size=80&id=66760&format=png&color=D57907" />
                        </div>
                        <h1 className="h2 mb-3 fw-bold text-warning">
                          See You Soon!
                        </h1>
                        <p className="text-muted mb-4">
                          You've been successfully logged out. Our marketplace
                          continues to grow with:
                        </p>
                        <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                          <span
                            className="badge text-dark"
                            style={{ background: "#EEF2F7" }}
                          >
                            <i className="fas fa-store-alt me-2"></i>10K+
                            Vendors
                          </span>
                          <span
                            className="badge text-dark"
                            style={{ background: "#EEF2F7", color: "#2B4162" }}
                          >
                            <i className="fas fa-box me-2"></i>100K+ Products
                          </span>
                          <span
                            className="badge text-dark"
                            style={{ background: "#EEF2F7", color: "#2B4162" }}
                          >
                            <i className="fas fa-users me-2"></i>1M+ Customers
                          </span>
                        </div>
                      </div>

                      <div className="d-flex flex-column gap-3">
                        <Link
                          to="/login"
                          className="btn btn-lg py-3 fw-bold text-white btn-warning"
                          style={{
                            transition: "all 0.3s ease",
                            letterSpacing: "0.5px",
                          }}
                        >
                          <i className="fas fa-sign-in-alt me-2"></i> Sign In
                          Again
                        </Link>

                        <div className="text-center py-3 position-relative">
                          <span
                            className="bg-white px-3 text-muted"
                            style={{ position: "relative", zIndex: 1 }}
                          >
                            Want to sell with us?
                          </span>
                          <hr className="position-absolute top-50 start-0 w-100 opacity-25" />
                        </div>

                        <Link
                          to="/register"
                          className="btn btn-lg py-3 fw-bold btn-dark"
                        >
                          <i className="fas fa-store me-2"></i> Become a Vendor
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-5">
                <p className="text-muted mb-4">
                  Trusted by leading brands worldwide
                </p>
                <div className="row g-4 justify-content-center align-items-center">
                  <div className="col-auto">
                    <div className="d-flex align-items-center text-muted">
                      <i className="fas fa-shield-alt fa-2x me-2"></i>
                      <span>SSL Secure</span>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="d-flex align-items-center text-muted">
                      <i className="fas fa-lock fa-2x me-2"></i>
                      <span>PCI Compliant</span>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="d-flex align-items-center text-muted">
                      <i className="fas fa-user-shield fa-2x me-2"></i>
                      <span>GDPR Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>
        {`
          @keyframes cardEntrance {
            from { 
              opacity: 0;
              transform: translateY(20px) scale(0.98);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .icon-container {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </section>
  );
}

export default Logout;
