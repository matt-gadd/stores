const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

import { OperationType, PatchOperation } from './../../src/state/Patch';
import { CommandRequest, createProcess, ProcessError, ProcessResult } from './../../src/process';
import { Pointer } from './../../src/state/Pointer';
import { createUndoManager, createHistoryManager } from './../../src/extras';
import { Store } from './../../src/Store';

function incrementCounter({ get, path }: CommandRequest<{ counter: number }>): PatchOperation[] {
	let counter = get(path('counter')) || 0;
	return [{ op: OperationType.REPLACE, path: new Pointer('/counter'), value: ++counter }];
}

describe('extras', () => {
	it('can serialize and re-hydrate history non destructively', () => {
		const { undoCollector, undoer } = createUndoManager();
		const { historyCollector, serialize, hydrate } = createHistoryManager();
		const store = new Store();

		const logger = (callback?: any) => {
			return (error: ProcessError | null, result: ProcessResult): void => {
				console.log('-------> set counter to', (result.operations[0] as any).value);
				callback && callback(error, result);
			};
		};
		const incrementCounterProcess = createProcess(
			'increment',
			[incrementCounter],
			historyCollector(undoCollector(logger()))
		);
		const executor = incrementCounterProcess(store);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 1);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 2);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 3);

		// serialize the history
		const json = JSON.stringify(serialize(store));
		// deserialize it
		const history = JSON.parse(json);
		// create a new store
		const storeCopy = new Store();
		// hydrate the new store with the history
		hydrate(storeCopy, history);
		// should be re-hydrated
		assert.strictEqual(storeCopy.get(storeCopy.path('counter')), 3);
		// can undo the history
		undoer(storeCopy);
		assert.strictEqual(storeCopy.get(storeCopy.path('counter')), 2);
		undoer(storeCopy);
		assert.strictEqual(storeCopy.get(storeCopy.path('counter')), 1);
	});

	it('collects undo functions for all processes using collector', () => {
		const { undoCollector, undoer } = createUndoManager();
		const store = new Store();
		let localUndoStack: any[] = [];
		const incrementCounterProcess = createProcess(
			'increment',
			[incrementCounter],
			undoCollector((error, result) => {
				localUndoStack.push(result.undo);
			})
		);
		const executor = incrementCounterProcess(store);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 1);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 2);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 3);
		localUndoStack[2]();
		assert.strictEqual(store.get(store.path('counter')), 2);
		undoer(store);
		assert.strictEqual(store.get(store.path('counter')), 1);
	});

	it('undo has no effect if there are no undo functions on the stack', () => {
		const { undoer } = createUndoManager();
		const store = new Store();
		const incrementCounterProcess = createProcess('increment', [incrementCounter]);
		const executor = incrementCounterProcess(store);
		executor({});
		undoer(store);
		assert.strictEqual(store.get(store.path('counter')), 1);
	});

	it('local undo throws an error if global undo has already been executed', () => {
		const { undoCollector, undoer } = createUndoManager();
		const store = new Store();
		let localUndo: any;
		const incrementCounterProcess = createProcess(
			'increment',
			[incrementCounter],
			undoCollector((error, result) => {
				localUndo = result.undo;
			})
		);
		const executor = incrementCounterProcess(store);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 1);
		undoer(store);
		assert.throws(
			() => {
				localUndo && localUndo();
			},
			Error,
			'Test operation failure. Unable to apply any operations.'
		);
	});
});
