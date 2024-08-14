import axios from "axios";

const getAxiosResponse = (link) => {
  const myUrl = new URL('/get', 'https://allorigins.hexlet.app');
  myUrl.searchParams.set('disableCache', 'true');
  myUrl.searchParams.set('url', link);
  console.log(myUrl.toString());
  // `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`;
  return axios.get(myUrl);
};

export default getAxiosResponse;
