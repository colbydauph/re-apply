'use strict';

const util = require('util');

const noop = () => {};
const readOnly = () => {
  throw new TypeError('Read-only');
};

const toPrimitive = (method) => (hint) => {
  if (hint !== 'number') return `<ReApply.${ method.join('.') }>`;
};

const iteratorOf = (arr) => function* iteratorOf() {
  for (const el of arr) yield el;
};

const getKnownProp = (propName, method) => {
  if (propName === util.inspect.custom) return toPrimitive(method);
  if (propName === Symbol.toPrimitive) return toPrimitive(method);
  if (propName === Symbol.iterator) return iteratorOf(method);
  if (propName === Symbol.toStringTag) return () => 'ReApply';
};

const ReApplyRoot = (method = []) => function ReApply(handler = noop) {
  return new Proxy(handler, {
    set: readOnly,
    deleteProperty: readOnly,
    get: (target, propName) => {
      return getKnownProp(propName, method) ||
             ReApplyRoot([...method, propName])(handler);
    },
    apply: (target, context, args) => target({ method, args, context }),
  });
};

module.exports = Object.assign(
  ReApplyRoot([]),
  { root: ReApplyRoot },
);
