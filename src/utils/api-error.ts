interface ConflictItem {
  reason?: string
  date?: string
  slotId?: number
}

interface ApiErrorBody {
  message?: string
  code?: number
  data?: {
    conflicts?: ConflictItem[]
  }
}

interface ApiErrorLike {
  message?: string
  response?: {
    data?: ApiErrorBody
  }
}

/** 从 Axios / http 拦截器错误中提取可读消息，支持 409 冲突详情 */
export function extractApiErrorMessage(error: unknown, fallback = '请求失败'): string {
  const err = error as ApiErrorLike
  const body = err.response?.data
  const conflicts = body?.data?.conflicts

  if (conflicts?.length) {
    const reasons = conflicts
      .map(item => item.reason)
      .filter((reason): reason is string => Boolean(reason))
    if (reasons.length) {
      return reasons.join('；')
    }
  }

  return body?.message || err.message || fallback
}
