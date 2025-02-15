import { Node, NodeId, Message, Source } from '@/types/model';

function createMessage(content: string, source: Source): Message {
  return {
    content,
    source,
    timestamp: new Date(),
  };
}

export function generateDummyData(): Map<NodeId, Node> {
  const nodes = new Map<NodeId, Node>();

  // Root node
  const root: Node = {
    id: 'root',
    message: createMessage('Welcome to Loon! This is a prototype for exploring conversations with language models.', 'system'),
    children: ['post1', 'post2', 'post3'],
    isEdited: false,
  };
  nodes.set('root', root);

  // First thread
  const post1: Node = {
    id: 'post1',
    message: createMessage('How would you implement a red-black tree in TypeScript?', 'human'),
    parent: 'root',
    children: ['response1a', 'response1b'],
    isEdited: false,
  };
  nodes.set('post1', post1);

  const response1a: Node = {
    id: 'response1a',
    message: createMessage('Here\'s an implementation of a red-black tree. Let\'s start with the node structure...', 'model'),
    parent: 'post1',
    children: ['followup1a'],
    isEdited: false,
  };
  nodes.set('response1a', response1a);

  const followup1a: Node = {
    id: 'followup1a',
    message: createMessage('Could you add some test cases to verify the implementation?', 'human'),
    parent: 'response1a',
    children: ['response1a1'],
    isEdited: false,
  };
  nodes.set('followup1a', followup1a);

  const response1a1: Node = {
    id: 'response1a1',
    message: createMessage('Here are some comprehensive test cases for the red-black tree implementation...', 'model'),
    parent: 'followup1a',
    children: [],
    isEdited: false,
  };
  nodes.set('response1a1', response1a1);

  const response1b: Node = {
    id: 'response1b',
    message: createMessage('Let\'s approach this differently. First, let\'s implement a basic binary search tree...', 'model'),
    parent: 'post1',
    children: [],
    isEdited: false,
  };
  nodes.set('response1b', response1b);

  // Second thread (deep)
  const post2: Node = {
    id: 'post2',
    message: createMessage('Explain the concept of monads in functional programming.', 'human'),
    parent: 'root',
    children: ['response2a'],
    isEdited: false,
  };
  nodes.set('post2', post2);

  let currentId = 'response2a';
  let parentId = 'post2';
  for (let i = 0; i < 10; i++) {
    const isHuman = i % 2 === 0;
    const content = isHuman
      ? `Could you clarify the ${['bind', 'return', 'join', 'map', 'chain'][i % 5]} operation?`
      : `The ${['bind', 'return', 'join', 'map', 'chain'][i % 5]} operation in monads works as follows...`;
    
    const node: Node = {
      id: currentId,
      message: createMessage(content, isHuman ? 'human' : 'model'),
      parent: parentId,
      children: i < 9 ? [`response2a_${i + 1}`] : [],
      isEdited: false,
    };
    nodes.set(currentId, node);
    
    parentId = currentId;
    currentId = `response2a_${i + 1}`;
  }

  // Third thread
  const post3: Node = {
    id: 'post3',
    message: createMessage('What are the key differences between REST and GraphQL?', 'human'),
    parent: 'root',
    children: ['response3a', 'response3b', 'response3c'],
    isEdited: false,
  };
  nodes.set('post3', post3);

  const response3a: Node = {
    id: 'response3a',
    message: createMessage('REST is resource-oriented while GraphQL is query-oriented...', 'model'),
    parent: 'post3',
    children: [],
    isEdited: false,
  };
  nodes.set('response3a', response3a);

  const response3b: Node = {
    id: 'response3b',
    message: createMessage('Let\'s compare them through practical examples...', 'model'),
    parent: 'post3',
    children: [],
    isEdited: false,
  };
  nodes.set('response3b', response3b);

  const response3c: Node = {
    id: 'response3c',
    message: createMessage('From a performance perspective...', 'model'),
    parent: 'post3',
    children: [],
    isEdited: false,
  };
  nodes.set('response3c', response3c);

  return nodes;
} 