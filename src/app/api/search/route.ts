import { apiResponse, apiError } from '@/lib/utils'
import { searchProducts } from '@/server/actions/search.actions'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || !q.trim()) {
      return apiError('Query parameter "q" is required', 400)
    }

    const results = await searchProducts(q)
    return apiResponse(results)
  } catch (error) {
    console.error('Search API error:', error)
    return apiError('Internal server error', 500)
  }
}
