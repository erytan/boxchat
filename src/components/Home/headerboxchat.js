import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrent } from "../../store/user/asyncAction";
import { logout } from "../../store/user/userSlice";
import ImageUpload from '../uploadAvatar';

const Headerboxchat = () => {
  const [showPopUpUpdate, setShowPopUpUpdate] = useState(false)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, current } = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user data only when logged in
  useEffect(() => {
    if (isLoggedIn && !current) {
      dispatch(getCurrent());
    }
  }, [dispatch, isLoggedIn, current]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout with explicit clearing of localStorage
  const handleLogout = async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");

      //Kiểm tra xem localStorage đã xóa được chua7
      if (localStorage.getItem("accessToken") || localStorage.getItem("userData")) {
      }
      //Dispatch action lougout để xóa trạng thái trong Redux

      dispatch(logout());
      navigate("/", { replace: true });
    }
    catch (error) {
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Prevent rendering if not logged in or current is null/undefined
  if (!isLoggedIn || !current || !current.firstname) return null;

  const handleClickUpdate = () => {
    setShowPopUpUpdate(true);
  }
  const handleCloseUpdate = () => {
    setShowPopUpUpdate(false);
  }

  return (
    <div className="header box">
      <div className="dots" onClick={toggleDropdown}>
        <div className="dotlist">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
        <div className="Test-upload">

        </div>
      </div>

      {isOpen && (
        <div className="drop-down-user" ref={dropdownRef}>
          <div className="drop-down-user-list">
            <div className="drop-down-update-user" onClick={handleClickUpdate}>
              Cập nhật
              {showPopUpUpdate && (
                <div className="popup-container-update">
                  <div className="Update-img">
                    <ImageUpload />
                    <div className="popup-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn chặn sự kiện lan lên cha
                          handleCloseUpdate();
                        }}
                        className="mission-add-btn"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
            <div className="drop-down-logout-user" onClick={handleLogout}>
              Đăng xuất
            </div>
          </div>
        </div>
      )}

      <div className="useInfor">
        <div className="circle">
          <img
            src={current.avatarUrl || "/default-avatar.png"}
            alt="avatar"
            className="avatar-img"
          />
        </div>
        <div className="name-user">
          {`${current.firstname || ""} ${current.lastname || ""}`.trim()}
        </div>
      </div>
    </div>
  );
};

export default Headerboxchat;