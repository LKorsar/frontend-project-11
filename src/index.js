import  './styles.scss';
import  'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import _ from 'lodash';
import i18n from 'i18next';
import resources from './locales/index.js';

const render = (watchedState, elements, i18nInstance) => {
  if (watchedState.searchForm.valid !== true || watchedState.searchForm.valid !== null) {
    elements.input.classList.add('text-danger');
    elements.feedback.textContent = watchedState.searchForm.errors;
  } else {
    elements.input.classList.remove('text-danger');
    elements.input.classList.add('text-success');
    elements.feedback.textContent = i18nInstance.t('feedbacks.feedbackSuccess');
  }
  elements.form.reset();
  elements.input.focus();
};

const app = () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const state = {
    searchForm: {
      valid: null,
      errors: {},
    },
    inputUrl: '',
    posts: [],
    feeds: [],
  };
  
  const elements = {
    form: document.querySelector('.rss-form'),
    input: form.querySelector('#url-input'),
    postsList: document.querySelector('.posts'),
    feedback: document.querySelector('.feedback'),
  };
  
  const watchedState = onChange(state, render);

  const loadedFeeds = state.feeds;

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
    state.inputUrl = data;
    const errors = validateURL({ inputUrl: data });
    state.searchForm.errors = errors;
    state.searchForm.valid = _.isEmpty(errors);
    if (_.isEmpty(errors)) {
      // sending request to server
      //const response
      //state.feeds.push(data);
      //state.posts.push(response.items);
    }
  });
  render(watchedState, elements, i18nInstance);
};

export default app;

//app();