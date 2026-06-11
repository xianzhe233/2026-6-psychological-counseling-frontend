import type { AxiosResponse } from 'axios'

function parseFileName(contentDisposition: string, fallbackName: string) {
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i)
  return plainMatch?.[1] ?? fallbackName
}

export async function saveBlobResponse(response: AxiosResponse<Blob>, fallbackName: string) {
  const contentType = response.headers['content-type'] ?? response.data.type ?? ''
  const blob = response.data

  if (contentType.includes('application/json') || blob.type.includes('json')) {
    const text = await blob.text()
    try {
      const error = JSON.parse(text) as { message?: string }
      throw new Error(error.message || '下载失败')
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('下载失败，请确认已登录且后端服务正常')
      }
      throw error
    }
  }

  const bytes = new Uint8Array(await blob.arrayBuffer())
  const isZipDocx = bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4B
  if (!isZipDocx) {
    throw new Error('下载的文件不是有效的 Word 文档')
  }

  const fileName = parseFileName(response.headers['content-disposition'] ?? '', fallbackName)
  const url = URL.createObjectURL(new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
