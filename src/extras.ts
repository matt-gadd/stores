import { processExecutor, getProcess, ProcessError, ProcessResult, ProcessCallbackDecorator } from './process';
import { PatchOperation } from '../src/state/Patch';
import { Pointer } from '../src/state/Pointer';
import WeakMap from '@dojo/shim/WeakMap';

export interface HistoryManager {
	collector: ProcessCallbackDecorator;
	serialize: (store: any) => PatchOperation[][];
	deserialize: (store: any, history: any[][]) => void;
	undo: (store: any) => void;
}

export function createHistoryManager(): HistoryManager {
	const storeMap = new WeakMap();
	return {
		collector(callback?: any) {
			return (error: ProcessError | null, result: ProcessResult): void => {
				const { operations, undoOperations, processId, store } = result;
				const { history, undo } = storeMap.get(store) || {
					history: [],
					undo: []
				};
				history.push({ processId, operations });
				undo.push(undoOperations);
				storeMap.set(store, { history, undo });
				callback && callback(error, result);
			};
		},
		undo(store) {
			const stacks = storeMap.get(store);
			if (stacks) {
				const { history, undo } = stacks;
				if (undo.length && history.length) {
					history.pop();
					store.apply(undo.pop());
					storeMap.set(store, { history, undo });
				}
			}
		},
		deserialize(store, history) {
			history.forEach(({ processId, operations }: any) => {
				operations = (operations as any[]).map((operation) => {
					operation.path = new Pointer(operation.path);
					return operation;
				});
				let callback;
				if (processId) {
					const process = getProcess(processId);
					if (process) {
						callback = process[2];
					}
				}
				processExecutor(processId, [() => operations], store, callback, undefined)({});
			});
		},
		serialize(store) {
			const stacks = storeMap.get(store);
			if (stacks) {
				const { history } = stacks;
				return history;
			}
			return [];
		}
	};
}
