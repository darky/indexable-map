import { MultiMap } from 'mnemonist'

export class IndexableMap<K, V> extends Map<K, V> {
  private _maps = {} as {
    [key in keyof V]: MultiMap<V[keyof V], { key: K; value: V }>
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
      this._maps[field] = new MultiMap()
      this._indexFilters[field] = filter
    })
    entries?.forEach(([key, value]) =>
      Object.keys(this._maps).forEach(
        mapKey =>
          this._indexFilters[mapKey as keyof V]?.(value) &&
          this._maps[mapKey as keyof V].set(value[mapKey as keyof V], { key, value })
      )
    )
  }

  getByIndex<K extends keyof V>(index: K, value: V[K]): V[] {
    return this._maps[index]?.get(value)?.map(({ value }) => value) ?? []
  }

  override set(key: K, value: V) {
    const oldVal = this.get(key)
    if (oldVal != null) {
      Object.keys(this._maps).forEach(mapKey => {
        this._maps[mapKey as keyof V].get(oldVal[mapKey as keyof V])?.forEach(item => {
          if (key === item.key) {
            this._maps[mapKey as keyof V].remove(oldVal[mapKey as keyof V], item)
          }
        })
        if (this._indexFilters[mapKey as keyof V]?.(value)) {
          this._maps[mapKey as keyof V].set(value[mapKey as keyof V], { key, value })
        }
      })
    }
    return super.set(key, value)
  }

  override delete(key: K): boolean {
    const oldVal = this.get(key)
    if (oldVal != null) {
      Object.keys(this._maps).forEach(mapKey => {
        this._maps[mapKey as keyof V].get(oldVal[mapKey as keyof V])?.forEach(item => {
          if (key === item.key) {
            this._maps[mapKey as keyof V].remove(oldVal[mapKey as keyof V], item)
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
