import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

export const cloudinaryConfigured = !!(
  cloudName &&
  apiKey &&
  apiSecret &&
  apiSecret !== 'pendiente' &&
  !apiSecret.startsWith('poner_aqui') &&
  !apiSecret.startsWith('tu_')
)

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName!,
    api_key: apiKey!,
    api_secret: apiSecret!,
  })
}

type CloudinaryUploadResult = { url: string; width?: number; height?: number }

async function cloudinaryUpload(
  buffer: Buffer,
  publicId: string,
  resourceType: 'image' | 'video',
): Promise<CloudinaryUploadResult> {
  if (!cloudinaryConfigured) {
    throw new Error('Cloudinary no configurado')
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error(`Error subiendo a Cloudinary: ${resourceType}`))
          return
        }
        resolve({
          url: result.secure_url,
          width: result.width,
          height: result.height,
        })
      },
    )

    stream.end(buffer)
  })
}

export async function uploadToCloudinary(
  buffer: Buffer,
  publicId: string,
): Promise<{ url: string; width: number; height: number }> {
  const result = await cloudinaryUpload(buffer, publicId, 'image')
  return { url: result.url, width: result.width ?? 0, height: result.height ?? 0 }
}

export async function uploadVideoToCloudinary(
  buffer: Buffer,
  publicId: string,
): Promise<{ url: string }> {
  const result = await cloudinaryUpload(buffer, publicId, 'video')
  return { url: result.url }
}

export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
  if (!cloudinaryConfigured) return

  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

export function getCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; fetchFormat?: boolean } = {},
): string {
  if (!cloudinaryConfigured) return ''

  const transformations: string[] = ['f_auto', 'q_auto']
  if (options.width) transformations.push(`w_${options.width}`)
  if (options.height) transformations.push(`h_${options.height}`)

  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
  })
}
