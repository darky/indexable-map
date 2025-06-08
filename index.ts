const objKeys = Object.keys.bind(Object) as <K extends string>(obj: {
  [key in K]: unknown
}) => K[]

export class IndexableMap<K, V, I extends string> extends Map<K, V> {
  private _indexes = {} as {
    [indexName in I]: Map<V[keyof V], Set<K>>
  }
  private _indexFields = {} as {
    [indexName in I]: keyof V
  }
  private _indexFilters = {} as {
    [indexName in I]: (val: V) => boolean
  }
  private _indexesEnabled = true

  constructor(
    entries: readonly (readonly [K, V])[] = [],
    {
      indexes = [],
      indexesEnabled = true,
    }: {
      indexes?: { field: keyof V; filter: (val: V) => boolean; name: I }[]
      indexesEnabled?: boolean
    } = { indexes: [], indexesEnabled: true }
  ) {
    super(entries satisfies ConstructorParameters<MapConstructor>[0])
    for (const { field, filter, name } of indexes) {
      this._indexes[name] = new Map()
      this._indexFields[name] = field
      this._indexFilters[name] = filter
    }
    if (indexesEnabled === false) {
      this._indexesEnabled = false
    }
    if (this._indexesEnabled) {
      this.refreshIndexes()
    }
  }

  getByIndex<K extends keyof V>(name: I, value: V[K]) {
    const resp: V[] = []
    for (const key of this._indexes[name]?.get(value) ?? new Set()) {
      resp.push(this.get(key)!)
    }
    return resp
  }

  refreshIndexes() {
    for (const [key, value] of this.entries()) {
      for (const indexName of objKeys(this._indexes)) {
        if (this._indexFilters[indexName](value)) {
          this._indexes[indexName].set(
            value[this._indexFields[indexName]],
            (this._indexes[indexName].get(value[this._indexFields[indexName]]) ?? new Set()).add(key)
          )
        }
      }
    }
    return this
  }

  enableIndexes() {
    this._indexesEnabled = true
    return this
  }

  disableIndexes() {
    this._indexesEnabled = false
    return this
  }

  override set(key: K, value: V) {
    if (this._indexesEnabled) {
      const oldVal = this.get(key)
      for (const indexName of objKeys(this._indexes)) {
        if (oldVal != null) {
          for (const k of this._indexes[indexName].get(oldVal[this._indexFields[indexName]]) ?? new Set()) {
            if (key === k) {
              this._indexes[indexName].get(oldVal[this._indexFields[indexName]])?.delete(k)
            }
          }
        }
        if (this._indexFilters[indexName](value)) {
          this._indexes[indexName].set(
            value[this._indexFields[indexName]],
            (this._indexes[indexName].get(value[this._indexFields[indexName]]) ?? new Set()).add(key)
          )
        }
      }
    }
    return super.set(key, value)
  }

  override delete(key: K) {
    if (this._indexesEnabled) {
      const oldVal = this.get(key)
      if (oldVal != null) {
        for (const indexName of objKeys(this._indexes)) {
          for (const k of this._indexes[indexName].get(oldVal[this._indexFields[indexName]]) ?? new Set()) {
            if (key === k) {
              this._indexes[indexName].get(oldVal[this._indexFields[indexName]])?.delete(k)
            }
          }
        }
      }
    }
    return super.delete(key)
  }

  override clear() {
    if (this._indexesEnabled) {
      for (const indexedField of objKeys(this._indexes)) {
        this._indexes[indexedField].clear()
      }
    }
    return super.clear()
  }
}
