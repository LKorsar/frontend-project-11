import axios from "axios";

const getAxiosResponse = (link) => {
    const url = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`;
    return axios.get(url);
};

export default getAxiosResponse;
