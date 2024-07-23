import  './styles.scss';
import  'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import i18next, { init } from 'i18next';
import resources from './locales/index.js';
import view from './view.js';

const app = () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: form.querySelector('#url-input'),
    postsList: document.querySelector('.posts'),
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
   
  const { watchedState } = view(elements, i18n, state);

  const defaultLang = 'ru';
  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  })
    .then(() => console.log('i18next instance initiated successfully'))
    .catch(() => console.log('i18next instance caused an error'));

  const loadedFeeds = watchedState.feeds;

  const schema = yup.object({
    inputUrl: yup.string()
    .url(i18nInstance.t('feedbacks.feedbackWrongURL'))
    .required()
    .notOneOf(loadedFeeds, i18nInstance.t('feedbacks.feedbackRepeat')),
  });

  const validateURL = ({ inputUrl }) => {
    schema.validate({ inputUrl })
      .then(() => console.log('validation acomplished successfully'))
      .catch((err) => console.log(err.errors))
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = formData.get('url');
    watchedState.rssForm.inputUrl = data;
    const validationErrors = schema.validate({ inputUrl: watchedState.rssForm.inputUrl })
      .then(() => console.log('validation acomplished successfully'))
      .catch((error) => {
        return error.message
      });
    watchedState.rssForm.errors = validationErrors;
    watchedState.rssForm.valid = _.isEmpty(errors);
    if (_.isEmpty(errors)) {
      // sending request to server
      //const response
    }
    else {

    }
  });

};

export default app;
