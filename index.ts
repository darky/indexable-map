const objKeys = Object.keys.bind(Object) as <V>(obj: {
  [key in keyof V]: unknown
}) => (keyof V)[]

export class IndexableMap<K, V> extends Map<K, V> {
  private _indexes = {} as {
    [key in keyof V]: Map<V[keyof V], Set<K>>
  }
  private _indexFilters = {} as {
    [key in keyof V]: (val: V) => boolean
  }

  constructor(
    entries?: readonly (readonly [K, V])[] | null,
    indexes?: { field: keyof V; filter: (val: V) => boolean }[]
  ) {
    super(entries satisfies ConstructorParameters<MapConstructor>[0])
    ;(indexes ?? []).forEach(({ field, filter }) => {
      this._indexes[field] = new Map()
      this._indexFilters[field] = filter
    })
    entries?.forEach(([key, value]) =>
      objKeys(this._indexes).forEach(index => {
        if (this._indexFilters[index]?.(value)) {
          this._indexes[index].set(value[index], (this._indexes[index].get(value[index]) ?? new Set()).add(key))
        }
      })
    )
  }

  getByIndex<K extends keyof V>(index: K, value: V[K]): V[] {
    return Array.from(this._indexes[index]?.get(value)?.values() ?? []).flatMap(key => this.get(key) ?? [])
  }

  override set(key: K, value: V) {
    const oldVal = this.get(key)
    if (oldVal != null) {
      objKeys(this._indexes).forEach(index => {
        this._indexes[index].get(oldVal[index])?.forEach(k => {
          if (key === k) {
            this._indexes[index].get(oldVal[index])?.delete(k)
          }
        })
        if (this._indexFilters[index]?.(value)) {
          this._indexes[index].set(value[index], (this._indexes[index].get(value[index]) ?? new Set()).add(key))
        }
      })
    }
    return super.set(key, value)
  }

  override delete(key: K): boolean {
    const oldVal = this.get(key)
    if (oldVal != null) {
      objKeys(this._indexes).forEach(index => {
        this._indexes[index].get(oldVal[index])?.forEach(k => {
          if (key === k) {
            this._indexes[index].get(oldVal[index])?.delete(k)
          }
        })
      })
    }
    return super.delete(key)
  }

  override clear(): void {
    objKeys(this._indexes).forEach(index => {
      this._indexes[index].clear()
    })
    return super.clear()
  }
}
