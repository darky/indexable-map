import test from 'node:test'
import { IndexableMap } from './index.ts'
import assert from 'node:assert'

test('should construct indexable map', () => {
  const im = new IndexableMap<number, { age: number; firstName: string; lastName: string }>(
    [
      [1, { age: 30, firstName: 'Galina', lastName: 'Ivanova' }],
      [2, { age: 59, firstName: 'Zinaida', lastName: 'Petrovna' }],
      [3, { age: 17, firstName: 'Stepan', lastName: 'Lukov' }],
    ],
    [
      {
        field: 'age',
        filter() {
          return true
        },
      },
      {
        field: 'lastName',
        filter() {
          return true
        },
      },
    ]
  )

  assert.deepStrictEqual(Array.from((im as any)._maps.age.entries()), [
    [30, new Set([1])],
    [59, new Set([2])],
    [17, new Set([3])],
  ])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [
    ['Ivanova', new Set([1])],
    ['Petrovna', new Set([2])],
    ['Lukov', new Set([3])],
  ])
  assert.deepStrictEqual((im as any)._maps.firstName, void 0)
})

test('should construct indexable map with multiple values for same secondary index', () => {
  const im = new IndexableMap<number, { age: number; firstName: string; lastName: string }>(
    [
      [1, { age: 30, firstName: 'Galina', lastName: 'Ivanova' }],
      [2, { age: 59, firstName: 'Zinaida', lastName: 'Petrovna' }],
      [3, { age: 17, firstName: 'Stepan', lastName: 'Lukov' }],
      [4, { age: 59, firstName: 'Ibragim', lastName: 'Lukov' }],
    ],
    [
      {
        field: 'age',
        filter() {
          return true
        },
      },
      {
        field: 'lastName',
        filter() {
          return true
        },
      },
    ]
  )

  assert.deepStrictEqual(Array.from((im as any)._maps.age.entries()), [
    [30, new Set([1])],
    [59, new Set([2, 4])],
    [17, new Set([3])],
  ])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [
    ['Ivanova', new Set([1])],
    ['Petrovna', new Set([2])],
    ['Lukov', new Set([3, 4])],
  ])
  assert.deepStrictEqual((im as any)._maps.firstName, void 0)
})

test('should construct indexable map with filtered secondary index', () => {
  const im = new IndexableMap<number, { age: number; firstName: string; lastName: string }>(
    [
      [1, { age: 30, firstName: 'Galina', lastName: 'Ivanova' }],
      [2, { age: 59, firstName: 'Zinaida', lastName: 'Petrovna' }],
      [3, { age: 17, firstName: 'Stepan', lastName: 'Lukov' }],
      [4, { age: 59, firstName: 'Ibragim', lastName: 'Lukov' }],
    ],
    [
      {
        field: 'age',
        filter({ age }) {
          return age > 30
        },
      },
      {
        field: 'lastName',
        filter({ lastName }) {
          return lastName.startsWith('L')
        },
      },
    ]
  )

  assert.deepStrictEqual(Array.from((im as any)._maps.age.entries()), [[59, new Set([2, 4])]])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [['Lukov', new Set([3, 4])]])
  assert.deepStrictEqual((im as any)._maps.firstName, void 0)
})

test('should properly set', () => {
  const im = new IndexableMap<number, { age: number; firstName: string; lastName: string }>(
    [
      [1, { age: 30, firstName: 'Galina', lastName: 'Ivanova' }],
      [2, { age: 59, firstName: 'Zinaida', lastName: 'Petrovna' }],
      [3, { age: 17, firstName: 'Stepan', lastName: 'Lukov' }],
      [4, { age: 59, firstName: 'Ibragim', lastName: 'Lukov' }],
    ],
    [
      {
        field: 'age',
        filter() {
          return true
        },
      },
      {
        field: 'lastName',
        filter() {
          return true
        },
      },
    ]
  )

  im.set(4, { age: 40, firstName: 'Elena', lastName: 'Korchagina' })

  assert.deepStrictEqual(im.get(4), { age: 40, firstName: 'Elena', lastName: 'Korchagina' })
  assert.deepStrictEqual(Array.from((im as any)._maps.age.entries()), [
    [30, new Set([1])],
    [59, new Set([2])],
    [17, new Set([3])],
    [40, new Set([4])],
  ])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [
    ['Ivanova', new Set([1])],
    ['Petrovna', new Set([2])],
    ['Lukov', new Set([3])],
    ['Korchagina', new Set([4])],
  ])
  assert.deepStrictEqual((im as any)._maps.firstName, void 0)
})

