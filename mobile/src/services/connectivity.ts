const CONNECTIVITY_CHECK_URL = 'https://www.google.com/generate_204'

export async function checkNetworkConnectivity(timeoutMs = 4500): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const response = await fetch(CONNECTIVITY_CHECK_URL, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return response.ok
  } catch {
    return false
  }
}
