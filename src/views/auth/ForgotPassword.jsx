import { useState } from "react";
import apiInstance from "../../utils/axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      await apiInstance.get(`user/password-reset/${email}/`).then((res) => {
        alert("An email has been sent to you");
      });
    } catch (error) {
      alert("Email does not exists");
    }
  };

  return (
    <section>
      <main className="" style={{ marginBottom: 100, marginTop: 50 }}>
        <div className="container">
          {/* Section: Login form */}
          <section className="">
            <div className="row d-flex justify-content-center">
              <div className="col-xl-5 col-md-8">
                <div className="card rounded-0">
                  <div className="card-body p-4">
                    <h3 className="text-center">Forgot Password</h3>
                    <br />
                    <div>
                      {/* Email input */}
                      <div className="form-outline mb-4">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="form-control"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="text-center">
                        <button
                          onClick={handleSubmit}
                          className="btn btn-warning w-100"
                        >
                          Send Email
                        </button>
                      </div>
                    </div>
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

export default ForgotPassword;
