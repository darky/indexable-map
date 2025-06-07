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
    [
      30,
      {
        key: 1,
        value: {
          age: 30,
          firstName: 'Galina',
          lastName: 'Ivanova',
        },
      },
    ],
    [
      59,
      {
        key: 2,
        value: {
          age: 59,
          firstName: 'Zinaida',
          lastName: 'Petrovna',
        },
      },
    ],
    [
      17,
      {
        key: 3,
        value: {
          age: 17,
          firstName: 'Stepan',
          lastName: 'Lukov',
        },
      },
    ],
  ])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [
    [
      'Ivanova',
      {
        key: 1,
        value: {
          age: 30,
          firstName: 'Galina',
          lastName: 'Ivanova',
        },
      },
    ],
    [
      'Petrovna',
      {
        key: 2,
        value: {
          age: 59,
          firstName: 'Zinaida',
          lastName: 'Petrovna',
        },
      },
    ],
    [
      'Lukov',
      {
        key: 3,
        value: {
          age: 17,
          firstName: 'Stepan',
          lastName: 'Lukov',
        },
      },
    ],
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
    [
      30,
      {
        key: 1,
        value: {
          age: 30,
          firstName: 'Galina',
          lastName: 'Ivanova',
        },
      },
    ],
    [
      59,
      {
        key: 2,
        value: {
          age: 59,
          firstName: 'Zinaida',
          lastName: 'Petrovna',
        },
      },
    ],
    [
      59,
      {
        key: 4,
        value: {
          age: 59,
          firstName: 'Ibragim',
          lastName: 'Lukov',
        },
      },
    ],
    [
      17,
      {
        key: 3,
        value: {
          age: 17,
          firstName: 'Stepan',
          lastName: 'Lukov',
        },
      },
    ],
  ])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [
    [
      'Ivanova',
      {
        key: 1,
        value: {
          age: 30,
          firstName: 'Galina',
          lastName: 'Ivanova',
        },
      },
    ],
    [
      'Petrovna',
      {
        key: 2,
        value: {
          age: 59,
          firstName: 'Zinaida',
          lastName: 'Petrovna',
        },
      },
    ],
    [
      'Lukov',
      {
        key: 3,
        value: {
          age: 17,
          firstName: 'Stepan',
          lastName: 'Lukov',
        },
      },
    ],
    [
      'Lukov',
      {
        key: 4,
        value: {
          age: 59,
          firstName: 'Ibragim',
          lastName: 'Lukov',
        },
      },
    ],
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

  assert.deepStrictEqual(Array.from((im as any)._maps.age.entries()), [
    [
      59,
      {
        key: 2,
        value: {
          age: 59,
          firstName: 'Zinaida',
          lastName: 'Petrovna',
        },
      },
    ],
    [
      59,
      {
        key: 4,
        value: {
          age: 59,
          firstName: 'Ibragim',
          lastName: 'Lukov',
        },
      },
    ],
  ])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [
    [
      'Lukov',
      {
        key: 3,
        value: {
          age: 17,
          firstName: 'Stepan',
          lastName: 'Lukov',
        },
      },
    ],
    [
      'Lukov',
      {
        key: 4,
        value: {
          age: 59,
          firstName: 'Ibragim',
          lastName: 'Lukov',
        },
      },
    ],
  ])
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
    [
      30,
      {
        key: 1,
        value: {
          age: 30,
          firstName: 'Galina',
          lastName: 'Ivanova',
        },
      },
    ],
    [
      59,
      {
        key: 2,
        value: {
          age: 59,
          firstName: 'Zinaida',
          lastName: 'Petrovna',
        },
      },
    ],
    [
      17,
      {
        key: 3,
        value: {
          age: 17,
          firstName: 'Stepan',
          lastName: 'Lukov',
        },
      },
    ],
    [
      40,
      {
        key: 4,
        value: {
          age: 40,
          firstName: 'Elena',
          lastName: 'Korchagina',
        },
      },
    ],
  ])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [
    [
      'Ivanova',
      {
        key: 1,
        value: {
          age: 30,
          firstName: 'Galina',
          lastName: 'Ivanova',
        },
      },
    ],
    [
      'Petrovna',
      {
        key: 2,
        value: {
          age: 59,
          firstName: 'Zinaida',
          lastName: 'Petrovna',
        },
      },
    ],
    [
      'Lukov',
      {
        key: 3,
        value: {
          age: 17,
          firstName: 'Stepan',
          lastName: 'Lukov',
        },
      },
    ],
    [
      'Korchagina',
      {
        key: 4,
        value: {
          age: 40,
          firstName: 'Elena',
          lastName: 'Korchagina',
        },
      },
    ],
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
    [
      30,
      {
        key: 1,
        value: {
          age: 30,
          firstName: 'Galina',
          lastName: 'Ivanova',
        },
      },
    ],
    [
      59,
      {
        key: 2,
        value: {
          age: 59,
          firstName: 'Zinaida',
          lastName: 'Petrovna',
        },
      },
    ],
    [
      17,
      {
        key: 3,
        value: {
          age: 17,
          firstName: 'Stepan',
          lastName: 'Lukov',
        },
      },
    ],
  ])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [
    [
      'Ivanova',
      {
        key: 1,
        value: {
          age: 30,
          firstName: 'Galina',
          lastName: 'Ivanova',
        },
      },
    ],
    [
      'Petrovna',
      {
        key: 2,
        value: {
          age: 59,
          firstName: 'Zinaida',
          lastName: 'Petrovna',
        },
      },
    ],
    [
      'Lukov',
      {
        key: 3,
        value: {
          age: 17,
          firstName: 'Stepan',
          lastName: 'Lukov',
        },
      },
    ],
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
    [
      30,
      {
        key: 1,
        value: {
          age: 30,
          firstName: 'Galina',
          lastName: 'Ivanova',
        },
      },
    ],
    [
      59,
      {
        key: 2,
        value: {
          age: 59,
          firstName: 'Zinaida',
          lastName: 'Petrovna',
        },
      },
    ],
    [
      17,
      {
        key: 3,
        value: {
          age: 17,
          firstName: 'Stepan',
          lastName: 'Lukov',
        },
      },
    ],
  ])
  assert.deepStrictEqual(Array.from((im as any)._maps.lastName.entries()), [
    [
      'Ivanova',
      {
        key: 1,
        value: {
          age: 30,
          firstName: 'Galina',
          lastName: 'Ivanova',
        },
      },
    ],
    [
      'Petrovna',
      {
        key: 2,
        value: {
          age: 59,
          firstName: 'Zinaida',
          lastName: 'Petrovna',
        },
      },
    ],
    [
      'Lukov',
      {
        key: 3,
        value: {
          age: 17,
          firstName: 'Stepan',
          lastName: 'Lukov',
        },
      },
    ],
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
