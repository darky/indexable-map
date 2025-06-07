# indexable-map

Built-in JavaScript Map with secondary indexes

## Example

```typescript
import assert from 'node:assert'
import { IndexableMap } from 'indexable-map'

const im = new IndexableMap<number, { age: number; firstName: string; lastName: string }>(
  [
    [1, { age: 30, firstName: 'Galina', lastName: 'Ivanova' }],
    [2, { age: 59, firstName: 'Zinaida', lastName: 'Petrovna' }],
    [3, { age: 17, firstName: 'Stepan', lastName: 'Lukov' }],
    [4, { age: 59, firstName: 'Ibragim', lastName: 'Lukov' }],
  ],
  ['age', 'lastName']
)

assert.deepStrictEqual(im.getByIndex('age', 59), [
  {
    age: 59,
    firstName: 'Zinaida',
    lastName: 'Petrovna',
  },
  {
    age: 59,
    firstName: 'Ibragim',
    lastName: 'Lukov',
  },
])
assert.deepStrictEqual(im.getByIndex('lastName', 'Petrovna'), [
  { age: 59, firstName: 'Zinaida', lastName: 'Petrovna' },
])
assert.deepStrictEqual(im.getByIndex('lastName', 'Zaiceva'), [])
assert.deepStrictEqual(im.getByIndex('firstName', 'Alexey'), [])
```
