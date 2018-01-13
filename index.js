'use strict';

const noop = () => {};
const readOnly = () => {
  throw new TypeError('Read-only');
};

const ReApplyRoot = (method = []) => function ReApply(handler = noop) {
  return new Proxy(handler, {
    set: readOnly,
    deleteProperty: readOnly,
    get: (target, propName) => ReApplyRoot([...method, propName])(handler),
    apply: (target, context, args) => target({ method, args, context }),
  });
};

module.exports = Object.assign(
  ReApplyRoot([]),
  { root: ReApplyRoot },
);
