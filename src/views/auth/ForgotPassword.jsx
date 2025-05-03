import { useState } from "react";
import { requestPasswordReset } from "../../utils/auth";
import { validateEmail } from "../../utils/validation";
import { AlertFailed, Toast } from "../base/Alert";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
      return;
    }
    
    setErrorMessage("");
    setIsLoading(true);
    
    try {
      const { error } = await requestPasswordReset(email);
      
      if (error) {
        AlertFailed.fire({
          icon: "error",
          title: error
        });
      } else {
        Toast.fire({
          icon: "success",
          title: "Password reset instructions sent to your email"
        });
      }
    } catch (error) {
      AlertFailed.fire({
        icon: "error",
        title: "User with this email doesn't exist"
      });
    } finally {
      setIsLoading(false);
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
                    <p className="text-center text-muted small">
                      Enter your email address and we'll send you instructions to reset your password.
                    </p>
                    <br />
                    <form onSubmit={handleSubmit}>
                      {/* Email input */}
                      <div className="form-outline mb-4">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className={`form-control ${errorMessage ? 'is-invalid' : ''}`}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        {errorMessage && (
                          <div className="invalid-feedback">{errorMessage}</div>
                        )}
                      </div>

                      <div className="text-center">
                        <button
                          type="submit"
                          className="btn btn-warning w-100"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="mr-2">Processing...</span>
                              <i className="fas fa-spinner fa-spin" />
                            </>
                          ) : (
                            'Send Reset Instructions'
                          )}
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

export default ForgotPassword;
