import axios from "axios";

const getAxiosResponse = (link) => {
  const allOrigins = 'https://allorigins.hexlet.app/get';
  const myUrl = new URL(allOrigins);
  myUrl.searchParams.set('disableCache', 'true');
  myUrl.searchParams.set('url', link);
  console.log(myUrl.toString());
  return axios.get(myUrl);
};

export default getAxiosResponse;
