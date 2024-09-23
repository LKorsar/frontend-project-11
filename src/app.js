import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import resources from './locales/index.js';
import view from './view.js';
import parse from './parser.js';

const validateURL = (url, urlList) => {
  const schema = yup.string()
    .trim()
    .required()
    .url()
    .notOneOf(urlList);
  return schema.validate(url);
};

const getAxiosResponse = (link) => {
  const proxyAllOrigins = 'https://allorigins.hexlet.app/get';
  const myUrl = new URL(proxyAllOrigins);
  myUrl.searchParams.set('disableCache', 'true');
  myUrl.searchParams.set('url', link);
  return axios.get(myUrl);
};

const createId = () => (_.uniqueId());

const addFeed = (id, title, description, state) => {
  state.feeds.push({
    feedId: id,
    feedTitle: title,
    feedDescription: description,
    link: state.rssForm.inputUrl,
  });
};

const addPosts = (feedId, posts, state) => {
  posts.forEach((post) => {
    const newPost = {
      feedID: feedId,
      id: createId(),
      title: post.title,
      description: post.description,
      link: post.link,
    };
    state.posts.push(newPost);
  });
};

const getNewPosts = (state) => {
  const delay = 5000;
  const promises = state.feeds.map((feed) => getAxiosResponse(feed.link)
    .then((res) => {
      const { posts } = parse(res.data.contents);
      posts.forEach((post) => {
        const isDuplicate = state.posts
          .some((loadedPost) => loadedPost.title === post.title);
        if (!isDuplicate) {
          state.posts.unshift({
            id: createId(),
            title: post.title,
            description: post.description,
            link: post.link,
          });
        }
      });
    })
    .catch((error) => {
      throw error;
    }));
  Promise.all(promises)
    .finally(() => {
      setTimeout(getNewPosts, delay, state);
    });
};

const app = () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('button[aria-label="add"]'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    feedback: document.querySelector('.feedback'),
    modal: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.full-article'),
  };

  const state = {
    process: {
      processState: 'filling',
      processError: null,
    },
    rssForm: {
      valid: null,
      inputUrl: '',
    },
    feeds: [],
    posts: [],
    uiState: {
      visitedLinks: new Set(),
      modalId: '',
    },
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
          required: () => ({ key: 'feedbacks.feedbackEmpty' }),
          notOneOf: () => ({ key: 'feedbacks.feedbackRepeat' }),
        },
        string: {
          url: () => ({ key: 'feedbacks.feedbackWrongURL' }),
        },
      });
    })
    .catch(() => console.log('i18next instance caused an error'));

  const watchedState = view(elements, i18n, state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = formData.get('url');
    watchedState.rssForm.inputUrl = data;

    const loadedRSS = watchedState.feeds.map((feed) => feed.link);

    validateURL(watchedState.rssForm.inputUrl, loadedRSS)
      .then((validUrl) => {
        watchedState.rssForm.valid = true;
        watchedState.process.processState = 'request';
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

        watchedState.process.processState = 'loaded';
        watchedState.rssForm.inputUrl = '';
      })
      .catch((error) => {
        watchedState.process.processState = 'error';
        watchedState.rssForm.valid = false;
        if (error.isAxiosError) {
          watchedState.process.processError = 'Network Error';
        } else if (error.name === 'parsingError') {
          watchedState.process.processError = 'noRSS';
        } else {
          watchedState.process.processError = error.message;
        }
      });
  });

  elements.posts.addEventListener('click', (e) => {
    const targetPost = e.target;
    const targetPostId = targetPost.dataset.id;
    watchedState.uiState.visitedLinks.add(targetPostId);
    if (targetPost.tagName === 'BUTTON') {
      watchedState.uiState.modalId = targetPostId;
    }
  });

  getNewPosts(watchedState);

  const postClosingBtns = document.querySelectorAll('button[data-bs-dismiss="modal"]');
  postClosingBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      watchedState.uiState.modalId = '';
    });
  });
};

export default app;
