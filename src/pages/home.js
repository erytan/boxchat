import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./css/home.css"
import { useNavigate } from "react-router-dom";
import Sidebar from '../components/Home/sidebar';
import Headerboxchat from '../components/Home/headerboxchat';
import ChatBox from '../components/Home/chatbox';
import { getCurrent } from "../store/user/asyncAction";
import { logout } from "../store/user/userSlice";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, isLoggedIn } = useSelector((state) => state.user);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  const [isPageReloaded, setIsPageReloaded] = useState(false);

  const user = localStorage.getItem("userData");
  const userData = user ? JSON.parse(user) : null;
  useEffect(() => {
    if (!isLoggedIn || !current) {
      navigate("/", { replace: true });
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && !isPageReloaded) {
      dispatch(getCurrent()).then((result) => {
        setIsUserDataLoaded(true);
        setIsPageReloaded(true);
      });
    } else {
      setIsUserDataLoaded(true); // Đánh dấu đã xử lý nếu không có token
    }
  }, [dispatch, isLoggedIn, current, isPageReloaded, navigate]);


  return (
    <>
      {/* <Header/> */}
      <div className='home-boxchat' >
        <div className="grid view">
          <div className="home-container">
            <div className="sidebar">
              <Sidebar />
              {/* <ImageUpload/> */}
            </div>
            <div className="main">
              <Headerboxchat />
              <ChatBox />
            </div>
            <div className="right-panel">
              <div className="box">Right Panel 1</div>
              <div className="box">Right Panel 2</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
