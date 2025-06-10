import axios from "../axios";
export const apiGetMission = (data) =>
    axios({
        url: "mission/",
        method: "get",
        data,
    });
export const apiUpdateMission = (sid, data) =>
    axios({
        url: `mission/${sid}`,
        method: "put",
        data,
    });
export const apiCreateMission = (data) =>
    axios({
        url: "mission/create-mission",
        method: "post",
        data,
    });
export const apiDeleteMission = async (id) =>
    axios({
        url: `mission/` + id,
        method: "delete",
    });
