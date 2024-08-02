import onChange from 'on-change';

const renderSuccessFeedBack = (elements, i18n, state) => {
  console.log('success');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.input.classList.remove('is-invalid');
  console.log(i18n.t('feedbacks.feedbackSuccess'));
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

export default (elements, i18n, state) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'processApp.processState':
        
        break;
      case 'processApp.processError':

        break;
      case 'rssForm.valid':
        renderSuccessFeedBack(elements, i18n, state);
        break;
      case 'rssForm.errors':
        renderError(elements, i18n, state);
        break;
      default:
        break;      
    }
  });
return watchedState;
};