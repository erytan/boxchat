import React, { useState, useEffect, useRef } from 'react';
import Tree from '../../images/imgPublic/1744896_6499d.gif';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { apiGetMission, apiUpdateMission, apiCreateMission, apiDeleteMission } from '../../apis/mission';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import InputField from '../InputField';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../css/sidebar.css"

const Sidebar = () => {
    const [showPopupCreateMission, setShowPopupCreateMission] = useState(false);
    const [showPopupUpdateMission, setShowPopupUpdateMission] = useState(false);
    const [showPopupDeleteMission, setshowPopupDeleteMission] = useState(false);
    const [selectedMission, setSelectedMission] = useState(null);
    const [isVisibleMissionHide, setIsVisibleMissionHide] = useState(true);
    const [isStrikethrough, setIsStrikethrough] = useState([]);
    const [isStrikethroughUnDone, setIsStrikethroughUnDone] = useState([]);
    const [, setDisappearingMissions] = useState([]);
    const [missions, setMissions] = useState([]);
    const [isVisibleMission, setIsVisibleMission] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toastId = useRef(null);
    const [payload, setPayload] = useState({
        nameMission: '',
        link: '',
        address: '',
        fullName: '',
    });
    useEffect(() => {
        const boxLeft = document.querySelector('.box-left');
        const handleScroll = () => {
            const header = document.getElementById('box-header');
            if (boxLeft && boxLeft.scrollTop > 15) {
                header.classList.add('fixed');
            } else {
                header.classList.remove('fixed');
            }
        };

        if (boxLeft) {
            boxLeft.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (boxLeft) {
                boxLeft.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);
    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const response = await apiGetMission();
                if (response?.mission && Array.isArray(response.mission)) {
                    const validMissions = response.mission.filter(
                        mission =>
                            mission &&
                            mission._id &&
                            mission.task !== undefined &&
                            mission.nameMission !== undefined
                    );
                    setMissions(validMissions);
                } else {
                    toast.error('Dữ liệu không hợp lệ.');
                }
            } catch (error) {
                toast.error('Lỗi khi tải dữ liệu: ' + error.message);
            }
        };
        fetchMissions();
    }, []);

    const handleClickMissionUpdate = async (updatedMission) => {
        try {
            const response = await apiUpdateMission(updatedMission._id, updatedMission);
            if (response.success) {
                toast.success('Cập nhật thành công.');
                setShowPopupUpdateMission(false);
                setSelectedMission(null);
                setMissions(prev =>
                    prev.map(m => (m._id === updatedMission._id ? { ...m, ...updatedMission } : m))
                );
            } else {
                toast.error('Cập nhật thất bại.');
            }
        } catch (error) {
            toast.error('Lỗi: ' + error.message);
        }
    };
    const handleClickDeleteMission = async (id) => {
        toastId.current = toast.loading("Đang xóa...");

        try {
            const response = await apiDeleteMission(id);
            if (response.success) {
                if (toast.isActive(toastId.current)) {
                    toast.update(toastId.current, {
                        render: "Xóa nhiệm vụ thành công",
                        type: "success",
                        isLoading: false,
                        autoClose: 3000,
                        closeOnClick: true,
                    });
                }
                setShowPopupUpdateMission(false);
                setSelectedMission(null);
                setMissions(prev => prev.filter(m => m._id !== id));
            } else {
                if (toast.isActive(toastId.current)) {
                    toast.update(toastId.current, {
                        render: "Xóa nhiệm vụ thất bại",
                        type: "error",
                        isLoading: false,
                        autoClose: 3000,
                    });
                }
            }
        } catch (error) {
            if (toast.isActive(toastId.current)) {
                toast.update(toastId.current, {
                    render: "Lỗi khi xóa: " + error.message,
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        }
    };
    const handleClickMissionAdd = async (event) => {
        event.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        const { link, nameMission, address, fullName } = payload;
        try {
            const response = await apiCreateMission({
                link,
                nameMission,
                address,
                fullName,
                task: '1',
            });
            if (response?.success) {
                const updatedResponse = await apiGetMission();
                if (updatedResponse?.mission && Array.isArray(updatedResponse.mission)) {
                    const validMissions = updatedResponse.mission.filter(
                        mission =>
                            mission &&
                            mission._id &&
                            mission.task !== undefined &&
                            mission.nameMission !== undefined
                    );
                    setMissions(validMissions);
                }
                toast.success('Tạo mới thành công.');
                setShowPopupCreateMission(false);
                setPayload({
                    nameMission: '',
                    link: '',
                    address: '',
                    fullName: '',
                });
            } else {
                toast.error('Tạo thất bại: Dữ liệu không hợp lệ.');
            }
        } catch (error) {
            toast.error('Lỗi: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };
    const handleClickPopUpDeleteMission = () => {
        setshowPopupDeleteMission(true);
    }
    const handleClosePopUpDeleteMission = () => {
        setshowPopupDeleteMission(false);
    }

    const handleClickPopUpAddMission = () => {
        setShowPopupCreateMission(true);
    };

    const handleClosePopUpAddMission = () => {
        setShowPopupCreateMission(false);
    };

    const handleClickPopUpFixMission = () => {
        setShowPopupUpdateMission(true);
    };

    const handleClosePopUpFixMission = () => {
        setShowPopupUpdateMission(false);
    };

    const handleClickMissionDone = () => {
        setIsVisibleMission(prev => !prev);
        setIsVisibleMissionHide(prev => !prev);
    };

    const handleClickMissionUndone = async (id) => {
        try {
            setDisappearingMissions(prev => [...prev, id]);
            setTimeout(async () => {
                await apiUpdateMission(id, { task: '1' });
                setIsStrikethroughUnDone(prev =>
                    prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
                );
                setMissions(prevMissions =>
                    prevMissions.map(mission =>
                        mission._id === id ? { ...mission, task: '1' } : mission
                    )
                );
                setDisappearingMissions(prev => prev.filter(missionId => missionId !== id));
            }, 1000);
        } catch (error) {
            toast.error('Lỗi: ' + error.message);
        }
    };

    const handleClickMission = async (id) => {
        try {
            setDisappearingMissions(prev => [...prev, id]);
            setIsStrikethrough(prev =>
                prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
            );
            setTimeout(async () => {
                await apiUpdateMission(id, { task: '2' });
                setMissions(prevMissions =>
                    prevMissions.map(mission =>
                        mission._id === id ? { ...mission, task: '2' } : mission
                    )
                );
                setDisappearingMissions(prev => prev.filter(missionId => missionId !== id));
            }, 1000);
        } catch (error) {
            toast.error('Lỗi: ' + error.message);
        }
    };

    return (
        <>
            <div className="box">
                <img className="box-tree" src={Tree} alt="Tree" />
            </div>
            <div className="box-left">
                <header id="box-header" className="">
                    <h3>Danh sách kế hoạch</h3>
                    <div className="my-news-rs" onClick={handleClickMissionDone}>
                        <div className="btn flex-center">
                            <FontAwesomeIcon icon={faBars} />
                        </div>
                    </div>
                </header>
                <div className={`box-mission-done ${isVisibleMission ? 'slide-down' : 'slide-up'}`}>
                    <h3 className="box-title">☑️ Đã xong</h3>
                    {missions
                        .filter((mission) => {
                            if (!mission || mission.task === undefined || mission.nameMission === undefined) {
                                return false;
                            }
                            return String(mission.task) === '2';
                        })
                        .reverse()
                        .map((mission) => (
                            <div key={mission._id} className="task-mission">
                                <div className="task-tick" onClick={() => handleClickMissionUndone(mission._id)}></div>
                                <div className="content-mission">
                                    <h3 className="mission-title">{mission.nameMission || 'Không có tiêu đề'}</h3>
                                    <div className="mission-descript">
                                        <p>✨</p>
                                        <p
                                            className={
                                                isStrikethroughUnDone.includes(mission._id)
                                                    ? 'strikethroughUnDone'
                                                    : 'strikethrough'
                                            }
                                        >
                                            {mission.fullName || 'Không có'}
                                        </p>
                                    </div>
                                    <div className="mission-descript">
                                        <p>✨</p>
                                        <p
                                            className={
                                                isStrikethroughUnDone.includes(mission._id)
                                                    ? 'strikethroughUnDone'
                                                    : 'strikethrough'
                                            }
                                        >
                                            {mission.address || 'Không có'}
                                        </p>
                                    </div>
                                    <div className="mission-descript">
                                        <p>✨</p>
                                        <p
                                            className={
                                                isStrikethroughUnDone.includes(mission._id)
                                                    ? 'strikethroughUnDone'
                                                    : 'strikethrough'
                                            }
                                        >
                                            {mission.link || 'Không có'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
                {isVisibleMissionHide && (
                    <div className="box-mission">
                        <div className="cd-box-mission">
                            <h3 className="box-title">📝 Cần làm</h3>
                            <div className="crud-sidebar-box">
                                <div className="box-mission-add" onClick={handleClickPopUpAddMission}></div>
                                {showPopupCreateMission && (
                                    <div className="popup-container-mission-add">
                                        <div className="popup-mission-add">
                                            <h4 className="pop-up-tiltle-mission">Nhiệm vụ mới</h4>
                                            <InputField
                                                value={payload}
                                                setValue={setPayload}
                                                nameKey="nameMission"
                                                placeholder="Chủ đề"
                                            />
                                            <InputField
                                                value={payload}
                                                setValue={setPayload}
                                                nameKey="fullName"
                                                placeholder="Tên nơi đến"
                                            />
                                            <InputField
                                                value={payload}
                                                setValue={setPayload}
                                                nameKey="address"
                                                placeholder="Địa chỉ"
                                            />
                                            <InputField
                                                value={payload}
                                                setValue={setPayload}
                                                nameKey="link"
                                                placeholder="Đường dẫn"
                                            />
                                            <div className="popup-actions">
                                                <button
                                                    onClick={handleClosePopUpAddMission}
                                                    className="mission-cancel"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={handleClickMissionAdd}
                                                    className="mission-add-btn"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'Đang thêm...' : 'Thêm'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="box-mission-fix" onClick={handleClickPopUpFixMission}></div>
                                {showPopupUpdateMission && (
                                    <div className="popup-container-mission-add">
                                        {!selectedMission ? (
                                            <div className="popup-mission-add">
                                                <h4 className="pop-up-tiltle-mission">Chọn nhiệm vụ để cập nhật</h4>
                                                <div className="mission-list">
                                                    {missions.map((mission) => (
                                                        <div
                                                            key={mission._id}
                                                            className="mission-item"
                                                            onClick={() => setSelectedMission(mission)}
                                                        >
                                                            📝 {mission.nameMission || 'Không có tiêu đề'} —{' '}
                                                            {mission.fullName || 'Không có'}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="popup-actions">
                                                    <button
                                                        onClick={handleClosePopUpFixMission}
                                                        className="mission-cancel"
                                                    >
                                                        Đóng
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="popup-mission-add">
                                                <h4 className="pop-up-tiltle-mission">Cập nhật nhiệm vụ</h4>
                                                <InputField
                                                    value={selectedMission}
                                                    setValue={setSelectedMission}
                                                    nameKey="nameMission"
                                                    placeholder="Chủ đề"
                                                />
                                                <InputField
                                                    value={selectedMission}
                                                    setValue={setSelectedMission}
                                                    nameKey="fullName"
                                                    placeholder="Tên nơi đến"
                                                />
                                                <InputField
                                                    value={selectedMission}
                                                    setValue={setSelectedMission}
                                                    nameKey="address"
                                                    placeholder="Địa chỉ"
                                                />
                                                <InputField
                                                    value={selectedMission}
                                                    setValue={setSelectedMission}
                                                    nameKey="link"
                                                    placeholder="Đường dẫn"
                                                />
                                                <div className="popup-actions">
                                                    <button
                                                        onClick={() => setSelectedMission(null)}
                                                        className="mission-cancel"
                                                    >
                                                        Quay lại
                                                    </button>
                                                    <button
                                                        onClick={() => handleClickMissionUpdate(selectedMission)}
                                                        className="mission-add-btn"
                                                    >
                                                        Cập nhật
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="box-mission-delete" onClick={handleClickPopUpDeleteMission}></div>
                                {showPopupDeleteMission && (
                                    <div className="popup-container-mission-add">
                                        {!selectedMission ? (
                                            <div className="popup-mission-add">
                                                <h4 className="pop-up-tiltle-mission">Chọn nhiệm vụ để xóa</h4>
                                                <div className="mission-list">
                                                    {missions.map((mission) => (
                                                        <div
                                                            key={mission._id}
                                                            className="mission-item"
                                                            onClick={() => setSelectedMission(mission)}
                                                        >
                                                            🗑️ {mission.nameMission || 'Không có tiêu đề'} —{' '}
                                                            {mission.fullName || 'Không có'}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="popup-actions">
                                                    <button
                                                        onClick={handleClosePopUpDeleteMission}
                                                        className="mission-cancel"
                                                    >
                                                        Đóng
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="popup-mission-add">
                                                <h4 className="pop-up-tiltle-mission">Xác nhận xóa nhiệm vụ</h4>
                                                <p>Bạn có chắc muốn xóa nhiệm vụ "<strong>{selectedMission.nameMission}</strong>"?</p>
                                                <div className="popup-actions">
                                                    <button
                                                        onClick={() => setSelectedMission(null)}
                                                        className="mission-cancel"
                                                    >
                                                        Quay lại
                                                    </button>
                                                    <button
                                                        onClick={() => handleClickDeleteMission(selectedMission._id)}
                                                        className="mission-add-btn"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {missions
                            .filter((mission) => {
                                if (
                                    !mission ||
                                    mission.task === undefined ||
                                    mission.nameMission === undefined
                                ) {
                                    return false;
                                }
                                return String(mission.task) === '1';
                            })
                            .reverse()
                            .map((mission) => (
                                <div key={mission._id} className="task-mission">
                                    <div
                                        className="task-tick"
                                        onClick={() => handleClickMission(mission._id)}
                                    ></div>
                                    <div className="content-mission">
                                        <h3 className="mission-title">{mission.nameMission || 'Không có tiêu đề'}</h3>
                                        <div className="mission-descript">
                                            <p>✨</p>
                                            <p
                                                className={
                                                    isStrikethrough.includes(mission._id)
                                                        ? 'strikethrough'
                                                        : 'chat-box'
                                                }
                                            >
                                                {mission.fullName || 'Không có'}
                                            </p>
                                        </div>
                                        <div className="mission-descript">
                                            <p>✨</p>
                                            <p
                                                className={
                                                    isStrikethrough.includes(mission._id)
                                                        ? 'strikethrough'
                                                        : 'chat-box'
                                                }
                                            >
                                                {mission.address || 'Không có'}
                                            </p>
                                        </div>
                                        <div className="mission-descript">
                                            <p>✨</p>
                                            <p
                                                className={
                                                    isStrikethrough.includes(mission._id)
                                                        ? 'strikethrough'
                                                        : 'chat-box'
                                                }
                                            >
                                                {mission.link || 'Không có'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
                <ToastContainer position="bottom-right" autoClose={1000} />
            </div>

        </>
    );
};

export default Sidebar;