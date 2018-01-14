'use strict';

const util = require('util');

const noop = () => {};
const noop2 = () => () => {};
const readOnly = () => {
  throw new Error('Read-only');
};

const toPrimitive = (method) => (hint) => {
  if (hint !== 'number') return `<${ ['ReApply', ...method].join('.') }>`;
};

const iteratorFrom = (arr) => function* iteratorFrom() {
  for (const el of arr) yield el;
};

// these are the only props defined on functions in the tree
const getKnownProp = (propName, method) => ({
  [util.inspect.custom]: toPrimitive,
  [Symbol.toPrimitive]: toPrimitive,
  [Symbol.iterator]: iteratorFrom,
  [Symbol.toStringTag]: () => 'ReApply',
}[propName] || noop)(method);

// Array<String> -> ReApply
const ReApplyAt = (method = []) => function ReApply(handler = noop2) {
  return new Proxy(handler(method), {
    set: readOnly,
    deleteProperty: readOnly,
    // keys are unbounded
    has: () => true,
    ownKeys: () => [],
    get: (target, propName) => {
      return getKnownProp(propName, method) ||
             ReApplyAt([...method, propName])(handler);
    },
    apply: (target, context, args) => target.apply(context, args),
  });
};

module.exports = Object.assign(
  ReApplyAt([]),
  { path: ReApplyAt },
);
