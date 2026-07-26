import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  uploadVideoToCloudinary,
  deleteFromCloudinary,
  cloudinaryConfigured,
  cloudinaryDebugInfo,
} from '@/lib/cloudinary'

const MAX_VIDEO_SIZE = 50 * 1024 * 1024
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
]

function generatePublicId(): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `cafe/video/${timestamp}-${randomSuffix}`
}

export async function POST(req: NextRequest) {
  try {
    if (!cloudinaryConfigured) {
      return NextResponse.json(
        {
          error: 'Cloudinary no configurado. Se requiere para videos.',
          debug: cloudinaryDebugInfo,
        },
        { status: 500 },
      )
    }

    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se envio ningun archivo' }, { status: 400 })
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato de video no soportado. Use MP4, WebM o MOV.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: 'El video es demasiado grande. Maximo 50MB.' },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const publicId = generatePublicId()

    const { url } = await uploadVideoToCloudinary(buffer, publicId)

    return NextResponse.json({ success: true, url })
  } catch (error: any) {
    console.error('[VIDEO UPLOAD] Error:', error)
    return NextResponse.json({ error: 'Error al subir el video' }, { status: 500 })
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

    const publicIdMatch = url.match(/\/cafe\/video\/(.+?)\./)
    if (publicIdMatch) {
      await deleteFromCloudinary(`cafe/video/${publicIdMatch[1]}`, 'video')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[VIDEO DELETE] Error:', error)
    return NextResponse.json({ error: 'Error al eliminar el video' }, { status: 500 })
  }
}
