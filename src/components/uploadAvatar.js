import { useState } from "react";
import { apiUploadAvatar } from "../apis/user";
import testt from "../images/imgPublic/text.gif";
import "./css/uploadAvatar.css"; // Import file CSS
import { useDispatch } from "react-redux"; // Thêm để dispatch action
import { updateCurrentUser } from "../store/user/userSlice"; // Giả định action để cập nhật user


function AvatarUpload() {
const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setPreview(null);
      alert("Vui lòng chọn một file hợp lệ!");
    }
  };

const handleUpload = async () => {
  if (!file) return alert("Vui lòng chọn một ảnh.");

  const formData = new FormData();
  formData.append("avatar", file);
  setIsLoading(true);
  try {
    const response = await apiUploadAvatar(formData);
    if (response && response.user) {
      if (response.success && response.user && response.user.avatarUrl) {
        dispatch(updateCurrentUser({ avatarUrl: response.user.avatarUrl }));
        alert("Tải ảnh lên thành công!");
      } else {
        alert("Upload thành công nhưng không nhận được avatarUrl!");
      }
    } else {
      alert("Không nhận được dữ liệu từ server!");
    }
  } catch (err) {
    alert("Lỗi upload: " + (err.response?.data?.message || err.message || "Unknown error"));
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="avatar-upload-container">
      <input
        type="file"
        accept="image/*"
        id="file-input"
        onChange={handleFileChange}
      />
      <label htmlFor="file-input">Chọn ảnh</label>
      {preview && (
        <img src={preview} alt="preview" width={200} className="preview-img" />
      )}
      <button onClick={handleUpload} disabled={loading}>
        Tải ảnh lên
      </button>
      {loading && <img src={testt} alt="Loading..." className="loading-img" />}
    </div>
  );
}

export default AvatarUpload;