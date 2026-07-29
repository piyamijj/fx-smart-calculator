export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface MemoryVars {
  A: number;
  B: number;
  C: number;
  M: number;
  Ans: number;
}

export interface SavedFunction {
  id: string;
  expr: string;
  color: string;
  visible: boolean;
}

export interface GraphFunctionSet {
  id: string;
  name: string;
  functions: SavedFunction[];
  xMin: number;
  xMax: number;
  timestamp: number;
}

const KEYS = {
  HISTORY: 'fxsmart_history',
  MEMORY: 'fxsmart_memory',
  GRAPH_SETS: 'fxsmart_graph_sets',
};

const DEFAULT_MEMORY: MemoryVars = {
  A: 0,
  B: 0,
  C: 0,
  M: 0,
  Ans: 0,
};

function generateId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    try {
      return window.crypto.randomUUID();
    } catch (e) {
      // Fallback
    }
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// --- HISTORY FUNCTIONS ---

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading history from localStorage', e);
    return [];
  }
}

export function addHistoryEntry(expression: string, result: string): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = getHistory();
    const newEntry: HistoryEntry = {
      id: generateId(),
      expression,
      result,
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...history].slice(0, 100); // Cap at 100 entries
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving history to localStorage', e);
    return [];
  }
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = getHistory();
    const updated = history.filter((entry) => entry.id !== id);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting history entry', e);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEYS.HISTORY);
  } catch (e) {
    console.error('Error clearing history', e);
  }
}

// --- MEMORY VARIABLES FUNCTIONS ---

export function getMemoryVars(): MemoryVars {
  if (typeof window === 'undefined') return DEFAULT_MEMORY;
  try {
    const data = localStorage.getItem(KEYS.MEMORY);
    return data ? { ...DEFAULT_MEMORY, ...JSON.parse(data) } : DEFAULT_MEMORY;
  } catch (e) {
    console.error('Error reading memory from localStorage', e);
    return DEFAULT_MEMORY;
  }
}

export function setMemoryVar(key: keyof MemoryVars, value: number): MemoryVars {
  if (typeof window === 'undefined') return DEFAULT_MEMORY;
  try {
    const current = getMemoryVars();
    const updated = { ...current, [key]: value };
    localStorage.setItem(KEYS.MEMORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving memory to localStorage', e);
    return DEFAULT_MEMORY;
  }
}

export function clearMemoryVars(): MemoryVars {
  if (typeof window === 'undefined') return DEFAULT_MEMORY;
  try {
    localStorage.setItem(KEYS.MEMORY, JSON.stringify(DEFAULT_MEMORY));
    return DEFAULT_MEMORY;
  } catch (e) {
    console.error('Error clearing memory', e);
    return DEFAULT_MEMORY;
  }
}

// --- GRAPH FUNCTION SETS ---

export function getGraphSets(): GraphFunctionSet[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(KEYS.GRAPH_SETS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading graph sets from localStorage', e);
    return [];
  }
}

export function saveGraphSet(name: string, functions: SavedFunction[], xMin: number, xMax: number): GraphFunctionSet[] {
  if (typeof window === 'undefined') return [];
  try {
    const sets = getGraphSets();
    const newSet: GraphFunctionSet = {
      id: generateId(),
      name,
      functions,
      xMin,
      xMax,
      timestamp: Date.now(),
    };
    const updated = [newSet, ...sets];
    localStorage.setItem(KEYS.GRAPH_SETS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving graph set to localStorage', e);
    return [];
  }
}

export function deleteGraphSet(id: string): GraphFunctionSet[] {
  if (typeof window === 'undefined') return [];
  try {
    const sets = getGraphSets();
    const updated = sets.filter((set) => set.id !== id);
    localStorage.setItem(KEYS.GRAPH_SETS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting graph set', e);
    return [];
  }
}