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

  constructor(
    entries?: readonly (readonly [K, V])[] | null,
    indexes?: { field: keyof V; filter: (val: V) => boolean }[]
  ) {
    super(entries satisfies ConstructorParameters<MapConstructor>[0])
    for (const { field, filter } of indexes ?? []) {
      this._indexes[field] = new Map()
      this._indexFilters[field] = filter
    }
    for (const [key, value] of entries ?? []) {
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

  getByIndex<K extends keyof V>(indexedField: K, value: V[K]) {
    const resp: V[] = []
    for (const key of this._indexes[indexedField]?.get(value)?.values() ?? []) {
      resp.push(this.get(key)!)
    }
    return resp
  }

  override set(key: K, value: V) {
    const oldVal = this.get(key)
    if (oldVal != null) {
      for (const indexedField of objKeys(this._indexes)) {
        for (const k of this._indexes[indexedField].get(oldVal[indexedField]) ?? []) {
          if (key === k) {
            this._indexes[indexedField].get(oldVal[indexedField])?.delete(k)
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

  override delete(key: K): boolean {
    const oldVal = this.get(key)
    if (oldVal != null) {
      for (const indexedField of objKeys(this._indexes)) {
        for (const k of this._indexes[indexedField].get(oldVal[indexedField]) ?? []) {
          if (key === k) {
            this._indexes[indexedField].get(oldVal[indexedField])?.delete(k)
          }
        }
      }
    }
    return super.delete(key)
  }

  override clear(): void {
    for (const indexedField of objKeys(this._indexes)) {
      this._indexes[indexedField].clear()
    }
    return super.clear()
  }
}
