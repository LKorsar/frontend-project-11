const parse = (responseData) => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(responseData, 'text/xml');

  const parserError = xmlDocument.querySelector('parsererror');
  if (parserError) {
    const err = new Error(parserError.textContent);
    err.name = 'parsingError';
    throw err;
  } else {
    const channel = xmlDocument.querySelector('channel');
    const channelTitle = channel.querySelector('title').textContent;
    const channelDescription = channel.querySelector('description').textContent;
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
    return parsedRSS;
  }
};

export default parse;
