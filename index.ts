export class IndexableMap<K, V> extends Map<K, V> {
  private _maps = {} as {
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
      this._maps[field] = new Map()
      this._indexFilters[field] = filter
    })
    entries?.forEach(([key, value]) =>
      Object.keys(this._maps).forEach(mapKey => {
        if (this._indexFilters[mapKey as keyof V]?.(value)) {
          this._maps[mapKey as keyof V].set(
            value[mapKey as keyof V],
            (this._maps[mapKey as keyof V].get(value[mapKey as keyof V]) ?? new Set()).add(key)
          )
        }
      })
    )
  }

  getByIndex<K extends keyof V>(index: K, value: V[K]): V[] {
    return Array.from(this._maps[index]?.get(value)?.values() ?? []).flatMap(key => this.get(key) ?? [])
  }

  override set(key: K, value: V) {
    const oldVal = this.get(key)
    if (oldVal != null) {
      Object.keys(this._maps).forEach(mapKey => {
        this._maps[mapKey as keyof V].get(oldVal[mapKey as keyof V])?.forEach(k => {
          if (key === k) {
            this._maps[mapKey as keyof V].get(oldVal[mapKey as keyof V])?.delete(k)
          }
        })
        if (this._indexFilters[mapKey as keyof V]?.(value)) {
          this._maps[mapKey as keyof V].set(
            value[mapKey as keyof V],
            (this._maps[mapKey as keyof V].get(value[mapKey as keyof V]) ?? new Set()).add(key)
          )
        }
      })
    }
    return super.set(key, value)
  }

  override delete(key: K): boolean {
    const oldVal = this.get(key)
    if (oldVal != null) {
      Object.keys(this._maps).forEach(mapKey => {
        this._maps[mapKey as keyof V].get(oldVal[mapKey as keyof V])?.forEach(k => {
          if (key === k) {
            this._maps[mapKey as keyof V].get(oldVal[mapKey as keyof V])?.delete(k)
          }
        })
      })
    }
    return super.delete(key)
  }

  override clear(): void {
    Object.keys(this._maps).forEach(mapKey => {
      this._maps[mapKey as keyof V].clear()
    })
    return super.clear()
  }
}
