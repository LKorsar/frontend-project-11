import  './styles.scss';
import  'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import resources from './locales/index.js';
import view from './view.js';
import getAxiosResponse from './getAxiosResponse.js';
import parse from './parser.js';

const createId = () => {
  return _.uniqueId();
};

const addFeed = (id, title, description, state) => {
  state.feeds.push({ 
    feedId: id,
    feedTitle: title,
    feedDescription: description,
  });
};

const addPosts = (feedId, posts, state) => {
  const feedPosts = posts.map((post) => ({
    feedId,
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
    postsList: document.querySelector('.posts'),
    feedsList: document.querySelector('.feeds'),
    feedback: document.querySelector('.feedback'),
  };

  const state = {
    processState: 'filling',
    processError: null,
    rssForm: {
      valid: null,
      errors: [],
      inputUrl: '',
    },
    feeds: [],
    posts: [],
    loadedLinks: [],
  };

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'feedbacks.feedbackRepeat' }),
    },
    string: {
      url: () => ({ key: 'feedbacks.feedbackWrongURL' }),
    }
  });

  const defaultLang = 'ru';
  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  })
    .then(() => console.log('i18next initiated successfully'))
    .catch(() => console.log('i18next instance caused an error'));

  const watchedState = view(elements, i18n, state);

  const loadedFeeds = watchedState.loadedLinks;

  const schema = yup.object({
    inputUrl: yup.string()
    .url()
    .notOneOf([`${loadedFeeds}`]),
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = formData.get('url');
    watchedState.rssForm.inputUrl = data;

    schema.validate({ inputUrl: watchedState.rssForm.inputUrl }, { abortEarly: false })
      .then(() => {
        watchedState.rssForm.valid = true;
        watchedState.rssForm.errors = [];
      })
      .catch((error) => {
        const validationErrors = error.message;
        watchedState.rssForm.errors = validationErrors;
      });
      
    if (watchedState.rssForm.errors.length === 0) {
      watchedState.processState = 'request';

      console.log(watchedState.rssForm.inputUrl);
      getAxiosResponse(watchedState.rssForm.inputUrl)
        .then((response) => {
          console.log(response.status);
          console.log(response.data);
          parse(response.data.contents);
        })
        .then((parsedRSS) => {
          const feedId = createId();
          const title = parsedRSS.feed.channelTitle;
          const description = parsedRSS.feed.channelDescription;

          addFeed(feedId, title, description, watchedState);
          console.log(watchedState.feeds);
          addPosts(feedId, parsedRSS.posts, watchedState);
          watchedState.processState = 'loaded';
          watchedState.loadedLinks.push(watchedState.rssForm.inputUrl);
          watchedState.rssForm.inputUrl = '';
        })
        .catch ((err) => {
          watchedState.processError = err.message;
          watchedState.processState = 'filling';
        })
      }    
  });
};

export default app;