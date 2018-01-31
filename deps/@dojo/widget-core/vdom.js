(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@dojo/shim/global", "@dojo/shim/array", "./d", "./Registry", "@dojo/shim/WeakMap"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var global_1 = require("@dojo/shim/global");
    var array_1 = require("@dojo/shim/array");
    var d_1 = require("./d");
    var Registry_1 = require("./Registry");
    var WeakMap_1 = require("@dojo/shim/WeakMap");
    var NAMESPACE_W3 = 'http://www.w3.org/';
    var NAMESPACE_SVG = NAMESPACE_W3 + '2000/svg';
    var NAMESPACE_XLINK = NAMESPACE_W3 + '1999/xlink';
    var emptyArray = [];
    exports.widgetInstanceMap = new WeakMap_1.default();
    function same(dnode1, dnode2) {
        if (d_1.isVNode(dnode1) && d_1.isVNode(dnode2)) {
            if (dnode1.tag !== dnode2.tag) {
                return false;
            }
            if (dnode1.properties.key !== dnode2.properties.key) {
                return false;
            }
            return true;
        }
        else if (d_1.isWNode(dnode1) && d_1.isWNode(dnode2)) {
            if (dnode1.widgetConstructor !== dnode2.widgetConstructor) {
                return false;
            }
            if (dnode1.properties.key !== dnode2.properties.key) {
                return false;
            }
            return true;
        }
        return false;
    }
    var missingTransition = function () {
        throw new Error('Provide a transitions object to the projectionOptions to do animations');
    };
    function getProjectionOptions(projectorOptions) {
        var defaults = {
            namespace: undefined,
            styleApplyer: function (domNode, styleName, value) {
                domNode.style[styleName] = value;
            },
            transitions: {
                enter: missingTransition,
                exit: missingTransition
            },
            deferredRenderCallbacks: [],
            afterRenderCallbacks: [],
            nodeMap: new WeakMap_1.default(),
            merge: false
        };
        return tslib_1.__assign({}, defaults, projectorOptions);
    }
    function checkStyleValue(styleValue) {
        if (typeof styleValue !== 'string') {
            throw new Error('Style values must be strings');
        }
    }
    function updateEvents(domNode, propName, properties, projectionOptions, previousProperties) {
        var previous = previousProperties || Object.create(null);
        var currentValue = properties[propName];
        var previousValue = previous[propName];
        var eventName = propName.substr(2);
        var eventMap = projectionOptions.nodeMap.get(domNode) || new WeakMap_1.default();
        if (previousValue) {
            var previousEvent = eventMap.get(previousValue);
            domNode.removeEventListener(eventName, previousEvent);
        }
        var callback = currentValue.bind(properties.bind);
        if (eventName === 'input') {
            callback = function (evt) {
                currentValue.call(this, evt);
                evt.target['oninput-value'] = evt.target.value;
            }.bind(properties.bind);
        }
        domNode.addEventListener(eventName, callback);
        eventMap.set(currentValue, callback);
        projectionOptions.nodeMap.set(domNode, eventMap);
    }
    function addClasses(domNode, classes) {
        if (classes) {
            var classNames = classes.split(' ');
            for (var i = 0; i < classNames.length; i++) {
                domNode.classList.add(classNames[i]);
            }
        }
    }
    function removeClasses(domNode, classes) {
        if (classes) {
            var classNames = classes.split(' ');
            for (var i = 0; i < classNames.length; i++) {
                domNode.classList.remove(classNames[i]);
            }
        }
    }
    function setProperties(domNode, properties, projectionOptions) {
        var propNames = Object.keys(properties);
        var propCount = propNames.length;
        for (var i = 0; i < propCount; i++) {
            var propName = propNames[i];
            var propValue = properties[propName];
            if (propName === 'classes') {
                var currentClasses = Array.isArray(propValue) ? propValue : [propValue];
                if (!domNode.className) {
                    domNode.className = currentClasses.join(' ').trim();
                }
                else {
                    for (var i_1 = 0; i_1 < currentClasses.length; i_1++) {
                        addClasses(domNode, currentClasses[i_1]);
                    }
                }
            }
            else if (propName === 'styles') {
                var styleNames = Object.keys(propValue);
                var styleCount = styleNames.length;
                for (var j = 0; j < styleCount; j++) {
                    var styleName = styleNames[j];
                    var styleValue = propValue[styleName];
                    if (styleValue) {
                        checkStyleValue(styleValue);
                        projectionOptions.styleApplyer(domNode, styleName, styleValue);
                    }
                }
            }
            else if (propName !== 'key' && propValue !== null && propValue !== undefined) {
                var type = typeof propValue;
                if (type === 'function' && propName.lastIndexOf('on', 0) === 0) {
                    updateEvents(domNode, propName, properties, projectionOptions);
                }
                else if (type === 'string' && propName !== 'value' && propName !== 'innerHTML') {
                    if (projectionOptions.namespace === NAMESPACE_SVG && propName === 'href') {
                        domNode.setAttributeNS(NAMESPACE_XLINK, propName, propValue);
                    }
                    else {
                        domNode.setAttribute(propName, propValue);
                    }
                }
                else {
                    domNode[propName] = propValue;
                }
            }
        }
    }
    function removeOrphanedEvents(domNode, previousProperties, properties, projectionOptions) {
        var eventMap = projectionOptions.nodeMap.get(domNode);
        if (eventMap) {
            Object.keys(previousProperties).forEach(function (propName) {
                if (propName.substr(0, 2) === 'on' && !properties[propName]) {
                    var eventCallback = eventMap.get(previousProperties[propName]);
                    if (eventCallback) {
                        domNode.removeEventListener(propName.substr(2), eventCallback);
                    }
                }
            });
        }
    }
    function updateProperties(domNode, previousProperties, properties, projectionOptions) {
        var propertiesUpdated = false;
        var propNames = Object.keys(properties);
        var propCount = propNames.length;
        if (propNames.indexOf('classes') === -1 && previousProperties.classes) {
            if (Array.isArray(previousProperties.classes)) {
                for (var i = 0; i < previousProperties.classes.length; i++) {
                    removeClasses(domNode, previousProperties.classes[i]);
                }
            }
            else {
                removeClasses(domNode, previousProperties.classes);
            }
        }
        removeOrphanedEvents(domNode, previousProperties, properties, projectionOptions);
        for (var i = 0; i < propCount; i++) {
            var propName = propNames[i];
            var propValue = properties[propName];
            var previousValue = previousProperties[propName];
            if (propName === 'classes') {
                var previousClasses = Array.isArray(previousValue) ? previousValue : [previousValue];
                var currentClasses = Array.isArray(propValue) ? propValue : [propValue];
                if (previousClasses && previousClasses.length > 0) {
                    if (!propValue || propValue.length === 0) {
                        for (var i_2 = 0; i_2 < previousClasses.length; i_2++) {
                            removeClasses(domNode, previousClasses[i_2]);
                        }
                    }
                    else {
                        var newClasses = tslib_1.__spread(currentClasses);
                        for (var i_3 = 0; i_3 < previousClasses.length; i_3++) {
                            var previousClassName = previousClasses[i_3];
                            if (previousClassName) {
                                var classIndex = newClasses.indexOf(previousClassName);
                                if (classIndex === -1) {
                                    removeClasses(domNode, previousClassName);
                                }
                                else {
                                    newClasses.splice(classIndex, 1);
                                }
                            }
                        }
                        for (var i_4 = 0; i_4 < newClasses.length; i_4++) {
                            addClasses(domNode, newClasses[i_4]);
                        }
                    }
                }
                else {
                    for (var i_5 = 0; i_5 < currentClasses.length; i_5++) {
                        addClasses(domNode, currentClasses[i_5]);
                    }
                }
            }
            else if (propName === 'styles') {
                var styleNames = Object.keys(propValue);
                var styleCount = styleNames.length;
                for (var j = 0; j < styleCount; j++) {
                    var styleName = styleNames[j];
                    var newStyleValue = propValue[styleName];
                    var oldStyleValue = previousValue[styleName];
                    if (newStyleValue === oldStyleValue) {
                        continue;
                    }
                    propertiesUpdated = true;
                    if (newStyleValue) {
                        checkStyleValue(newStyleValue);
                        projectionOptions.styleApplyer(domNode, styleName, newStyleValue);
                    }
                    else {
                        projectionOptions.styleApplyer(domNode, styleName, '');
                    }
                }
            }
            else {
                if (!propValue && typeof previousValue === 'string') {
                    propValue = '';
                }
                if (propName === 'value') {
                    var domValue = domNode[propName];
                    if (domValue !== propValue &&
                        (domNode['oninput-value']
                            ? domValue === domNode['oninput-value']
                            : propValue !== previousValue)) {
                        domNode[propName] = propValue;
                        domNode['oninput-value'] = undefined;
                    }
                    if (propValue !== previousValue) {
                        propertiesUpdated = true;
                    }
                }
                else if (propValue !== previousValue) {
                    var type = typeof propValue;
                    if (type === 'function' && propName.lastIndexOf('on', 0) === 0) {
                        updateEvents(domNode, propName, properties, projectionOptions, previousProperties);
                    }
                    else if (type === 'string' && propName !== 'innerHTML') {
                        if (projectionOptions.namespace === NAMESPACE_SVG && propName === 'href') {
                            domNode.setAttributeNS(NAMESPACE_XLINK, propName, propValue);
                        }
                        else if (propName === 'role' && propValue === '') {
                            domNode.removeAttribute(propName);
                        }
                        else {
                            domNode.setAttribute(propName, propValue);
                        }
                    }
                    else {
                        if (domNode[propName] !== propValue) {
                            // Comparison is here for side-effects in Edge with scrollLeft and scrollTop
                            domNode[propName] = propValue;
                        }
                    }
                    propertiesUpdated = true;
                }
            }
        }
        return propertiesUpdated;
    }
    function findIndexOfChild(children, sameAs, start) {
        for (var i = start; i < children.length; i++) {
            if (same(children[i], sameAs)) {
                return i;
            }
        }
        return -1;
    }
    function toParentVNode(domNode) {
        return {
            tag: '',
            properties: {},
            children: undefined,
            domNode: domNode,
            type: d_1.VNODE
        };
    }
    exports.toParentVNode = toParentVNode;
    function toTextVNode(data) {
        return {
            tag: '',
            properties: {},
            children: undefined,
            text: "" + data,
            domNode: undefined,
            type: d_1.VNODE
        };
    }
    exports.toTextVNode = toTextVNode;
    function filterAndDecorateChildren(children, instance) {
        if (children === undefined) {
            return emptyArray;
        }
        children = Array.isArray(children) ? children : [children];
        for (var i = 0; i < children.length;) {
            var child = children[i];
            if (child === undefined || child === null) {
                children.splice(i, 1);
                continue;
            }
            else if (typeof child === 'string') {
                children[i] = toTextVNode(child);
            }
            else {
                if (d_1.isVNode(child)) {
                    if (child.properties.bind === undefined) {
                        child.properties.bind = instance;
                        if (child.children && child.children.length > 0) {
                            filterAndDecorateChildren(child.children, instance);
                        }
                    }
                }
                else {
                    if (!child.coreProperties) {
                        var instanceData = exports.widgetInstanceMap.get(instance);
                        child.coreProperties = {
                            bind: instance,
                            baseRegistry: instanceData.coreProperties.baseRegistry
                        };
                    }
                    if (child.children && child.children.length > 0) {
                        filterAndDecorateChildren(child.children, instance);
                    }
                }
            }
            i++;
        }
        return children;
    }
    exports.filterAndDecorateChildren = filterAndDecorateChildren;
    function nodeAdded(dnode, transitions) {
        if (d_1.isVNode(dnode) && dnode.properties) {
            var enterAnimation = dnode.properties.enterAnimation;
            if (enterAnimation) {
                if (typeof enterAnimation === 'function') {
                    enterAnimation(dnode.domNode, dnode.properties);
                }
                else {
                    transitions.enter(dnode.domNode, dnode.properties, enterAnimation);
                }
            }
        }
    }
    function callOnDetach(dNodes, parentInstance) {
        dNodes = Array.isArray(dNodes) ? dNodes : [dNodes];
        for (var i = 0; i < dNodes.length; i++) {
            var dNode = dNodes[i];
            if (d_1.isWNode(dNode)) {
                if (dNode.rendered) {
                    callOnDetach(dNode.rendered, dNode.instance);
                }
                var instanceData = exports.widgetInstanceMap.get(dNode.instance);
                instanceData.onDetach();
            }
            else {
                if (dNode.children) {
                    callOnDetach(dNode.children, parentInstance);
                }
            }
        }
    }
    function nodeToRemove(dnode, transitions, projectionOptions) {
        if (d_1.isWNode(dnode)) {
            var rendered = dnode.rendered || emptyArray;
            for (var i = 0; i < rendered.length; i++) {
                var child = rendered[i];
                if (d_1.isVNode(child)) {
                    child.domNode.parentNode.removeChild(child.domNode);
                }
                else {
                    nodeToRemove(child, transitions, projectionOptions);
                }
            }
        }
        else {
            var domNode_1 = dnode.domNode;
            var properties = dnode.properties;
            var exitAnimation = properties.exitAnimation;
            if (properties && exitAnimation) {
                domNode_1.style.pointerEvents = 'none';
                var removeDomNode = function () {
                    domNode_1 && domNode_1.parentNode && domNode_1.parentNode.removeChild(domNode_1);
                };
                if (typeof exitAnimation === 'function') {
                    exitAnimation(domNode_1, removeDomNode, properties);
                    return;
                }
                else {
                    transitions.exit(dnode.domNode, properties, exitAnimation, removeDomNode);
                    return;
                }
            }
            domNode_1 && domNode_1.parentNode && domNode_1.parentNode.removeChild(domNode_1);
        }
    }
    function checkDistinguishable(childNodes, indexToCheck, parentInstance) {
        var childNode = childNodes[indexToCheck];
        if (d_1.isVNode(childNode) && childNode.tag === '') {
            return; // Text nodes need not be distinguishable
        }
        var key = childNode.properties.key;
        if (key === undefined || key === null) {
            for (var i = 0; i < childNodes.length; i++) {
                if (i !== indexToCheck) {
                    var node = childNodes[i];
                    if (same(node, childNode)) {
                        var nodeIdentifier = void 0;
                        var parentName = parentInstance.constructor.name || 'unknown';
                        if (d_1.isWNode(childNode)) {
                            nodeIdentifier = childNode.widgetConstructor.name || 'unknown';
                        }
                        else {
                            nodeIdentifier = childNode.tag;
                        }
                        console.warn("A widget (" + parentName + ") has had a child addded or removed, but they were not able to uniquely identified. It is recommended to provide a unique 'key' property when using the same widget or element (" + nodeIdentifier + ") multiple times as siblings");
                        break;
                    }
                }
            }
        }
    }
    function updateChildren(parentVNode, oldChildren, newChildren, parentInstance, projectionOptions) {
        oldChildren = oldChildren || emptyArray;
        newChildren = newChildren;
        var oldChildrenLength = oldChildren.length;
        var newChildrenLength = newChildren.length;
        var transitions = projectionOptions.transitions;
        var oldIndex = 0;
        var newIndex = 0;
        var i;
        var textUpdated = false;
        var _loop_1 = function () {
            var oldChild = oldIndex < oldChildrenLength ? oldChildren[oldIndex] : undefined;
            var newChild = newChildren[newIndex];
            if (oldChild !== undefined && same(oldChild, newChild)) {
                textUpdated = updateDom(oldChild, newChild, projectionOptions, parentVNode, parentInstance) || textUpdated;
                oldIndex++;
            }
            else {
                var findOldIndex = findIndexOfChild(oldChildren, newChild, oldIndex + 1);
                if (findOldIndex >= 0) {
                    var _loop_2 = function () {
                        var oldChild_1 = oldChildren[i];
                        var indexToCheck = i;
                        projectionOptions.afterRenderCallbacks.push(function () {
                            callOnDetach(oldChild_1, parentInstance);
                            checkDistinguishable(oldChildren, indexToCheck, parentInstance);
                        });
                        nodeToRemove(oldChildren[i], transitions, projectionOptions);
                    };
                    for (i = oldIndex; i < findOldIndex; i++) {
                        _loop_2();
                    }
                    textUpdated =
                        updateDom(oldChildren[findOldIndex], newChild, projectionOptions, parentVNode, parentInstance) ||
                            textUpdated;
                    oldIndex = findOldIndex + 1;
                }
                else {
                    var insertBefore = undefined;
                    var child = oldChildren[oldIndex];
                    if (child) {
                        var nextIndex = oldIndex + 1;
                        while (insertBefore === undefined) {
                            if (d_1.isWNode(child)) {
                                if (child.rendered) {
                                    child = child.rendered[0];
                                }
                                else if (oldChildren[nextIndex]) {
                                    child = oldChildren[nextIndex];
                                    nextIndex++;
                                }
                                else {
                                    break;
                                }
                            }
                            else {
                                insertBefore = child.domNode;
                            }
                        }
                    }
                    createDom(newChild, parentVNode, insertBefore, projectionOptions, parentInstance);
                    nodeAdded(newChild, transitions);
                    var indexToCheck_1 = newIndex;
                    projectionOptions.afterRenderCallbacks.push(function () {
                        checkDistinguishable(newChildren, indexToCheck_1, parentInstance);
                    });
                }
            }
            newIndex++;
        };
        while (newIndex < newChildrenLength) {
            _loop_1();
        }
        if (oldChildrenLength > oldIndex) {
            var _loop_3 = function () {
                var oldChild = oldChildren[i];
                var indexToCheck = i;
                projectionOptions.afterRenderCallbacks.push(function () {
                    callOnDetach(oldChild, parentInstance);
                    checkDistinguishable(oldChildren, indexToCheck, parentInstance);
                });
                nodeToRemove(oldChildren[i], transitions, projectionOptions);
            };
            // Remove child fragments
            for (i = oldIndex; i < oldChildrenLength; i++) {
                _loop_3();
            }
        }
        return textUpdated;
    }
    function addChildren(parentVNode, children, projectionOptions, parentInstance, insertBefore, childNodes) {
        if (insertBefore === void 0) { insertBefore = undefined; }
        if (children === undefined) {
            return;
        }
        if (projectionOptions.merge && childNodes === undefined) {
            childNodes = array_1.from(parentVNode.domNode.childNodes);
        }
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (d_1.isVNode(child)) {
                if (projectionOptions.merge && childNodes) {
                    var domElement = undefined;
                    while (child.domNode === undefined && childNodes.length > 0) {
                        domElement = childNodes.shift();
                        if (domElement && domElement.tagName === (child.tag.toUpperCase() || undefined)) {
                            child.domNode = domElement;
                        }
                    }
                }
                createDom(child, parentVNode, insertBefore, projectionOptions, parentInstance);
            }
            else {
                createDom(child, parentVNode, insertBefore, projectionOptions, parentInstance, childNodes);
            }
        }
    }
    function initPropertiesAndChildren(domNode, dnode, parentInstance, projectionOptions) {
        addChildren(dnode, dnode.children, projectionOptions, parentInstance, undefined);
        if (typeof dnode.deferredPropertiesCallback === 'function') {
            addDeferredProperties(dnode, projectionOptions);
        }
        setProperties(domNode, dnode.properties, projectionOptions);
        if (dnode.properties.key !== null && dnode.properties.key !== undefined) {
            var instanceData_1 = exports.widgetInstanceMap.get(parentInstance);
            instanceData_1.nodeHandler.add(domNode, "" + dnode.properties.key);
            projectionOptions.afterRenderCallbacks.push(function () {
                instanceData_1.onElementCreated(domNode, dnode.properties.key);
            });
        }
        dnode.inserted = true;
    }
    function createDom(dnode, parentVNode, insertBefore, projectionOptions, parentInstance, childNodes) {
        var domNode;
        if (d_1.isWNode(dnode)) {
            var widgetConstructor = dnode.widgetConstructor;
            var parentInstanceData = exports.widgetInstanceMap.get(parentInstance);
            if (!Registry_1.isWidgetBaseConstructor(widgetConstructor)) {
                var item = parentInstanceData.registry().get(widgetConstructor);
                if (item === null) {
                    return;
                }
                widgetConstructor = item;
            }
            var instance = new widgetConstructor();
            dnode.instance = instance;
            var instanceData_2 = exports.widgetInstanceMap.get(instance);
            instanceData_2.parentInvalidate = parentInstanceData.invalidate;
            instance.__setCoreProperties__(dnode.coreProperties);
            instance.__setChildren__(dnode.children);
            instance.__setProperties__(dnode.properties);
            var rendered = instance.__render__();
            if (rendered) {
                var filteredRendered = filterAndDecorateChildren(rendered, instance);
                dnode.rendered = filteredRendered;
                addChildren(parentVNode, filteredRendered, projectionOptions, instance, insertBefore, childNodes);
            }
            instanceData_2.nodeHandler.addRoot();
            projectionOptions.afterRenderCallbacks.push(function () {
                instanceData_2.onAttach();
            });
        }
        else {
            if (projectionOptions.merge && projectionOptions.mergeElement !== undefined) {
                domNode = dnode.domNode = projectionOptions.mergeElement;
                projectionOptions.mergeElement = undefined;
                initPropertiesAndChildren(domNode, dnode, parentInstance, projectionOptions);
                return;
            }
            var doc = parentVNode.domNode.ownerDocument;
            if (dnode.tag === '') {
                if (dnode.domNode !== undefined) {
                    var newDomNode = dnode.domNode.ownerDocument.createTextNode(dnode.text);
                    dnode.domNode.parentNode.replaceChild(newDomNode, dnode.domNode);
                    dnode.domNode = newDomNode;
                }
                else {
                    domNode = dnode.domNode = doc.createTextNode(dnode.text);
                    if (insertBefore !== undefined) {
                        parentVNode.domNode.insertBefore(domNode, insertBefore);
                    }
                    else {
                        parentVNode.domNode.appendChild(domNode);
                    }
                }
            }
            else {
                if (dnode.domNode === undefined) {
                    if (dnode.tag === 'svg') {
                        projectionOptions = tslib_1.__assign({}, projectionOptions, { namespace: NAMESPACE_SVG });
                    }
                    if (projectionOptions.namespace !== undefined) {
                        domNode = dnode.domNode = doc.createElementNS(projectionOptions.namespace, dnode.tag);
                    }
                    else {
                        domNode = dnode.domNode = dnode.domNode || doc.createElement(dnode.tag);
                    }
                }
                else {
                    domNode = dnode.domNode;
                }
                initPropertiesAndChildren(domNode, dnode, parentInstance, projectionOptions);
                if (insertBefore !== undefined) {
                    parentVNode.domNode.insertBefore(domNode, insertBefore);
                }
                else if (domNode.parentNode !== parentVNode.domNode) {
                    parentVNode.domNode.appendChild(domNode);
                }
            }
        }
    }
    function updateDom(previous, dnode, projectionOptions, parentVNode, parentInstance) {
        if (d_1.isWNode(dnode)) {
            var instance = previous.instance, previousRendered = previous.rendered;
            if (instance && previousRendered) {
                var instanceData = exports.widgetInstanceMap.get(instance);
                instance.__setCoreProperties__(dnode.coreProperties);
                instance.__setChildren__(dnode.children);
                instance.__setProperties__(dnode.properties);
                dnode.instance = instance;
                if (instanceData.dirty === true) {
                    var rendered = instance.__render__();
                    dnode.rendered = filterAndDecorateChildren(rendered, instance);
                    updateChildren(parentVNode, previousRendered, dnode.rendered, instance, projectionOptions);
                }
                else {
                    dnode.rendered = previousRendered;
                }
                instanceData.nodeHandler.addRoot();
            }
            else {
                createDom(dnode, parentVNode, undefined, projectionOptions, parentInstance);
            }
        }
        else {
            if (previous === dnode) {
                return false;
            }
            var domNode_2 = (dnode.domNode = previous.domNode);
            var textUpdated = false;
            var updated = false;
            dnode.inserted = previous.inserted;
            if (dnode.tag === '') {
                if (dnode.text !== previous.text) {
                    var newDomNode = domNode_2.ownerDocument.createTextNode(dnode.text);
                    domNode_2.parentNode.replaceChild(newDomNode, domNode_2);
                    dnode.domNode = newDomNode;
                    textUpdated = true;
                    return textUpdated;
                }
            }
            else {
                if (dnode.tag.lastIndexOf('svg', 0) === 0) {
                    projectionOptions = tslib_1.__assign({}, projectionOptions, { namespace: NAMESPACE_SVG });
                }
                if (previous.children !== dnode.children) {
                    var children = filterAndDecorateChildren(dnode.children, parentInstance);
                    dnode.children = children;
                    updated =
                        updateChildren(dnode, previous.children, children, parentInstance, projectionOptions) || updated;
                }
                if (typeof dnode.deferredPropertiesCallback === 'function') {
                    addDeferredProperties(dnode, projectionOptions);
                }
                updated = updateProperties(domNode_2, previous.properties, dnode.properties, projectionOptions) || updated;
                if (dnode.properties.key !== null && dnode.properties.key !== undefined) {
                    var instanceData_3 = exports.widgetInstanceMap.get(parentInstance);
                    instanceData_3.nodeHandler.add(domNode_2, "" + dnode.properties.key);
                    projectionOptions.afterRenderCallbacks.push(function () {
                        instanceData_3.onElementUpdated(domNode_2, dnode.properties.key);
                    });
                }
            }
            if (updated && dnode.properties && dnode.properties.updateAnimation) {
                dnode.properties.updateAnimation(domNode_2, dnode.properties, previous.properties);
            }
            return textUpdated;
        }
    }
    function addDeferredProperties(vnode, projectionOptions) {
        // transfer any properties that have been passed - as these must be decorated properties
        vnode.decoratedDeferredProperties = vnode.properties;
        var properties = vnode.deferredPropertiesCallback(!!vnode.inserted);
        vnode.properties = tslib_1.__assign({}, properties, vnode.decoratedDeferredProperties);
        projectionOptions.deferredRenderCallbacks.push(function () {
            var properties = tslib_1.__assign({}, vnode.deferredPropertiesCallback(!!vnode.inserted), vnode.decoratedDeferredProperties);
            updateProperties(vnode.domNode, vnode.properties, properties, projectionOptions);
            vnode.properties = properties;
        });
    }
    function runDeferredRenderCallbacks(projectionOptions) {
        if (projectionOptions.deferredRenderCallbacks.length) {
            if (projectionOptions.sync) {
                while (projectionOptions.deferredRenderCallbacks.length) {
                    var callback = projectionOptions.deferredRenderCallbacks.shift();
                    callback && callback();
                }
            }
            else {
                global_1.default.requestAnimationFrame(function () {
                    while (projectionOptions.deferredRenderCallbacks.length) {
                        var callback = projectionOptions.deferredRenderCallbacks.shift();
                        callback && callback();
                    }
                });
            }
        }
    }
    function runAfterRenderCallbacks(projectionOptions) {
        if (projectionOptions.sync) {
            while (projectionOptions.afterRenderCallbacks.length) {
                var callback = projectionOptions.afterRenderCallbacks.shift();
                callback && callback();
            }
        }
        else {
            if (global_1.default.requestIdleCallback) {
                global_1.default.requestIdleCallback(function () {
                    while (projectionOptions.afterRenderCallbacks.length) {
                        var callback = projectionOptions.afterRenderCallbacks.shift();
                        callback && callback();
                    }
                });
            }
            else {
                setTimeout(function () {
                    while (projectionOptions.afterRenderCallbacks.length) {
                        var callback = projectionOptions.afterRenderCallbacks.shift();
                        callback && callback();
                    }
                });
            }
        }
    }
    function createProjection(dnode, parentInstance, projectionOptions) {
        var projectionDNode = Array.isArray(dnode) ? dnode : [dnode];
        projectionOptions.merge = false;
        return {
            update: function (updatedDNode) {
                var domNode = projectionOptions.rootNode;
                updatedDNode = filterAndDecorateChildren(updatedDNode, parentInstance);
                updateChildren(toParentVNode(domNode), projectionDNode, updatedDNode, parentInstance, projectionOptions);
                var instanceData = exports.widgetInstanceMap.get(parentInstance);
                instanceData.nodeHandler.addRoot();
                runDeferredRenderCallbacks(projectionOptions);
                runAfterRenderCallbacks(projectionOptions);
                projectionDNode = updatedDNode;
            },
            domNode: projectionOptions.rootNode
        };
    }
    exports.dom = {
        create: function (dNode, instance, projectionOptions) {
            var finalProjectorOptions = getProjectionOptions(projectionOptions);
            var rootNode = document.createElement('div');
            finalProjectorOptions.rootNode = rootNode;
            var decoratedNode = filterAndDecorateChildren(dNode, instance);
            addChildren(toParentVNode(finalProjectorOptions.rootNode), decoratedNode, finalProjectorOptions, instance, undefined);
            var instanceData = exports.widgetInstanceMap.get(instance);
            instanceData.nodeHandler.addRoot();
            finalProjectorOptions.afterRenderCallbacks.push(function () {
                instanceData.onAttach();
            });
            runDeferredRenderCallbacks(finalProjectorOptions);
            runAfterRenderCallbacks(finalProjectorOptions);
            return createProjection(decoratedNode, instance, finalProjectorOptions);
        },
        append: function (parentNode, dNode, instance, projectionOptions) {
            var finalProjectorOptions = getProjectionOptions(projectionOptions);
            finalProjectorOptions.rootNode = parentNode;
            var decoratedNode = filterAndDecorateChildren(dNode, instance);
            addChildren(toParentVNode(finalProjectorOptions.rootNode), decoratedNode, finalProjectorOptions, instance, undefined);
            var instanceData = exports.widgetInstanceMap.get(instance);
            instanceData.nodeHandler.addRoot();
            finalProjectorOptions.afterRenderCallbacks.push(function () {
                instanceData.onAttach();
            });
            runDeferredRenderCallbacks(finalProjectorOptions);
            runAfterRenderCallbacks(finalProjectorOptions);
            return createProjection(decoratedNode, instance, finalProjectorOptions);
        },
        merge: function (element, dNode, instance, projectionOptions) {
            if (Array.isArray(dNode)) {
                throw new Error('Unable to merge an array of nodes. (consider adding one extra level to the virtual DOM)');
            }
            var finalProjectorOptions = getProjectionOptions(projectionOptions);
            finalProjectorOptions.merge = true;
            finalProjectorOptions.mergeElement = element;
            finalProjectorOptions.rootNode = element.parentNode;
            var decoratedNode = filterAndDecorateChildren(dNode, instance)[0];
            createDom(decoratedNode, toParentVNode(finalProjectorOptions.rootNode), undefined, finalProjectorOptions, instance);
            var instanceData = exports.widgetInstanceMap.get(instance);
            instanceData.nodeHandler.addRoot();
            finalProjectorOptions.afterRenderCallbacks.push(function () {
                instanceData.onAttach();
            });
            runDeferredRenderCallbacks(finalProjectorOptions);
            runAfterRenderCallbacks(finalProjectorOptions);
            return createProjection(decoratedNode, instance, finalProjectorOptions);
        },
        replace: function (element, dNode, instance, projectionOptions) {
            if (Array.isArray(dNode)) {
                throw new Error('Unable to replace a node with an array of nodes. (consider adding one extra level to the virtual DOM)');
            }
            var finalProjectorOptions = getProjectionOptions(projectionOptions);
            var decoratedNode = filterAndDecorateChildren(dNode, instance)[0];
            finalProjectorOptions.rootNode = element.parentNode;
            createDom(decoratedNode, toParentVNode(finalProjectorOptions.rootNode), element, finalProjectorOptions, instance);
            var instanceData = exports.widgetInstanceMap.get(instance);
            instanceData.nodeHandler.addRoot();
            finalProjectorOptions.afterRenderCallbacks.push(function () {
                instanceData.onAttach();
            });
            runDeferredRenderCallbacks(finalProjectorOptions);
            runAfterRenderCallbacks(finalProjectorOptions);
            element.parentNode.removeChild(element);
            return createProjection(decoratedNode, instance, finalProjectorOptions);
        }
    };
});
//# sourceMappingURL=vdom.js.map