export interface WebMetadata {
  title: string
  description: string
  image: string
  url: string
  domain: string
}

export async function extractMetadata(url: string): Promise<WebMetadata | null> {
  try {
    const response = await fetch('/api/meta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      console.error('Failed to extract metadata:', response.statusText)
      return null
    }

    const metadata = await response.json()
    return metadata
  } catch (error) {
    console.error('Error extracting metadata:', error)
    return null
  }
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}