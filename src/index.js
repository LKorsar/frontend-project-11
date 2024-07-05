import  './styles.scss';
import  'bootstrap';

export default () => {
  const state = {
    searchForm: {
      valid: null,
      errors: [],
      value: '',
    },
    modal: 'hidden',
  };
};