

const projectId = 'proj1';
const product1Id = 'prod1';
const product2Id = 'prod2';
const userId = 'user1';

export default [
  {
    scope: 'project',
    name: 'project-created',
    version: '1.0',
    stream: projectId,
    payload: {
      name: 'test project',
    },
  },
  {
    scope: 'product',
    name: 'prduct-created',
    version: '1.0',
    stream: product1Id,
    payload: {
      name: 'test preoduct',
      price: 20,
      projectId
    },
  },
  {
    scope: 'product',
    name: 'prduct-created',
    version: '1.0',
    stream: product2Id,
    payload: {
      name: 'test preoduct 2',
      price: 15,
      projectId
    },
  },
  {
    scope: 'user',
    name: 'user-created',
    version: '1.0',
    stream: userId,
    payload: {
      name: 'Ben Dover',
      projectId,
    },
  },
]
