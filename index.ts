const objKeys = Object.keys.bind(Object) as <V>(obj: {
  [key in keyof V]: unknown
}) => (keyof V)[]

export class IndexableMap<K, V> extends Map<K, V> {
  private _indexes = {} as {
    [indexedField in keyof V]: Map<V[keyof V], Set<K>>
  }
  private _indexFilters = {} as {
    [indexedField in keyof V]: (val: V) => boolean
  }
  private _indexesEnabled = true

  constructor(
    entries: readonly (readonly [K, V])[] = [],
    {
      indexes = [],
      indexesEnabled = true,
    }: {
      indexes?: { field: keyof V; filter: (val: V) => boolean }[]
      indexesEnabled?: boolean
    } = { indexes: [], indexesEnabled: true }
  ) {
    super(entries satisfies ConstructorParameters<MapConstructor>[0])
    for (const { field, filter } of indexes) {
      this._indexes[field] = new Map()
      this._indexFilters[field] = filter
    }
    if (indexesEnabled === false) {
      this._indexesEnabled = false
    }
    if (this._indexesEnabled) {
      this.refreshIndexes()
    }
  }

  getByIndex<K extends keyof V>(indexedField: K, value: V[K]) {
    const resp: V[] = []
    for (const key of this._indexes[indexedField]?.get(value) ?? new Set()) {
      resp.push(this.get(key)!)
    }
    return resp
  }

  refreshIndexes() {
    for (const [key, value] of this.entries()) {
      for (const indexedField of objKeys(this._indexes)) {
        if (this._indexFilters[indexedField]?.(value)) {
          this._indexes[indexedField].set(
            value[indexedField],
            (this._indexes[indexedField].get(value[indexedField]) ?? new Set()).add(key)
          )
        }
      }
    }
  }

  enableIndexes() {
    this._indexesEnabled = true
  }

  disableIndexes() {
    this._indexesEnabled = false
  }

  override set(key: K, value: V) {
    if (this._indexesEnabled) {
      const oldVal = this.get(key)
      for (const indexedField of objKeys(this._indexes)) {
        if (oldVal != null) {
          for (const k of this._indexes[indexedField].get(oldVal[indexedField]) ?? new Set()) {
            if (key === k) {
              this._indexes[indexedField].get(oldVal[indexedField])?.delete(k)
            }
          }
        }
        if (this._indexFilters[indexedField]?.(value)) {
          this._indexes[indexedField].set(
            value[indexedField],
            (this._indexes[indexedField].get(value[indexedField]) ?? new Set()).add(key)
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
        for (const indexedField of objKeys(this._indexes)) {
          for (const k of this._indexes[indexedField].get(oldVal[indexedField]) ?? new Set()) {
            if (key === k) {
              this._indexes[indexedField].get(oldVal[indexedField])?.delete(k)
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
