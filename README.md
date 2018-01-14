# ReApply
Trap application of an infinite tree of functions

### Usage
```javascript
const RA = ReApply((method) => (...args) => {
  // method = ['any', 'arbitrary', 'keys']
  // args = ['and', { args: '!' }]
  // this = RA.any.arbitrary
  return output;
});

const output = RA.any.arbitrary.keys('and', { args: '!' });

```

### Behavior
```javascript
const RA = ReApply();

// immutable
delete RA.some.random.key // throw Error
RA.some.random.key = 1234 // throw Error

// infinite keys
'any-random-key' in RA // true
Object.getOwnPropertyNames(RA) // []

// no native props
RA.call // NOT Function#call
RA.prototype // NOT Object#prototype

// iterable keys
[...RA.one.two] // ['one', 'two']

// serializable
`${ RA.one.two }` // '<ReApply.one.two>'
```

### Examples

#### Async
```javascript
const RA = ReApply(() => async () => output);
const output = await RA.some.async.func();
```

#### Forward calls to remote api
```javascript
const API = ReApply((method) => async (...args) => {
  return await fetch('https://foo.bar', {
    method: 'POST',
    body: JSON.stringify({ method, args }), 
  })
});

await API.User.get.byId(123);
```

#### Method-based traps
```javascript
const API = ReApply((method) => {
  if (method.join('.') === 'User.get') return () => 1;
  if (method.join('.') === 'User.find') return () => 2;
  return () => 3;
});

API.User.get() // 1
API.User.find() // 2
API.User.other() // 3
```

#### Get method by path
```javascript
// ~=
ReApply(trap).User.get.byId(123);
ReApply.path(['User', 'get', 'byId'])(trap)(123);
```