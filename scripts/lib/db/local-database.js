import 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.js';
import eventStore from '../../events/index.js';
import uuid from '../utils/uuid.js';
import sub from './mock-subscriptions.js';
const database = {
  data: {},
  get: path => _.get(database.data, path.replace(/\//g, '.'), undefined),
  add: async (path, data) => {
    const id = uuid();
    _.set(database.data, `${path.replace(/\//g, '.')}.${id}`, data);
    sub.sync(path);
    if (path === 'events') await eventStore.process({ ...data, id });
  },
  set: async (path, data, id) => {
    _.set(database.data, `${path.replace(/\//g, '.')}.${id}`, data);
    sub.sync(`${path}/${id}`);
    if (path === 'events') await eventStore.process({ ...data, id });
  },
  remove: async path => {
    const parentPath = path
      .split('/')
      .slice(0, -1)
      .join('.');
    let parentObject = _.get(database.data, parentPath, undefined);

    parentObject = Object.keys(parentObject).reduce((object, key) => {
      if (path.split('/').splice(-1, 1)[0] !== key)
        object[key] = parentObject[key];
      return object;
    }, {});
    _.set(database.data, parentPath, parentObject);
    sub.sync(parentPath);
  },
};

export default database;
