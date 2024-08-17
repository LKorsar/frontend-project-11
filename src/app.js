import  './styles.scss';
import  'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import resources from './locales/index.js';
import view from './view.js';
import getAxiosResponse from './getAxiosResponse.js';
import parse from './parser.js';

const validateURL = (url, urlList) => {
  const schema = yup.string()
    .trim()
    .url()
    .notOneOf(urlList);
  return schema.validate(url);
};

const createId = () => {
  return _.uniqueId();
};

const addFeed = (id, title, description, state) => {
  state.feeds.push({ 
    feedId: id,
    feedTitle: title,
    feedDescription: description,
    link: state.rssForm.inputUrl,
  });
};

const addPosts = (feedId, posts, state) => {
  const feedPosts = posts.map((post) => ({
    feedId: feedId,
    id: createId(),
    title: post.title,
    description: post.description,
    link: post.link,
  }));
  state.posts = feedPosts.concat(state.posts);
};

const app = () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('button[aria-label="add"]'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    feedback: document.querySelector('.feedback'),
  };

  const state = {
    processState: 'filling',
    processError: null,
    rssForm: {
      valid: null,
      inputUrl: '',
    },
    feeds: [],
    posts: [],
    loadedLinks: [],
  };
  
  const defaultLang = 'ru';
  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  })
    .then(() => {
      yup.setLocale({
        mixed: {
          notOneOf: () => ({ key: 'feedbacks.feedbackRepeat' }),
        },
        string: {
          url: () => ({ key: 'feedbacks.feedbackWrongURL' }),
        }
      });
    })
    .catch(() => console.log('i18next instance caused an error'));

  const watchedState = view(elements, i18n, state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = formData.get('url');
    watchedState.rssForm.inputUrl = data;

    validateURL(watchedState.rssForm.inputUrl, watchedState.loadedLinks)
      .then((validUrl) => {
        watchedState.rssForm.valid = true;
        watchedState.processState = 'request';
        console.log(validUrl);
        return getAxiosResponse(validUrl);
      })
      .then((response) => {
        const extractedData = response.data.contents;
        return parse(extractedData);
      })
       .then((parsedRSS) => {
         console.log(parsedRSS.feed);
         const feedId = createId();
         const title = parsedRSS.feed.channelTitle;
         const description = parsedRSS.feed.channelDescription;
         addFeed(feedId, title, description, watchedState);
         addPosts(feedId, parsedRSS.posts, watchedState);

         watchedState.processState = 'loaded';
         watchedState.loadedLinks.push(watchedState.rssForm.inputUrl);
         console.log(watchedState.loadedLinks);
         watchedState.rssForm.inputUrl = '';
       })
      .catch((error) => {
        console.log(watchedState);
        console.log(error);
        watchedState.processError = error.message;
        watchedState.processState = 'error';
        watchedState.rssForm.valid = false;
      });    
  });
};

export default app;