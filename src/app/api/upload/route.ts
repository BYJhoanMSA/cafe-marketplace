// src/app/api/upload/route.ts
// API endpoint para subir y optimizar imágenes de productos y página de inicio
// Optimiza con sharp antes de guardar en /public/uploads/

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import sharp from 'sharp'
import { auth } from '@/lib/auth'
import { unlink } from 'fs/promises'

// Configuraciones de optimización por tipo de imagen
const IMAGE_CONFIGS: Record<string, { width: number; height: number; quality: number }> = {
  product: { width: 1080, height: 1080, quality: 80 },   // Imágenes de producto (cuadradas)
  hero: { width: 1920, height: 1080, quality: 75 },       // Hero de página de inicio (16:9)
  thumbnail: { width: 400, height: 400, quality: 70 },    // Miniaturas
  feature: { width: 800, height: 600, quality: 75 },      // Tarjetas "Por qué elegirnos"
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'product'

    // Validar type contra valores permitidos (anti path traversal)
    const allowedTypes = ['product', 'hero', 'thumbnail', 'feature']
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipo de imagen no válido' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Use JPG, PNG o WebP.' }, { status: 400 })
    }

    // Validar tamaño máximo: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo es demasiado grande. Máximo 10MB.' }, { status: 400 })
    }

    // Leer el buffer del archivo
    const buffer = Buffer.from(await file.arrayBuffer())

    // Obtener configuración de optimización
    const config = IMAGE_CONFIGS[type] ?? IMAGE_CONFIGS.product
    if (!config) {
      return NextResponse.json({ error: 'Configuración de imagen no encontrada' }, { status: 500 })
    }

    // Optimizar con sharp: resize + convert to WebP
    const optimizedBuffer = await sharp(buffer)
      .resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: config.quality })
      .toBuffer()

    // Generar thumbnail (400px) para catálogo y cards
    const thumbBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 70 })
      .toBuffer()

    // Crear nombre único para el archivo
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const fileName = `${type}-${timestamp}-${randomSuffix}.webp`
    const thumbFileName = `${type}-${timestamp}-${randomSuffix}-thumb.webp`

    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads', type)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Guardar archivos
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, optimizedBuffer)
    const thumbPath = join(uploadDir, thumbFileName)
    await writeFile(thumbPath, thumbBuffer)

    // URLs públicas
    const url = `/uploads/${type}/${fileName}`
    const thumbUrl = `/uploads/${type}/${thumbFileName}`

    // Obtener dimensiones del archivo optimizado
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
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    // Validación estricta anti path traversal
    const normalized = url.replace(/\\/g, '/')
    if (!normalized.startsWith('/uploads/') || normalized.includes('..') || normalized.includes('~')) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    const filePath = join(process.cwd(), 'public', normalized)
    try {
      await unlink(filePath)
    } catch {
      // Si no existe, no es error crítico
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar la imagen' }, { status: 500 })
  }
}
