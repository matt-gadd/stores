import { processExecutor, getProcess, ProcessError, ProcessResult, ProcessCallbackDecorator } from './process';
import { Pointer } from '../src/state/Pointer';
import Store from '../src/Store';
import WeakMap from '@dojo/shim/WeakMap';

export interface HistoryData {
	history: { id: string; operations: any[] }[];
	redo: { id: string; operations: any[] }[];
}

export interface HistoryManager {
	collector: ProcessCallbackDecorator;
	serialize: (store: Store) => HistoryData;
	deserialize: (store: Store, data: HistoryData) => void;
	undo: (store: Store) => void;
	redo: (store: Store) => void;
	canUndo: (store: Store) => boolean;
	canRedo: (store: Store) => boolean;
}

export function createHistoryManager(): HistoryManager {
	const storeMap = new WeakMap();
	return {
		collector(callback?) {
			return (error: ProcessError | null, result: ProcessResult): void => {
				const { operations, undoOperations, id, store } = result;
				const { history, undo } = storeMap.get(store) || {
					history: [],
					undo: []
				};
				history.push({ id, operations });
				undo.push({ id, operations: undoOperations });
				storeMap.set(store, { history, undo, redo: [] });
				callback && callback(error, result);
			};
		},
		canUndo(store) {
			const stacks = storeMap.get(store);
			if (stacks) {
				const { history, undo } = stacks;
				if (undo.length && history.length) {
					return true;
				}
			}
			return false;
		},
		canRedo(store) {
			const stacks = storeMap.get(store);
			if (stacks) {
				const { redo } = stacks;
				if (redo.length) {
					return true;
				}
			}
			return false;
		},
		redo(store) {
			const stacks = storeMap.get(store);
			if (stacks) {
				const { history, redo, undo } = stacks;
				if (redo.length) {
					const { id, operations } = redo.pop();
					const result = store.apply(operations);
					history.push({ id, operations });
					undo.push({ id, operations: result });
					storeMap.set(store, { history, undo, redo });
				}
			}
		},
		undo(store) {
			const stacks = storeMap.get(store);
			if (stacks) {
				const { history, undo, redo } = stacks;
				if (undo.length && history.length) {
					const { id, operations } = undo.pop();
					history.pop();
					const result = store.apply(operations);
					redo.push({ id, operations: result });
					storeMap.set(store, { history, undo, redo });
				}
			}
		},
		deserialize(store, data) {
			const { history, redo } = data;
			history.forEach(({ id, operations }: any) => {
				operations = (operations as any[]).map((operation) => {
					operation.path = new Pointer(operation.path);
					return operation;
				});
				let callback;
				const process = getProcess(id);
				if (process) {
					callback = process[2];
				}
				processExecutor(id, [() => operations], store, callback, undefined)({});
			});
			const stacks = storeMap.get(store);
			redo.forEach(({ id, operations }: any) => {
				operations = (operations as any[]).map((operation) => {
					operation.path = new Pointer(operation.path);
					return operation;
				});
			});
			stacks.redo = redo;
		},
		serialize(store) {
			const stacks = storeMap.get(store);
			if (stacks) {
				return {
					history: stacks.history,
					redo: stacks.redo
				};
			}
			return { history: [], redo: [] };
		}
	};
}
