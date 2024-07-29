import onChange from 'on-change';

const renderSuccessFeedBack = (elements, i18n) => {
  elements.input.classList.remove('text-danger');
  elements.input.classList.add('text-success');
  elements.feedback.textContent = i18n.t('feedbacks.feedbackSuccess');
  elements.form.reset();
  elements.input.focus();
};

const renderError = (elements, state) => {
  elements.input.classList.remove('text-success');  
  elements.input.classList.add('text-danger');
  const errorToDisplay = state.rssForm.errors;
  elements.feedback.textContent = i18n.t(errorToDisplay);
  elements.form.reset();
  elements.input.focus();
};

export default (elements, i18n, state) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'processApp.processState':
        
        break;
      case 'processApp.processError':

        break;
      case 'rssForm.valid':
        renderSuccessFeedBack(elements, i18n);
        break;
      case 'rssForm.errors':
        renderError(elements, state);
        break;
      default:
        break;      
    }
  });
return watchedState;
};