import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiInstance from "../../utils/axios";

function CreatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const [searchParam] = useSearchParams();
  const otp = searchParam.get("otp");
  const uidb64 = searchParam.get("uidb64");

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Password does not match");
    } else {
      const formdata = new FormData();
      formdata.append("password", password);
      formdata.append("otp", otp);
      formdata.append("uidb64", uidb64);

      try {
        await apiInstance
          .post("user/password-change/", formdata)
          .then((res) => {
            alert("Password changed successfully");
            navigate("/login");
          });
      } catch (error) {
        alert("An error occured. Please try again");
      }
    }
  };

  return (
    <section>
      <main className="" style={{ marginBottom: 100, marginTop: 50 }}>
        <div className="container">
          <section className="">
            <div className="row d-flex justify-content-center">
              <div className="col-xl-5 col-md-8">
                <div className="card rounded-0">
                  <div className="card-body p-4">
                    <h3 className="text-center">Create New Password</h3>
                    <br />
                    <form onSubmit={handlePasswordSubmit}>
                      {/* Email input */}
                      <div className="form-outline mb-4">
                        <label className="form-label">Enter New Password</label>
                        <input
                          type="password"
                          id="password"
                          required
                          name="password"
                          className="form-control"
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <div className="form-outline mb-4">
                        <label className="form-label">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          required
                          name="confirmPassword"
                          className="form-control"
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {/* {error !== null &&
                            <>
                                {error === true

                                    ? <p className='text-danger fw-bold mt-2'>Password Does Not Match</p>
                                    : <p className='text-success fw-bold mt-2'>Password Matched</p>
                                }
                            </>
                        } */}
                      </div>

                      <div className="text-center">
                        <button type="submit" className="btn btn-warning w-100">
                          Create New Password
                        </button>
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

export default CreatePassword;
