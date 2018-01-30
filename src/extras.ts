import {
	createProcess,
	getProcess,
	ProcessError,
	ProcessResult,
	ProcessCallback,
	ProcessCallbackDecorator
} from './process';
import { PatchOperation } from '../src/state/Patch';
import { Pointer } from '../src/state/Pointer';
import WeakMap from '@dojo/shim/WeakMap';

/**
 * Undo manager interface
 */
export interface UndoManager {
	collector: ProcessCallbackDecorator;
	undo: (store: any) => void;
}

/**
 * Factory function that returns an undoer function that will undo the last executed process and a
 * higher order collector function that can be used as the process callback.
 */
export function createUndoManager(): UndoManager {
	const storeMap = new WeakMap();

	return {
		collector: (callback?: any): ProcessCallback => {
			return (error: ProcessError | null, result: ProcessResult): void => {
				const { undo, store } = result;
				const undoStack = storeMap.get(store) || [];
				undoStack.push(undo);
				storeMap.set(store, undoStack);

				result.undo = (): void => {
					const index = undoStack.indexOf(undo);
					if (index !== -1) {
						undoStack.splice(index, 1);
					}
					undo();
				};
				callback && callback(error, result);
			};
		},
		undo: (store): void => {
			const undoStack = storeMap.get(store) || [];
			const undo = undoStack.pop();
			if (undo !== undefined) {
				undo();
			}
		}
	};
}

export interface HistoryManager {
	collector: ProcessCallbackDecorator;
	serialize: (store: any) => PatchOperation[][];
	hydrate: (store: any, history: any[][]) => void;
}

export function createHistoryManager(): HistoryManager {
	const storeMap = new WeakMap();
	return {
		collector(callback?: any) {
			return (error: ProcessError | null, result: ProcessResult): void => {
				const { operations, processId, store } = result;
				const historyStack = storeMap.get(store) || [];
				historyStack.push({ processId, operations });
				storeMap.set(store, historyStack);
				callback && callback(error, result);
			};
		},
		hydrate(store, history) {
			history.forEach(({ processId, operations }: any) => {
				operations = (operations as any[]).map((operation) => {
					operation.path = new Pointer(operation.path);
					return operation;
				});
				let callback;
				if (processId) {
					const process = getProcess(processId);
					if (process) {
						const [, options] = process;
						callback = options.callback;
					}
				}
				return createProcess(processId, [() => operations], callback)(store)({});
			});
		},
		serialize(store) {
			const historyStack = storeMap.get(store) || [];
			return historyStack;
		}
	};
}
