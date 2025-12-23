/**
 * External API Integration for License Keys
 * Fetches license keys from external supplier APIs
 */

interface ExternalAPIConfig {
  url: string
  apiKey: string
  method?: 'POST' | 'GET'
  headers?: Record<string, string>
}

interface FetchKeyParams {
  orderNumber: string
  customerEmail: string
  variantName: string
  productName: string
}

interface FetchKeyResult {
  success: boolean
  key?: string
  error?: string
}

// Product slug to API configuration mapping
const API_CONFIGS: Record<string, ExternalAPIConfig> = {
  'temp-spoofer': {
    url: process.env.TEMP_SPOOFER_API_URL || '',
    apiKey: process.env.TEMP_SPOOFER_API_KEY || '',
    method: 'POST',
  },
  'perm-spoofer': {
    url: process.env.PERM_SPOOFER_API_URL || '',
    apiKey: process.env.PERM_SPOOFER_API_KEY || '',
    method: 'POST',
  },
  'fortnite-public': {
    url: process.env.FORTNITE_PUBLIC_API_URL || '',
    apiKey: process.env.FORTNITE_PUBLIC_API_KEY || '',
    method: 'POST',
  },
  'fortnite-private': {
    url: process.env.FORTNITE_PRIVATE_API_URL || '',
    apiKey: process.env.FORTNITE_PRIVATE_API_KEY || '',
    method: 'POST',
  },
}

/**
 * Check if a product has an external API configured
 */
export function hasExternalAPI(productSlug: string): boolean {
  const config = API_CONFIGS[productSlug]
  return !!(config && config.url && config.apiKey)
}

/**
 * Fetch a license key from an external API
 */
export async function fetchExternalLicenseKey(
  productSlug: string,
  params: FetchKeyParams
): Promise<FetchKeyResult> {
  const config = API_CONFIGS[productSlug]

  if (!config || !config.url || !config.apiKey) {
    return {
      success: false,
      error: 'API not configured for this product',
    }
  }

  try {
    const requestBody = {
      product: productSlug,
      duration: params.variantName,
      email: params.customerEmail,
      orderId: params.orderNumber,
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      ...config.headers,
    }

    const response = await fetch(config.url, {
      method: config.method || 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}`,
      }
    }

    const data = await response.json()

    // Try to extract the key from various possible field names
    const key = data.key || data.license_key || data.licenseKey || data.code || data.license

    if (!key) {
      return {
        success: false,
        error: 'No license key found in API response',
      }
    }

    return {
      success: true,
      key: String(key),
    }
  } catch (error) {
    console.error('[External API] Error fetching license key:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
