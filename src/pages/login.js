import React, { useState, useCallback, useEffect } from 'react';
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiForgotPassword, apiLogin } from "../apis/user";
import { register, logout } from "../store/user/userSlice";
import { getCurrent } from "../store/user/asyncAction";
import path from "../ultils/path"
import { toast } from "react-toastify";
import InputField from "../components/InputField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";


const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  const [isPageReloaded, setIsPageReloaded] = useState(false);
  const { isLoggedIn, current } = useSelector((state) => state.user);
  const [showForgetPassword, setShowForgetPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpValid, setIsOtpValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sentAttempts, setSentAttempts] = useState(0);
  const [show, setShow] = useState(false);
  const [validEmail, setValidEmail] = useState(true);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoginActive, setIsLoginActive] = useState(false);

  useEffect(() => {
    if (isLoggedIn && !isPageReloaded) {
      setTimeout(() => {
        dispatch(getCurrent()).then(() => {
          setIsUserDataLoaded(true);
          setIsPageReloaded(true);
        });
      }, 1000);
    }
  }, [dispatch, isLoggedIn, isPageReloaded]);

  const handleForgotPassword = () => {
    setShow(false); // Ẩn modal đăng nhập
    setShowForgetPassword(true); // Hiển thị modal quên mật khẩu
  };
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  const handleForgetPasswordClose = () => {
    setShowForgetPassword(false); // Đóng modal quên mật khẩu
    setShow(false); // Hiển thị lại modal đăng nhập sau khi quên mật khẩu đóng lại
  };
  const handleBackToLogin = () => {
    setShowForgetPassword(false); // Đóng modal quên mật khẩu
    setShow(true); // Hiển thị lại modal đăng nhập sau khi quên mật khẩu đóng lại
  };

  const handleClose = () => {
    setShow(false);
    setValidEmail(true); // Reset lại trạng thái email hợp lệ khi đóng modal
  };
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    dispatch(logout());
    navigate("/");
    window.location.reload();
  };
  const [payload, setPayload] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = useCallback(async () => {
    const { email, password } = payload;

    // Kiểm tra định dạng email
    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    if (!isValidEmail) {
      setValidEmail(false);
      return;
    }

    try {
      const rs = await apiLogin({ email, password });
      if (rs.success) {
        localStorage.setItem("accessToken", rs.accessToken);
        
        localStorage.setItem("userData", JSON.stringify(rs.userData));
        dispatch(
          register({
            isLoggedIn: true,
            token: rs.accessToken,
            userData: rs.userData,
          })
        );
        handleClose();
        setTimeout(() => {
          if (rs.userData && rs.userData.role == 1) {
            navigate(`/${path.ADMIN}/te`);
          } else {
            navigate(`/${path.HOME}`);
          }
        }, 1500);
      } else {
        Swal.fire("Oops!", rs.mes, "error");
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }, [payload, dispatch, navigate, current]);
  const handleForgotPasswordEr = async () => {
    try {
      if (sentAttempts >= 3) {
        const now = new Date();
        const blockedUntil = new Date(now.getTime() + 10 * 60000);
        toast.warning(`You have exceeded the maximum number of requests. Please try again after ${blockedUntil.toLocaleTimeString()}!`);
        return;
      }

      const response = await apiForgotPassword({ email });
      console.log("Response:", response);
      if (response.success) {
        toast.success(response.mes);
        setIsOtpSent(true); // Cho phép nhập OTP sau khi gửi thành công
        setSentAttempts(sentAttempts + 1); // Tăng số lần gửi lên 1
      } else {
        toast.info(response.mes);
      }
    } catch (error) {
      console.error("Error occurred:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
  };
  const handleOtpChange = (e) => {
    const otpValue = e.target.value;
    setOtp(otpValue);
    if (otpValue.length === 6) {
      setIsOtpValid(true); // Cho phép nhập password khi OTP có 6 chữ số
    } else {
      setIsOtpValid(false);
    }
  };
  return (
    <div class='login-boxchat'>
      <div class='grid view'>
        <div class='login-contanier'>
          <section class={`wrapper ${isLoginActive ? "active" : ""}`}>
            <div class="form login">
              <header class='login1' onClick={() => setIsLoginActive(false)}>Login</header>
              <form action="#">
                <InputField
                  value={payload}
                  setValue={setPayload}
                  nameKey="email"
                  placeholder="Email"
                />
                {!validEmail && (
                  <div className="invalid-feedback"
                    style={{
                      color: '#F72C5B',
                    }}>
                    Please enter a valid email address.
                  </div>
                )}
                <div class="login-password">
                  <InputField
                    value={payload}
                    setValue={setPayload}
                    nameKey="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                  /> <a
                    style={{

                    }}
                    onClick={handleTogglePassword}
                  >
                    {showPassword ? (
                      <FontAwesomeIcon icon={faEye} />
                    ) : (
                      <FontAwesomeIcon icon={faEyeSlash} />
                    )}
                  </a>
                </div>
                <a ohref="#">Forgot password?</a>
                <input type="submit" value="Login" onClick={handleSubmit} />
              </form>
            </div>
            <div class="form signup">
              <header class='signup' onClick={() => setIsLoginActive(true)}>Signup</header>
              <form action="#">
                <div class='register-fullname'>
                  <input type="text" class="register-fullname-first" placeholder="Họ" required />
                  <input type="text" class="register-fullname-last" placeholder="Tên" required />
                </div>
                <input type="text" placeholder="Email" required />
                <input type="password" placeholder="Mật khẩu" required />
                <div class="register-submit">
                  <input type="number" class="phone" placeholder="Số điện thoại" />
                  <input type="submit" class="register" value="Signup" />
                </div>
              </form>
            </div>

          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;