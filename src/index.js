import  './styles.scss';
import  'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import i18next, { init } from 'i18next';
import resources from './locales/index.js';
import view from './view.js';

const app = async () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: form.querySelector('#url-input'),
    postsList: document.querySelector('.posts'),
    feedsList: document.querySelector('.feeds'),
    feedback: document.querySelector('.feedback'),
  };

  const state = {
    processApp: {
      processState: 'filling',
      processError: null,
    },
    rssForm: {
      valid: null,
      errors: [],
      inputUrl: '',
    },
    posts: [],
    feeds: [],
  };

  yup.setLocale({
    mixed: {
      url: () => ({ key: 'feedbacks.feedbackWrongURL' }),
      notOneOf: () => ({ key: 'feedbacks.feedbackRepeat' }),
    },
  });

  const defaultLang = 'ru';
  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  })
    .then(() => console.log('i18next instance initiated successfully'))
    .catch(() => console.log('i18next instance caused an error'));

  const { watchedState } = view(elements, i18n, state);

  const loadedFeeds = watchedState.feeds;

  const schema = yup.object({
    inputUrl: yup.string()
    .url()
    .required()
    .notOneOf([yup.ref(loadedFeeds)]),
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = formData.get('url');
    watchedState.rssForm.inputUrl = data;
    try {
      await schema.validate({ inputUrl: watchedState.rssForm.inputUrl }, { abortEarly: false });
      watchedState.rssForm.valid = true;
      watchedState.rssForm.errors = [];
    } catch (error) {
      const validationErrors = error.message;
      watchedState.rssForm.errors = validationErrors;
    };
    console.log(validationErrors);
    if (watchedState.rssForm.errors.length === 0) {
      watchedState.processApp.processState = 'sending';
    }
  });

};

export default app;
