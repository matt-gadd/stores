import WeakMap from '@dojo/shim/WeakMap';
import { handleDecorator } from './handleDecorator';
import { beforeProperties } from './beforeProperties';
/**
 * Map of instances against registered injectors.
 */
const registeredInjectorsMap = new WeakMap();
/**
 * Decorator retrieves an injector from an available registry using the name and
 * calls the `getProperties` function with the payload from the injector
 * and current properties with the the injected properties returned.
 *
 * @param InjectConfig the inject configuration
 */
export function inject({ name, getProperties }) {
    return handleDecorator((target, propertyKey) => {
        beforeProperties(function (properties) {
            const injector = this.registry.getInjector(name);
            if (injector) {
                const registeredInjectors = registeredInjectorsMap.get(this) || [];
                if (registeredInjectors.length === 0) {
                    registeredInjectorsMap.set(this, registeredInjectors);
                }
                if (registeredInjectors.indexOf(injector) === -1) {
                    injector.on('invalidate', () => {
                        this.invalidate();
                    });
                    registeredInjectors.push(injector);
                }
                return getProperties(injector.get(), properties);
            }
        })(target);
    });
}
export default inject;
//# sourceMappingURL=inject.mjs.map