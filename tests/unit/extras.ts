const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

import { OperationType, PatchOperation } from './../../src/state/Patch';
import { CommandRequest, createProcess } from './../../src/process';
import { Pointer } from './../../src/state/Pointer';
import { createHistoryManager } from './../../src/extras';
import { Store } from './../../src/Store';

function incrementCounter({ get, path }: CommandRequest<{ counter: number }>): PatchOperation[] {
	let counter = get(path('counter')) || 0;
	return [{ op: OperationType.REPLACE, path: new Pointer('/counter'), value: ++counter }];
}

describe('extras', () => {
	it('can serialize and deserialize history', () => {
		const historyManager = createHistoryManager();
		const store = new Store();

		const incrementCounterProcess = createProcess('increment', [incrementCounter], historyManager.collector());
		const executor = incrementCounterProcess(store);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 1);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 2);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 3);

		// serialize the history
		const json = JSON.stringify(historyManager.serialize(store));
		// create a new store
		const storeCopy = new Store();
		// deserialize the new store with the history
		historyManager.deserialize(storeCopy, JSON.parse(json));
		// should be re-hydrated
		assert.strictEqual(storeCopy.get(storeCopy.path('counter')), 3);
		// storeCopy history is identical to original store history
		assert.deepEqual(historyManager.serialize(store), historyManager.serialize(storeCopy));

		// can undo on new storeCopy
		historyManager.undo(storeCopy);
		assert.strictEqual(storeCopy.get(storeCopy.path('counter')), 2);
		historyManager.undo(storeCopy);
		assert.strictEqual(storeCopy.get(storeCopy.path('counter')), 1);
		// history should now be 1 item
		assert.strictEqual(historyManager.serialize(storeCopy).length, 1);

		// undo on original store
		historyManager.undo(store);
		assert.strictEqual(store.get(store.path('counter')), 2);
		historyManager.undo(store);
		assert.strictEqual(storeCopy.get(store.path('counter')), 1);

		// histories should now be identical
		assert.deepEqual(historyManager.serialize(store), historyManager.serialize(storeCopy));
	});

	it('can undo', () => {
		const historyManager = createHistoryManager();
		const store = new Store();
		const incrementCounterProcess = createProcess('increment', [incrementCounter], historyManager.collector());
		const executor = incrementCounterProcess(store);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 1);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 2);
		executor({});
		assert.strictEqual(store.get(store.path('counter')), 3);
		historyManager.undo(store);
		assert.strictEqual(store.get(store.path('counter')), 2);
	});

	it('undo has no effect if there are no undo functions on the stack', () => {
		const historyManager = createHistoryManager();
		const store = new Store();
		const incrementCounterProcess = createProcess('increment', [incrementCounter]);
		const executor = incrementCounterProcess(store);
		executor({});
		historyManager.undo(store);
		assert.strictEqual(store.get(store.path('counter')), 1);
	});
});
