import axios from "../axios";
export const apiGetMesagges = (pramas) =>
    axios({
        url: "message/",
        method: "get",
        pramas,
    });