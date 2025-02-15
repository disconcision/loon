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
    message: createMessage('Welcome to Loon! Try asking a question or use commands like "view", "theme", or "@go".', 'system'),
    children: ['q1', 'q2', 'q3', 'q4', 'q5'],
    isEdited: false,
  };
  nodes.set('root', root);

  // Question 1: Science
  const q1: Node = {
    id: 'q1',
    message: createMessage('What causes the northern lights?', 'human'),
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
    message: createMessage('Why do cats knock things off tables?', 'human'),
    parent: 'root',
    children: ['a2'],
    isEdited: false,
  };
  nodes.set('q2', q2);

  const a2: Node = {
    id: 'a2',
    message: createMessage('Cats knock things over for several reasons: to test gravity (yes, really), to get attention, out of curiosity, or simply because they find it entertaining. It\'s a form of play that also helps them practice their hunting skills.', 'model'),
    parent: 'q2',
    children: [],
    isEdited: false,
  };
  nodes.set('a2', a2);

  // Question 3: Technology
  const q3: Node = {
    id: 'q3',
    message: createMessage('What\'s the difference between RAM and ROM?', 'human'),
    parent: 'root',
    children: ['a3'],
    isEdited: false,
  };
  nodes.set('q3', q3);

  const a3: Node = {
    id: 'a3',
    message: createMessage('RAM (Random Access Memory) is temporary, fast memory used for running programs. It\'s wiped when you turn off your device. ROM (Read Only Memory) is permanent storage that keeps data even without power, like your phone\'s operating system.', 'model'),
    parent: 'q3',
    children: [],
    isEdited: false,
  };
  nodes.set('a3', a3);

  // Question 4: Philosophy
  const q4: Node = {
    id: 'q4',
    message: createMessage('If a tree falls in a forest and no one is around to hear it, does it make a sound?', 'human'),
    parent: 'root',
    children: ['a4'],
    isEdited: false,
  };
  nodes.set('q4', q4);

  const a4: Node = {
    id: 'a4',
    message: createMessage('It depends on how you define "sound". If sound is the physical vibration of air molecules, then yes. If sound is the perception of those vibrations by a consciousness, then no. This paradox highlights the difference between physical phenomena and conscious experience.', 'model'),
    parent: 'q4',
    children: [],
    isEdited: false,
  };
  nodes.set('a4', a4);

  // Question 5: Humor
  const q5: Node = {
    id: 'q5',
    message: createMessage('Why did the programmer quit his job?', 'human'),
    parent: 'root',
    children: ['a5'],
    isEdited: false,
  };
  nodes.set('q5', q5);

  const a5: Node = {
    id: 'a5',
    message: createMessage('Because he didn\'t get arrays! 🤓\n\n(That\'s a programming joke - "arrays" sounds like "a raise")', 'model'),
    parent: 'q5',
    children: [],
    isEdited: false,
  };
  nodes.set('a5', a5);

  return nodes;
} 