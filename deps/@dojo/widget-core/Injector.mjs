import { Evented } from '@dojo/core/Evented';
export class Injector extends Evented {
    constructor(payload) {
        super();
        this._payload = payload;
    }
    get() {
        return this._payload;
    }
    set(payload) {
        this._payload = payload;
        this.emit({ type: 'invalidate' });
    }
}
export default Injector;
//# sourceMappingURL=Injector.mjs.map