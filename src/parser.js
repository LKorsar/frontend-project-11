const parse = (responseData) => {
  // console.log(responseData);
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(responseData, "text/xml");

  const errorNode = xmlDocument.querySelector('parsererror');
  if (errorNode) {
    console.log(errorNode);
    throw new Error('parsing error');
  } else {
    const channel = xmlDocument.querySelector('channel');
    const channelTitle = channel.querySelector('title').textContent;
    const channelDescription = channel.querySelector('description').textContent;
    const feed = { channelTitle, channelDescription };
    console.log(feed);

    const itemElements = channel.querySelectorAll('item');
    const posts = [...itemElements].map((item) => {
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      const link = item.querySelector('link').textContent;
      return {
        title,
        description,
        link,
      };
    });

    const parsedRSS = { feed, posts };
    return parsedRSS;
    //return Promise.resolve(parsedRSS);
  }
};

export default parse;