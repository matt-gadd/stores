import * as tslib_1 from "tslib";
import { assign } from '@dojo/core/lang';
import global from '@dojo/shim/global';
import { createHandle } from '@dojo/core/lang';
import 'pepjs';
import cssTransitions from '../animations/cssTransitions';
import { afterRender } from './../decorators/afterRender';
import { v } from './../d';
import { dom, widgetInstanceMap } from './../vdom';
/**
 * Represents the attach state of the projector
 */
export var ProjectorAttachState;
(function (ProjectorAttachState) {
    ProjectorAttachState[ProjectorAttachState["Attached"] = 1] = "Attached";
    ProjectorAttachState[ProjectorAttachState["Detached"] = 2] = "Detached";
})(ProjectorAttachState || (ProjectorAttachState = {}));
/**
 * Attach type for the projector
 */
export var AttachType;
(function (AttachType) {
    AttachType[AttachType["Append"] = 1] = "Append";
    AttachType[AttachType["Merge"] = 2] = "Merge";
    AttachType[AttachType["Replace"] = 3] = "Replace";
})(AttachType || (AttachType = {}));
export function ProjectorMixin(Base) {
    class Projector extends Base {
        constructor(...args) {
            super(...args);
            this._async = true;
            this._projectorChildren = [];
            this._projectorProperties = {};
            this._handles = [];
            const instanceData = widgetInstanceMap.get(this);
            instanceData.parentInvalidate = () => {
                this.scheduleRender();
            };
            this._projectionOptions = {
                transitions: cssTransitions
            };
            this._boundDoRender = this._doRender.bind(this);
            this._boundRender = this.__render__.bind(this);
            this.root = document.body;
            this.projectorState = ProjectorAttachState.Detached;
        }
        append(root) {
            const options = {
                type: AttachType.Append,
                root
            };
            return this._attach(options);
        }
        merge(root) {
            const options = {
                type: AttachType.Merge,
                root
            };
            return this._attach(options);
        }
        replace(root) {
            const options = {
                type: AttachType.Replace,
                root
            };
            return this._attach(options);
        }
        pause() {
            if (this._scheduled) {
                global.cancelAnimationFrame(this._scheduled);
                this._scheduled = undefined;
            }
            this._paused = true;
        }
        resume() {
            this._paused = false;
            this.scheduleRender();
        }
        scheduleRender() {
            if (this.projectorState === ProjectorAttachState.Attached) {
                this.__setProperties__(this._projectorProperties);
                this.__setChildren__(this._projectorChildren);
                this._renderState = 1;
                if (!this._scheduled && !this._paused) {
                    if (this._async) {
                        this._scheduled = global.requestAnimationFrame(this._boundDoRender);
                    }
                    else {
                        this._boundDoRender();
                    }
                }
            }
        }
        set root(root) {
            if (this.projectorState === ProjectorAttachState.Attached) {
                throw new Error('Projector already attached, cannot change root element');
            }
            this._root = root;
        }
        get root() {
            return this._root;
        }
        get async() {
            return this._async;
        }
        set async(async) {
            if (this.projectorState === ProjectorAttachState.Attached) {
                throw new Error('Projector already attached, cannot change async mode');
            }
            this._async = async;
        }
        sandbox(doc = document) {
            if (this.projectorState === ProjectorAttachState.Attached) {
                throw new Error('Projector already attached, cannot create sandbox');
            }
            this._async = false;
            const previousRoot = this.root;
            /* free up the document fragment for GC */
            this.own(() => {
                this._root = previousRoot;
            });
            this._attach({
                /* DocumentFragment is not assignable to Element, but provides everything needed to work */
                root: doc.createDocumentFragment(),
                type: AttachType.Append
            });
        }
        setChildren(children) {
            this.__setChildren__(children);
            this.scheduleRender();
        }
        __setChildren__(children) {
            this._projectorChildren = [...children];
            super.__setChildren__(children);
        }
        setProperties(properties) {
            this.__setProperties__(properties);
            this.scheduleRender();
        }
        __setProperties__(properties) {
            if (this._projectorProperties && this._projectorProperties.registry !== properties.registry) {
                if (this._projectorProperties.registry) {
                    this._projectorProperties.registry.destroy();
                }
            }
            this._projectorProperties = assign({}, properties);
            super.__setCoreProperties__({ bind: this, baseRegistry: properties.registry });
            super.__setProperties__(properties);
        }
        toHtml() {
            if (this.projectorState !== ProjectorAttachState.Attached || !this._projection) {
                throw new Error('Projector is not attached, cannot return an HTML string of projection.');
            }
            return this._projection.domNode.childNodes[0].outerHTML;
        }
        afterRender(result) {
            let node = result;
            if (typeof result === 'string' || result === null || result === undefined) {
                node = v('span', {}, [result]);
            }
            return node;
        }
        _doRender() {
            this._scheduled = undefined;
            if (this._projection) {
                this._projection.update(this._boundRender());
            }
        }
        own(handle) {
            this._handles.push(handle);
        }
        destroy() {
            while (this._handles.length > 0) {
                const handle = this._handles.pop();
                if (handle) {
                    handle();
                }
            }
        }
        _attach({ type, root }) {
            if (root) {
                this.root = root;
            }
            if (this.projectorState === ProjectorAttachState.Attached) {
                return this._attachHandle;
            }
            this.projectorState = ProjectorAttachState.Attached;
            const handle = () => {
                if (this.projectorState === ProjectorAttachState.Attached) {
                    this.pause();
                    this._projection = undefined;
                    this.projectorState = ProjectorAttachState.Detached;
                }
            };
            this.own(handle);
            this._attachHandle = createHandle(handle);
            this._projectionOptions = Object.assign({}, this._projectionOptions, { sync: !this._async });
            switch (type) {
                case AttachType.Append:
                    this._projection = dom.append(this.root, this._boundRender(), this, this._projectionOptions);
                    break;
                case AttachType.Merge:
                    this._projection = dom.merge(this.root, this._boundRender(), this, this._projectionOptions);
                    break;
                case AttachType.Replace:
                    this._projection = dom.replace(this.root, this._boundRender(), this, this._projectionOptions);
                    break;
            }
            return this._attachHandle;
        }
    }
    tslib_1.__decorate([
        afterRender(),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object]),
        tslib_1.__metadata("design:returntype", void 0)
    ], Projector.prototype, "afterRender", null);
    return Projector;
}
export default ProjectorMixin;
//# sourceMappingURL=Projector.mjs.map