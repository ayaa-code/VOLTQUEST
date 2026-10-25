export async function verifiedImage(file: Blob) {
  if (!file.size || file.size > 6 * 1024 * 1024)
    throw new Error('Pilih gambar maksimal 6 MB.')
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const type =
    head[0] === 137 && head[1] === 80 && head[2] === 78 && head[3] === 71
      ? 'image/png'
      : head[0] === 255 && head[1] === 216 && head[2] === 255
        ? 'image/jpeg'
        : String.fromCharCode(...head.slice(0, 4)) === 'RIFF' &&
            String.fromCharCode(...head.slice(8, 12)) === 'WEBP'
          ? 'image/webp'
          : ''
  if (!type) throw new Error('Pilih gambar PNG, JPEG, atau WebP yang valid.')
  const blob = new Blob([file], { type })
  let width = 0,
    height = 0
  try {
    if (typeof createImageBitmap !== 'function')
      throw new Error('Use image decoder')
    const bitmap = await createImageBitmap(blob)
    width = bitmap.width
    height = bitmap.height
    bitmap.close()
  } catch {
    const url = URL.createObjectURL(blob)
    try {
      const image = new Image()
      const loaded = new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error('Gambar tidak dapat dibaca.'))
      })
      image.src = url
      await loaded
      width = image.naturalWidth
      height = image.naturalHeight
    } finally {
      URL.revokeObjectURL(url)
    }
  }
  if (!width || !height || width * height > 24_000_000)
    throw new Error('Gunakan gambar hingga 24 megapiksel.')
  return blob
}
export async function imageSignature(blob?: Blob) {
  if (!blob) return ''
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()),
    ),
    (b) => b.toString(16).padStart(2, '0'),
  ).join('')
}
