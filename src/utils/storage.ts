import { openDB, DBSchema } from 'idb';
import { Model, Node, NodeId, ViewState } from '@/types/model';

interface LoonDB extends DBSchema {
  nodes: {
    key: NodeId;
    value: Node;
  };
  viewSettings: {
    key: 'viewState';
    value: ViewState;
  };
}

const DB_NAME = 'loon';
const DB_VERSION = 2;  // Increment version for schema change

export async function initDB() {
  return openDB<LoonDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create nodes store if it doesn't exist
      if (!db.objectStoreNames.contains('nodes')) {
        db.createObjectStore('nodes', { keyPath: 'id' });
      }
      
      // Create viewSettings store if it doesn't exist
      if (!db.objectStoreNames.contains('viewSettings')) {
        db.createObjectStore('viewSettings');
      }
    },
  });
}

export async function saveNodes(nodes: Map<NodeId, Node>) {
  const db = await initDB();
  const tx = db.transaction('nodes', 'readwrite');
  const store = tx.objectStore('nodes');

  // Clear existing nodes
  await store.clear();

  // Add all nodes
  for (const [id, node] of nodes) {
    await store.put(node);
  }

  await tx.done;
}

export async function loadNodes(): Promise<Map<NodeId, Node>> {
  const db = await initDB();
  const nodes = await db.getAll('nodes');
  return new Map(nodes.map(node => [node.id, node]));
}

export async function saveViewState(viewState: ViewState) {
  const db = await initDB();
  const tx = db.transaction('viewSettings', 'readwrite');
  const store = tx.objectStore('viewSettings');
  
  await store.put(viewState, 'viewState');
  await tx.done;
}

export async function loadViewState(): Promise<ViewState | null> {
  const db = await initDB();
  const viewState = await db.get('viewSettings', 'viewState');
  return viewState || null;
} 