import onChange from 'on-change';

const buildContainer = () => {
  
};

const renderSuccessFeedBack = (elements, i18n, state) => {
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.input.classList.remove('is-invalid');
  const feedText = i18n.t('feedbacks.feedbackSuccess');
  elements.feedback.textContent = feedText;
  elements.form.reset();
  elements.input.focus();
};

const renderError = (elements, i18n, state) => {
  if (state.rssForm.errors.length !== 0) {
    elements.feedback.classList.remove('text-success');  
    elements.feedback.classList.add('text-danger');
    elements.input.classList.add('is-invalid');
    const errorToDisplay = state.rssForm.errors;
    elements.feedback.textContent = i18n.t(errorToDisplay.key);
  } else { 
    elements.input.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger');
  }
};

const handleProcessError = (elements, i18n, state) => {
  if (state.processError) {
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = i18n.t('feedbacks.feedbackNoRSS');
  }  
};

const handleProcessState = (elements, value, i18n, state) => {
  switch (value) {
    case 'filling':
      break;
    case 'request':
      elements.input.disabled = true;
      elements.button.disabled = true;
      break;
    case 'error':
      handleLoadWithErrors(elements, i18n, state);
      elements.input.disabled = false;
      elements.button.disabled = false;
      break;
    case 'loaded':
      handleSuccessLoad(elements, i18n);
      elements.input.disabled = false;
      elements.button.disabled = false;
      break;
    default:
      throw new Error(`Unknown process state: ${value}`);      
  }
};

const handleFeeds = () => {
  
};

const handlePosts = () => {
  
};

export default (elements, i18n, state) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'processState':
        handleProcessState(elements, value, i18n, state);
        break;
      case 'processError':
        handleProcessError(elements, i18n, state);
        break;
      case 'rssForm.valid':
        renderSuccessFeedBack(elements, i18n, state);
        break;
      case 'rssForm.errors':
        renderError(elements, i18n, state);
        break;
      case 'feeds':
        handleFeeds(elements, i18n, state);
        break;
      case 'posts':
        handlePosts(elements, i18n, state);
        break;    
      default:
        break;      
    }
  });
return watchedState;
};