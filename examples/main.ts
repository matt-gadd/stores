import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { v } from '@dojo/widget-core/d';
import { Store } from './../src/Store';
import { replace } from './../src/state/operations';
import { createCommandFactory, createProcess } from './../src/process';
import { createHistoryManager } from './../src/extras';

interface Increment {
	counter: number;
	anotherCounter: number;
}

const createCommand = createCommandFactory<Increment>();

const incrementCounter = createCommand(({ get, path }) => {
	let counter = get(path('counter')) || 0;
	return [replace(path('counter'), ++counter)];
});

const incrementAnotherCounter = createCommand(({ get, path }) => {
	let anotherCounter = get(path('anotherCounter')) || 0;
	return [replace(path('anotherCounter'), anotherCounter + 10)];
});

const historyManager = createHistoryManager();

const incrementProcess = createProcess(
	'increment',
	[incrementCounter, incrementAnotherCounter],
	historyManager.collector()
);

const initialProcess = createProcess('initial', [incrementCounter, incrementAnotherCounter]);

class Example extends WidgetBase {
	private _textArea = '';

	private _stores: Store[] = [];

	private _createStore() {
		const store = new Store();
		initialProcess(store)({});
		try {
			historyManager.deserialize(store, JSON.parse(this._textArea));
		} catch (e) {}
		this._stores.push(store);
		this.invalidate();
	}

	private _increment(store: Store) {
		incrementProcess(store)({});
		this.invalidate();
	}

	private _undo(store: Store) {
		historyManager.undo(store);
		this.invalidate();
	}

	private _renderStore(store: Store<Increment>, key: number) {
		const { path, get } = store;
		return v('div', { key, classes: ['container'] }, [
			v(
				'div',
				{
					classes: ['mdl-card', 'mdl-shadow--2dp']
				},
				[
					v(
						'div',
						{
							classes: [
								'mdl-color--accent mdl-color-text--accent-contrast mdl-card__title mdl-card--expand'
							]
						},
						[
							v('h2', { classes: ['mdl-card__title-text'] }, [
								v('div', [
									v('div', [`counter: ${get(path('counter'))}`]),
									v('div', [`anotherCounter: ${get(path('anotherCounter'))}`])
								])
							])
						]
					),
					v('div', { classes: ['mdl-card__supporting-text'] }, [
						v(
							'div',
							{
								classes: ['mdl-textfield', 'mdl-js-textfield', 'mdl-textfield--floating-labe']
							},
							[
								v('textarea', { readonly: 'readonly', rows: '10', classes: ['mdl-textfield__input'] }, [
									JSON.stringify(historyManager.serialize(store), null, '\t')
								])
							]
						)
					]),
					v('div', { classes: ['mdl-card__actions', 'mdl-card--border'] }, [
						v(
							'button',
							{
								key: 'increment',
								classes: ['mdl-button', 'mdl-js-button', 'mdl-js-ripple-effect'],
								onclick: () => this._increment(store)
							},
							['increment']
						),
						v(
							'button',
							{
								key: 'undo',
								classes: ['mdl-button', 'mdl-js-button', 'mdl-js-ripple-effect'],
								disabled: !historyManager.canUndo(store),
								onclick: () => this._undo(store)
							},
							['undo']
						)
					])
				]
			)
		]);
	}

	private _renderStores() {
		return this._stores.map((store, i) => this._renderStore(store, i));
	}

	render() {
		return v('div', {}, [
			v('h3', ['History Management']),
			v('div', [
				v('div', { classes: ['container'] }, [
					v(
						'div',
						{
							classes: ['mdl-card', 'mdl-shadow--2dp']
						},
						[
							v(
								'div',
								{
									classes: [
										'mdl-color--primary mdl-color-text--primary-contrast mdl-card__title mdl-card--expand'
									]
								},
								[v('h2', { classes: ['mdl-card__title-text'] }, ['create store'])]
							),

							v('div', { classes: ['mdl-card__supporting-text'] }, [
								v(
									'div',
									{
										classes: ['mdl-textfield', 'mdl-js-textfield', 'mdl-textfield--floating-labe']
									},
									[
										v('textarea', {
											id: 'foo',
											rows: '10',
											classes: ['mdl-textfield__input'],
											onchange: (e: any) => {
												this._textArea = e.target.value;
											}
										}),
										v('label', { for: 'foo', classes: ['mdl-textfield__label'] }, [
											'store history:'
										])
									]
								)
							]),
							v(
								'div',
								{
									classes: ['mdl-card__actions', 'mdl-card--border']
								},
								[
									v(
										'button',
										{
											classes: ['mdl-button', 'mdl-js-button', 'mdl-js-ripple-effect'],
											onclick: this._createStore
										},
										['create']
									)
								]
							)
						]
					)
				]),
				...this._renderStores()
			])
		]);
	}
}

const Projector = ProjectorMixin(Example);
const projector = new Projector();
projector.append();
