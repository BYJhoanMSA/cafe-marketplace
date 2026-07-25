import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'
import { auth } from '@/lib/auth'

const IMAGE_CONFIGS: Record<string, { width: number; height: number; quality: number }> = {
  product: { width: 1080, height: 1080, quality: 80 },
  hero: { width: 1920, height: 1080, quality: 75 },
  thumbnail: { width: 400, height: 400, quality: 70 },
  feature: { width: 800, height: 600, quality: 75 },
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'product'

    const allowedTypes = ['product', 'hero', 'thumbnail', 'feature']
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipo de imagen no valido' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No se envio ningun archivo' }, { status: 400 })
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Use JPG, PNG o WebP.' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo es demasiado grande. Maximo 10MB.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const config = (IMAGE_CONFIGS[type] ?? IMAGE_CONFIGS.product)!

    const optimizedBuffer = await sharp(buffer)
      .resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: config.quality })
      .toBuffer()

    const thumbBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 70 })
      .toBuffer()

    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const fileName = `${type}-${timestamp}-${randomSuffix}.webp`
    const thumbFileName = `${type}-${timestamp}-${randomSuffix}-thumb.webp`

    const uploadDir = join(process.cwd(), 'public', 'uploads', type)
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, fileName), optimizedBuffer)
    await writeFile(join(uploadDir, thumbFileName), thumbBuffer)

    const url = `/uploads/${type}/${fileName}`
    const thumbUrl = `/uploads/${type}/${thumbFileName}`

    const metadata = await sharp(optimizedBuffer).metadata()

    return NextResponse.json({
      success: true,
      url,
      thumbUrl,
      width: metadata.width,
      height: metadata.height,
      size: optimizedBuffer.length,
      originalSize: buffer.length,
      savings: Math.round((1 - optimizedBuffer.length / buffer.length) * 100),
    })
  } catch (error: any) {
    console.error('[UPLOAD] Error:', error)
    return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL invalida' }, { status: 400 })
    }

    const normalized = url.replace(/\\/g, '/')
    if (!normalized.startsWith('/uploads/') || normalized.includes('..') || normalized.includes('~')) {
      return NextResponse.json({ error: 'URL invalida' }, { status: 400 })
    }

    const filePath = join(process.cwd(), 'public', normalized)
    try { await unlink(filePath) } catch {}
    const thumbPath = filePath.replace('.webp', '-thumb.webp')
    try { await unlink(thumbPath) } catch {}

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[UPLOAD DELETE] Error:', error)
    return NextResponse.json({ error: 'Error al eliminar la imagen' }, { status: 500 })
  }
}
