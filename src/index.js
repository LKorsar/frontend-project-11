import  './styles.scss';
import  'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import resources from './locales/index.js';
import view from './view.js';

const app = async () => {
  console.log("I'm working");
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
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
      notOneOf: () => ({ key: 'feedbacks.feedbackRepeat' }),
    },
    string: {
      url: () => ({ key: 'feedbacks.feedbackWrongURL' }),
    }
  });

  const defaultLang = 'ru';
  const i18n = i18next.createInstance();
  await i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  });
   // .then(() => console.log('i18next initiated successfully'))
   // .catch(() => console.log('i18next instance caused an error'));

  const watchedState = view(elements, i18n, state);

  const loadedFeeds = watchedState.feeds;
  //watchedState.feeds.push('https://lorem-rss-hexlet.app/feed');

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
        console.log(watchedState.rssForm.valid);
        console.log(watchedState.rssForm.errors);
      })
      .catch((error) => {
        const validationErrors = error.message;
        watchedState.rssForm.errors = validationErrors;
      });
      
    if (watchedState.rssForm.errors.length === 0) {
      watchedState.processApp.processState = 'sending';
    }
  });

};

//export default app;

app();