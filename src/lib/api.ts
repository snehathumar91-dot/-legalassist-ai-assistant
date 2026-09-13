/**
 * Safe fetch utility that prevents "Unexpected token '<', <!doctype..." crashes
 * when Cloud Run or reverse proxy returns HTML error pages or 502/504 timeouts.
 */
export async function safeFetchJson<T = any>(url: string, options: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (networkErr: any) {
    throw new Error(
      'Network connection failed. The dev server might be restarting. Please retry in a few seconds.'
    );
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned error (${response.status})`);
      } catch (parseErr: any) {
        throw new Error(parseErr.message || `Server returned error status ${response.status}`);
      }
    } else {
      const rawText = await response.text();
      if (
        rawText.includes('<!DOCTYPE') ||
        rawText.includes('<html') ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504
      ) {
        throw new Error(
          'The server is temporarily refreshing or warming up. No account is blocked. Please click Analyze again in 3-5 seconds.'
        );
      }
      throw new Error(`Server error (${response.status}): ${rawText.slice(0, 120)}`);
    }
  }

  if (!isJson) {
    const rawText = await response.text();
    if (rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
      throw new Error(
        'The server returned a temporary HTML response. Please refresh or retry in a moment.'
      );
    }
    try {
      return JSON.parse(rawText) as T;
    } catch {
      throw new Error('Received unexpected non-JSON response from server.');
    }
  }

  return await response.json();
}
