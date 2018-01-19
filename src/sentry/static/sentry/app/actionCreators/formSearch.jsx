import FormSearchActions from '../actions/formSearchActions';

export function addSearchMap(searchMap) {
  FormSearchActions.addSearchMap(searchMap);
}

export function loadSearchMap() {
  // Load search map by directory via webpack
  let context = require.context('../data/forms', true, /\.jsx$/);
  context.keys().forEach(function(key) {
    context(key);
  });
}
