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

const getNewPosts = (state) => {
  state.feeds.forEach((feed) => {
    getAxiosResponse(feed.link)
      .then((res) => {
        return parse(res.data.contents);
      })
      .then((parsedRSS) => {
        parsedRSS.posts.map((post) => {
          if (state.posts.description.includes(post.description)) {
            return;
          } else {
            addPosts(feed.feedId, post, state);
          }
        })
      })
  })
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
        return getAxiosResponse(validUrl);
      })
      .then((response) => {
        const extractedData = response.data.contents;
        return parse(extractedData);
      })
       .then((parsedRSS) => {
         const feedId = createId();
         const title = parsedRSS.feed.channelTitle;
         const description = parsedRSS.feed.channelDescription;
         addFeed(feedId, title, description, watchedState);
         addPosts(feedId, parsedRSS.posts, watchedState);

         watchedState.processState = 'loaded';
         watchedState.loadedLinks.push(watchedState.rssForm.inputUrl);
         watchedState.rssForm.inputUrl = '';
       })
      .catch((error) => {
        watchedState.processState = 'error';
        watchedState.rssForm.valid = false;
        if (error.isAxiosError) {
          watchedState.processError = 'Network Error';
        } else if (error.name === 'parsingError') {
          watchedState.processError = 'noRSS';
        } else {
          watchedState.processError = error.message;
        }
      });    
  });

  if (watchedState.feeds.length !== 0) {
    setTimeout(getNewPosts, 5000);
  };
};

export default app;