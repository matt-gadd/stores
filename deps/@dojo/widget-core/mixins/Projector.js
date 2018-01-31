(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@dojo/core/lang", "@dojo/shim/global", "@dojo/core/lang", "pepjs", "../animations/cssTransitions", "./../decorators/afterRender", "./../d", "./../vdom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var lang_1 = require("@dojo/core/lang");
    var global_1 = require("@dojo/shim/global");
    var lang_2 = require("@dojo/core/lang");
    require("pepjs");
    var cssTransitions_1 = require("../animations/cssTransitions");
    var afterRender_1 = require("./../decorators/afterRender");
    var d_1 = require("./../d");
    var vdom_1 = require("./../vdom");
    /**
     * Represents the attach state of the projector
     */
    var ProjectorAttachState;
    (function (ProjectorAttachState) {
        ProjectorAttachState[ProjectorAttachState["Attached"] = 1] = "Attached";
        ProjectorAttachState[ProjectorAttachState["Detached"] = 2] = "Detached";
    })(ProjectorAttachState = exports.ProjectorAttachState || (exports.ProjectorAttachState = {}));
    /**
     * Attach type for the projector
     */
    var AttachType;
    (function (AttachType) {
        AttachType[AttachType["Append"] = 1] = "Append";
        AttachType[AttachType["Merge"] = 2] = "Merge";
        AttachType[AttachType["Replace"] = 3] = "Replace";
    })(AttachType = exports.AttachType || (exports.AttachType = {}));
    function ProjectorMixin(Base) {
        var Projector = /** @class */ (function (_super) {
            tslib_1.__extends(Projector, _super);
            function Projector() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.apply(this, tslib_1.__spread(args)) || this;
                _this._async = true;
                _this._projectorChildren = [];
                _this._projectorProperties = {};
                _this._handles = [];
                var instanceData = vdom_1.widgetInstanceMap.get(_this);
                instanceData.parentInvalidate = function () {
                    _this.scheduleRender();
                };
                _this._projectionOptions = {
                    transitions: cssTransitions_1.default
                };
                _this._boundDoRender = _this._doRender.bind(_this);
                _this._boundRender = _this.__render__.bind(_this);
                _this.root = document.body;
                _this.projectorState = ProjectorAttachState.Detached;
                return _this;
            }
            Projector.prototype.append = function (root) {
                var options = {
                    type: AttachType.Append,
                    root: root
                };
                return this._attach(options);
            };
            Projector.prototype.merge = function (root) {
                var options = {
                    type: AttachType.Merge,
                    root: root
                };
                return this._attach(options);
            };
            Projector.prototype.replace = function (root) {
                var options = {
                    type: AttachType.Replace,
                    root: root
                };
                return this._attach(options);
            };
            Projector.prototype.pause = function () {
                if (this._scheduled) {
                    global_1.default.cancelAnimationFrame(this._scheduled);
                    this._scheduled = undefined;
                }
                this._paused = true;
            };
            Projector.prototype.resume = function () {
                this._paused = false;
                this.scheduleRender();
            };
            Projector.prototype.scheduleRender = function () {
                if (this.projectorState === ProjectorAttachState.Attached) {
                    this.__setProperties__(this._projectorProperties);
                    this.__setChildren__(this._projectorChildren);
                    this._renderState = 1;
                    if (!this._scheduled && !this._paused) {
                        if (this._async) {
                            this._scheduled = global_1.default.requestAnimationFrame(this._boundDoRender);
                        }
                        else {
                            this._boundDoRender();
                        }
                    }
                }
            };
            Object.defineProperty(Projector.prototype, "root", {
                get: function () {
                    return this._root;
                },
                set: function (root) {
                    if (this.projectorState === ProjectorAttachState.Attached) {
                        throw new Error('Projector already attached, cannot change root element');
                    }
                    this._root = root;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Projector.prototype, "async", {
                get: function () {
                    return this._async;
                },
                set: function (async) {
                    if (this.projectorState === ProjectorAttachState.Attached) {
                        throw new Error('Projector already attached, cannot change async mode');
                    }
                    this._async = async;
                },
                enumerable: true,
                configurable: true
            });
            Projector.prototype.sandbox = function (doc) {
                var _this = this;
                if (doc === void 0) { doc = document; }
                if (this.projectorState === ProjectorAttachState.Attached) {
                    throw new Error('Projector already attached, cannot create sandbox');
                }
                this._async = false;
                var previousRoot = this.root;
                /* free up the document fragment for GC */
                this.own(function () {
                    _this._root = previousRoot;
                });
                this._attach({
                    /* DocumentFragment is not assignable to Element, but provides everything needed to work */
                    root: doc.createDocumentFragment(),
                    type: AttachType.Append
                });
            };
            Projector.prototype.setChildren = function (children) {
                this.__setChildren__(children);
                this.scheduleRender();
            };
            Projector.prototype.__setChildren__ = function (children) {
                this._projectorChildren = tslib_1.__spread(children);
                _super.prototype.__setChildren__.call(this, children);
            };
            Projector.prototype.setProperties = function (properties) {
                this.__setProperties__(properties);
                this.scheduleRender();
            };
            Projector.prototype.__setProperties__ = function (properties) {
                if (this._projectorProperties && this._projectorProperties.registry !== properties.registry) {
                    if (this._projectorProperties.registry) {
                        this._projectorProperties.registry.destroy();
                    }
                }
                this._projectorProperties = lang_1.assign({}, properties);
                _super.prototype.__setCoreProperties__.call(this, { bind: this, baseRegistry: properties.registry });
                _super.prototype.__setProperties__.call(this, properties);
            };
            Projector.prototype.toHtml = function () {
                if (this.projectorState !== ProjectorAttachState.Attached || !this._projection) {
                    throw new Error('Projector is not attached, cannot return an HTML string of projection.');
                }
                return this._projection.domNode.childNodes[0].outerHTML;
            };
            Projector.prototype.afterRender = function (result) {
                var node = result;
                if (typeof result === 'string' || result === null || result === undefined) {
                    node = d_1.v('span', {}, [result]);
                }
                return node;
            };
            Projector.prototype._doRender = function () {
                this._scheduled = undefined;
                if (this._projection) {
                    this._projection.update(this._boundRender());
                }
            };
            Projector.prototype.own = function (handle) {
                this._handles.push(handle);
            };
            Projector.prototype.destroy = function () {
                while (this._handles.length > 0) {
                    var handle = this._handles.pop();
                    if (handle) {
                        handle();
                    }
                }
            };
            Projector.prototype._attach = function (_a) {
                var _this = this;
                var type = _a.type, root = _a.root;
                if (root) {
                    this.root = root;
                }
                if (this.projectorState === ProjectorAttachState.Attached) {
                    return this._attachHandle;
                }
                this.projectorState = ProjectorAttachState.Attached;
                var handle = function () {
                    if (_this.projectorState === ProjectorAttachState.Attached) {
                        _this.pause();
                        _this._projection = undefined;
                        _this.projectorState = ProjectorAttachState.Detached;
                    }
                };
                this.own(handle);
                this._attachHandle = lang_2.createHandle(handle);
                this._projectionOptions = tslib_1.__assign({}, this._projectionOptions, { sync: !this._async });
                switch (type) {
                    case AttachType.Append:
                        this._projection = vdom_1.dom.append(this.root, this._boundRender(), this, this._projectionOptions);
                        break;
                    case AttachType.Merge:
                        this._projection = vdom_1.dom.merge(this.root, this._boundRender(), this, this._projectionOptions);
                        break;
                    case AttachType.Replace:
                        this._projection = vdom_1.dom.replace(this.root, this._boundRender(), this, this._projectionOptions);
                        break;
                }
                return this._attachHandle;
            };
            tslib_1.__decorate([
                afterRender_1.afterRender(),
                tslib_1.__metadata("design:type", Function),
                tslib_1.__metadata("design:paramtypes", [Object]),
                tslib_1.__metadata("design:returntype", void 0)
            ], Projector.prototype, "afterRender", null);
            return Projector;
        }(Base));
        return Projector;
    }
    exports.ProjectorMixin = ProjectorMixin;
    exports.default = ProjectorMixin;
});
//# sourceMappingURL=Projector.js.map