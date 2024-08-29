import onChange from 'on-change';

const handleSuccessLoad = (elements, i18n, state) => {
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.input.classList.remove('is-invalid');
  const feedText = i18n.t('feedbacks.feedbackSuccess');
  elements.feedback.textContent = feedText;
  elements.form.reset();
  elements.input.focus();
};

const handleProcessError = (elements, i18n, state) => {
  if (state.processError !== null) {
    elements.feedback.classList.remove('text-success');  
    elements.feedback.classList.add('text-danger');
    elements.input.classList.add('is-invalid');
    if (state.processError === 'Network Error') {
      elements.feedback.textContent = i18n.t('errors.network');
    } else {
      const errorToDisplay = state.processError;
      elements.feedback.textContent = i18n.t(errorToDisplay.key);
    }
  } else { 
    elements.input.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger');
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
      handleProcessError(elements, i18n, state);
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

const buildContainer = (title, elements, i18n, state) => {
  elements[title].textContent = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t(title);
  cardBody.append(cardTitle);
  card.append(cardBody);
  elements[title].append(card);
  if (title === 'feeds') {
    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0');
    state.feeds.forEach((feed) => {
      const listGroupItem = document.createElement('li');
      listGroupItem.classList.add('list-group-item', 'border-0', 'border-end-0');
      const h3 = document.createElement('h3');
      h3.classList.add('h6', 'm-0');
      h3.textContent = feed.feedTitle;
      const pEl = document.createElement('p');
      pEl.classList.add('m-0', 'small', 'text-black-50');
      pEl.textContent = feed.feedDescription;
      listGroupItem.append(h3);
      listGroupItem.append(pEl);
      listGroup.append(listGroupItem);
      cardBody.append(listGroup);
    })
  }
  if (title === 'posts') {
    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0');
    state.posts.forEach((post) => {
      const listGroupItem = document.createElement('li');
      listGroupItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      
      const aEl = document.createElement('a');
      aEl.setAttribute('href', post.link);
      aEl.classList.add('fw-bold');
      aEl.setAttribute('data-id', post.id);
      aEl.setAttribute('target', '_blank');
      aEl.setAttribute('rel', 'noopener noreferrer');
      aEl.textContent = post.title;

      const btn = document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      btn.setAttribute('data-id', post.id);
      btn.setAttribute('data-bs-toggle', 'modal');
      btn.setAttribute('data-bs-target', '#modal');
      btn.textContent = i18n.t('buttons.viewBtn');

      listGroupItem.append(aEl);
      listGroupItem.append(btn);
      listGroup.append(listGroupItem);
      cardBody.append(listGroup);
    })
  }
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
      case 'feeds':
        buildContainer('feeds', elements, i18n, state);
        break;
      case 'posts':
        buildContainer('posts', elements, i18n, state);
        break;    
      default:
        break;      
    }
  });
return watchedState;
};