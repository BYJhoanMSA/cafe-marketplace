import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

const isValid = (v: string | undefined) => v && v !== '' && !v.startsWith('tu-') && v !== 'poner-api-secret-aqui'
export const cloudinaryConfigured = !!(cloudName && apiKey && apiSecret && isValid(apiSecret))

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName!,
    api_key: apiKey!,
    api_secret: apiSecret!,
  })
}

export async function uploadToCloudinary(
  buffer: Buffer,
  publicId: string,
): Promise<{ url: string; width: number; height: number }> {
  if (!cloudinaryConfigured) {
    throw new Error('Cloudinary no configurado. Complete CLOUDINARY_API_SECRET en .env.production')
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Error subiendo a Cloudinary'))
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

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!cloudinaryConfigured) return

  await cloudinary.uploader.destroy(publicId)
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
