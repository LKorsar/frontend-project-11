const parse = (response) => {
  console.log(response);
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(response, "application/xml");

  const errorNode = xmlDocument.querySelector('parsererror');
  if (errorNode) {
    console.log(errorNode);
    throw new Error('parsing error');
  } else {
    const channel = xmlDocument.querySelector('channel');
    const channelTitle = xmlDocument.querySelector('channel title').textContent;
    const channelDescription = xmlDocument.querySelector('channel description').textContent;
    const feed = { channelTitle, channelDescription };

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

    return Promise.resolve(parsedRSS);
  }
};

export default parse;