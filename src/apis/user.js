import axios from "../axios";
export const apiLogin = (data) => axios.post("user/login", data);
export const apiGetUSER = () => {
  const token = localStorage.getItem('accessToken'); // Lấy token từ localStorage
  return axios.get("user/current", {
    headers: { Authorization: `Bearer ${token}` }, // Đính kèm token vào request
  });
};
export const apiGetAllUSER = (data) =>
  axios({
    url: "user/",
    method: "get",
    data,
  });
export const apiForgotPassword = (data) =>
  axios({
    url: "user/forgetpassword",
    method: "post",
    data,
  });
export const apiResetPassword = (data) =>
  axios({
    url: "user/resetpassword",
    method: "put",
    data,
  });
export const apiRefreshAccessToken = () =>
  axios({
    url: '/user/refreshAccessToken',
    method: 'post',
    withCredentials: true,
  });
export const apiUploadAvatar = (formData) =>
  axios.post("user/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });