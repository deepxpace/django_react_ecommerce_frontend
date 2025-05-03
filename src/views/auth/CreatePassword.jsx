import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../utils/auth";
import { validatePassword, validatePasswordConfirmation } from "../../utils/validation";
import { AlertFailed, Toast } from "../base/Alert";

function CreatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [missingParams, setMissingParams] = useState(false);
  
  const navigate = useNavigate();

  const [searchParam] = useSearchParams();
  const otp = searchParam.get("otp");
  const uidb64 = searchParam.get("uidb64");
  
  // Check if required parameters are present
  useEffect(() => {
    if (!otp || !uidb64) {
      setMissingParams(true);
      AlertFailed.fire({
        icon: "error",
        title: "Invalid password reset link",
        text: "Please request a new password reset link"
      });
    }
  }, [otp, uidb64]);
  
  const validateForm = () => {
    let isValid = true;
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    // Validate password confirmation
    const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
    if (!confirmValidation.isValid) {
      setConfirmPasswordError(confirmValidation.error);
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }
    
    return isValid;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Check for missing parameters
    if (missingParams) {
      AlertFailed.fire({
        icon: "error",
        title: "Invalid password reset link",
        text: "Please request a new password reset link"
      });
      return;
    }
    
    // Validate the form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(otp, uidb64, password);
      
      if (error) {
        AlertFailed.fire({
          icon: "error",
          title: error
        });
      } else {
        Toast.fire({
          icon: "success",
          title: "Password changed successfully"
        });
        // Wait 1 second then navigate to login
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error) {
      AlertFailed.fire({
        icon: "error",
        title: "Failed to reset password",
        text: "Please try again or request a new reset link"
      });
    } finally {
      setIsLoading(false);
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
                    <p className="text-center text-muted small">
                      Please enter and confirm your new password below
                    </p>
                    <br />
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="form-outline mb-4">
                        <label className="form-label">Enter New Password</label>
                        <input
                          type="password"
                          id="password"
                          required
                          name="password"
                          className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={missingParams}
                        />
                        {passwordError && (
                          <div className="invalid-feedback">{passwordError}</div>
                        )}
                        <small className="form-text text-muted">
                          Password must be at least 8 characters long
                        </small>
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
                          className={`form-control ${confirmPasswordError ? 'is-invalid' : ''}`}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={missingParams}
                        />
                        {confirmPasswordError && (
                          <div className="invalid-feedback">{confirmPasswordError}</div>
                        )}
                      </div>

                      <div className="text-center">
                        <button 
                          type="submit" 
                          className="btn btn-warning w-100"
                          disabled={isLoading || missingParams}
                        >
                          {isLoading ? (
                            <>
                              <span className="mr-2">Processing...</span>
                              <i className="fas fa-spinner fa-spin" />
                            </>
                          ) : (
                            'Reset Password'
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

export default CreatePassword;