test('should properly del', () => {
  const im = new IndexableMap<number, { age: number; firstName: string; lastName: string }>(
    [
      [1, { age: 30, firstName: 'Galina', lastName: 'Ivanova' }],
      [2, { age: 59, firstName: 'Zinaida', lastName: 'Petrovna' }],
      [3, { age: 17, firstName: 'Stepan', lastName: 'Lukov' }],
      [4, { age: 59, firstName: 'Ibragim', lastName: 'Lukov' }],
    ],
    [
      {
        field: 'age',
        filter() {
          return true
        },
      },
      {
        field: 'lastName',
        filter() {
          return true
        },
      },
    ]
  )

  im.delete(4)

  assert.deepStrictEqual(im.get(4), void 0)
  assert.deepStrictEqual(Array.from((im as any)._maps.age.entries()), [
    [30, new Set([1])],
    [59, new Set([2])],
    [17, new Set([3])],
  ])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [
    ['Ivanova', new Set([1])],
    ['Petrovna', new Set([2])],
    ['Lukov', new Set([3])],
  ])
  assert.deepStrictEqual((im as any)._maps.firstName, void 0)
})

test('should properly clear', () => {
  const im = new IndexableMap<number, { age: number; firstName: string; lastName: string }>(
    [
      [1, { age: 30, firstName: 'Galina', lastName: 'Ivanova' }],
      [2, { age: 59, firstName: 'Zinaida', lastName: 'Petrovna' }],
      [3, { age: 17, firstName: 'Stepan', lastName: 'Lukov' }],
      [4, { age: 59, firstName: 'Ibragim', lastName: 'Lukov' }],
    ],
    [
      {
        field: 'age',
        filter() {
          return true
        },
      },
      {
        field: 'lastName',
        filter() {
          return true
        },
      },
    ]
  )

  im.clear()

  assert.deepStrictEqual(im.size, 0)
  assert.deepStrictEqual(Array.from((im as any)._maps.age.entries()), [])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [])
  assert.deepStrictEqual((im as any)._maps.firstName, void 0)
})

test('should properly del', () => {
  const im = new IndexableMap<number, { age: number; firstName: string; lastName: string }>(
    [
      [1, { age: 30, firstName: 'Galina', lastName: 'Ivanova' }],
      [2, { age: 59, firstName: 'Zinaida', lastName: 'Petrovna' }],
      [3, { age: 17, firstName: 'Stepan', lastName: 'Lukov' }],
      [4, { age: 59, firstName: 'Ibragim', lastName: 'Lukov' }],
    ],
    [
      {
        field: 'age',
        filter() {
          return true
        },
      },
      {
        field: 'lastName',
        filter() {
          return true
        },
      },
    ]
  )

  im.delete(4)

  assert.deepStrictEqual(im.get(4), void 0)
  assert.deepStrictEqual(Array.from((im as any)._maps.age.entries()), [
    [30, new Set([1])],
    [59, new Set([2])],
    [17, new Set([3])],
  ])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [
    ['Ivanova', new Set([1])],
    ['Petrovna', new Set([2])],
    ['Lukov', new Set([3])],
  ])
  assert.deepStrictEqual((im as any)._maps.firstName, void 0)
})

test('should properly get by index', () => {
  const im = new IndexableMap<number, { age: number; firstName: string; lastName: string }>(
    [
      [1, { age: 30, firstName: 'Galina', lastName: 'Ivanova' }],
      [2, { age: 59, firstName: 'Zinaida', lastName: 'Petrovna' }],
      [3, { age: 17, firstName: 'Stepan', lastName: 'Lukov' }],
      [4, { age: 59, firstName: 'Ibragim', lastName: 'Lukov' }],
    ],
    [
      {
        field: 'age',
        filter() {
          return true
        },
      },
      {
        field: 'lastName',
        filter() {
          return true
        },
      },
    ]
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
})
