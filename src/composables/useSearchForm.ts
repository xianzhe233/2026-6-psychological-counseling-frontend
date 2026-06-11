import { reactive, toRaw } from 'vue'

export interface SearchFormOptions<T extends Record<string, unknown>> {
  initial: T
  onSearch?: () => void | Promise<void>
  onReset?: () => void | Promise<void>
}

export function useSearchForm<T extends Record<string, unknown>>(options: SearchFormOptions<T>) {
  const initialSnapshot = structuredClone(toRaw(options.initial)) as T
  const form = reactive({ ...options.initial }) as T

  async function reset() {
    Object.keys(form).forEach((key) => {
      ;(form as Record<string, unknown>)[key] = structuredClone(
        (initialSnapshot as Record<string, unknown>)[key],
      )
    })
    if (options.onReset) {
      await options.onReset()
    }
  }

  async function search() {
    if (options.onSearch) {
      await options.onSearch()
    }
  }

  function patch(values: Partial<T>) {
    Object.assign(form, values)
  }

  function toQuery(): T {
    return { ...(form as T) }
  }

  return {
    form,
    initialSnapshot,
    reset,
    search,
    patch,
    toQuery,
  }
}
