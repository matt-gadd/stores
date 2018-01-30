import {
	createProcess,
	getProcess,
	ProcessError,
	ProcessResult,
	ProcessCallback,
	ProcessCallbackDecorator,
	Undo
} from './process';
import { PatchOperation } from '../src/state/Patch';
import { Pointer } from '../src/state/Pointer';

/**
 * Undo manager interface
 */
export interface UndoManager {
	undoCollector: ProcessCallbackDecorator;
	undoer: () => void;
}

/**
 * Factory function that returns an undoer function that will undo the last executed process and a
 * higher order collector function that can be used as the process callback.
 */
export function createUndoManager(): UndoManager {
	const undoStack: Undo[] = [];

	return {
		undoCollector: (callback?: any): ProcessCallback => {
			return (error: ProcessError | null, result: ProcessResult): void => {
				const { undo } = result;
				undoStack.push(undo);

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
		undoer: (): void => {
			const undo = undoStack.pop();
			if (undo !== undefined) {
				undo();
			}
		}
	};
}

export interface HistoryManager {
	historyCollector: ProcessCallbackDecorator;
	serialize: () => PatchOperation[][];
	hydrate: (history: any[][], store: any, processCallback?: any) => void;
}

export function createHistoryManager(): HistoryManager {
	const historyStack: any[] = [];
	return {
		historyCollector(callback?: any) {
			return (error: ProcessError | null, result: ProcessResult): void => {
				const { operations, processId } = result;
				historyStack.push({ processId, operations });
				callback && callback(error, result);
			};
		},
		hydrate(history, store, processCallback) {
			history.forEach(({ processId, operations }: any) => {
				operations = (operations as any[]).map((operation) => {
					operation.path = new Pointer(operation.path);
					return operation;
				});
				let callback = processCallback;
				if (processId) {
					const process = getProcess(processId);
					if (process) {
						const [, options] = process;
						callback = options.callback;
					}
				}
				return createProcess([() => operations], { callback })(store)({});
			});
		},
		serialize() {
			return historyStack;
		}
	};
}
