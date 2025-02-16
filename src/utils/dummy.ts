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
    message: createMessage('You are in a twisty maze of weltanschauungen all alike', 'system'),
    children: ['q1', 'q2', 'q3', 'q4', 'q5'],
    isEdited: false,
  };
  nodes.set('root', root);

  // Question 1: Science
  const q1: Node = {
    id: 'q1',
    message: createMessage('Is the ontology of tlon uqbar orbis tertius truly truly truly contagious?', 'human'),
    parent: 'root',
    children: ['a1'],
    isEdited: false,
  };
  nodes.set('q1', q1);

  const a1: Node = {
    id: 'a1',
    message: createMessage('The aurora borealis occurs when charged particles from the Sun collide with Earth\'s atmosphere. These particles are guided by our planet\'s magnetic field toward the poles, creating stunning displays of light when they interact with atmospheric gases.', 'model'),
    parent: 'q1',
    children: [],
    isEdited: false,
  };
  nodes.set('a1', a1);

  // Question 2: Pop Culture
  const q2: Node = {
    id: 'q2',
    message: createMessage('Must the sun collide into itself?', 'human'),
    parent: 'root',
    children: ['a2'],
    isEdited: false,
  };
  nodes.set('q2', q2);

  const a2: Node = {
    id: 'a2',
    message: createMessage('Such a thing must not be', 'model'),
    parent: 'q2',
    children: [],
    isEdited: false,
  };
  nodes.set('a2', a2);

  // Question 3: Technology
  const q3: Node = {
    id: 'q3',
    message: createMessage('What is the difference between a camel and a child?', 'human'),
    parent: 'root',
    children: ['a3'],
    isEdited: false,
  };
  nodes.set('q3', q3);

  const a3: Node = {
    id: 'a3',
    message: createMessage('The cloud of unknowing decends nightly', 'model'),
    parent: 'q3',
    children: [],
    isEdited: false,
  };
  nodes.set('a3', a3);

  // Question 4: Philosophy
  const q4: Node = {
    id: 'q4',
    message: createMessage('Where do leaden circles dissolve in the air?', 'human'),
    parent: 'root',
    children: ['a4'],
    isEdited: false,
  };
  nodes.set('q4', q4);

  const a4: Node = {
    id: 'a4',
    message: createMessage('HARK;', 'model'),
    parent: 'q4',
    children: [],
    isEdited: false,
  };
  nodes.set('a4', a4);

  // Question 5: Humor
  const q5: Node = {
    id: 'q5',
    message: createMessage('describe the weight of winter', 'human'),
    parent: 'root',
    children: ['a5'],
    isEdited: false,
  };
  nodes.set('q5', q5);

  const a5: Node = {
    id: 'a5',
    message: createMessage('The weight of winter is a physical and metaphysical force that', 'model'),
    parent: 'q5',
    children: [],
    isEdited: false,
  };
  nodes.set('a5', a5);

  return nodes;
} 