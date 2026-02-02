import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
    }

    const hostname = parsed.hostname.toLowerCase();

    // Basic SSRF protections: block localhost/loopback and private IP ranges
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.local')
    ) {
      return NextResponse.json({ error: 'Forbidden host' }, { status: 403 });
    }

    const ipv4Regex = /^\d+\.\d+\.\d+\.\d+$/;
    if (ipv4Regex.test(hostname)) {
      const parts = hostname.split('.').map(p => parseInt(p, 10));
      if (
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        (parts[0] === 169 && parts[1] === 254)
      ) {
        return NextResponse.json({ error: 'Forbidden host' }, { status: 403 });
      }
    }

    // Perform fetch with browser-like headers to improve chance of getting the real content
    const res = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AlagaLink/1.0)', 'Accept': 'image/*,text/html;q=0.8' } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch remote image', status: res.status }, { status: 502 });
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();

    // If the remote returned HTML (facebook login page, or a page that contains og:image), try to extract og:image
    if (contentType.startsWith('text/html')) {
      try {
        const text = await res.text();
        // look for og:image or twitter:image
        const ogMatch = text.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i)
                       || text.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i)
                       || text.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["'][^>]*>/i);
        const found = ogMatch ? ogMatch[1] : null;
        if (found) {
          // Resolve relative URLs
          const imageUrl = new URL(found, url).toString();
          const imgRes = await fetch(imageUrl, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AlagaLink/1.0)' } });
          if (imgRes.ok && (imgRes.headers.get('content-type') || '').startsWith('image/')) {
            const headers = new Headers();
            headers.set('Content-Type', imgRes.headers.get('content-type') || 'image/*');
            headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
            return new NextResponse(imgRes.body, { headers });
          }
        }
      } catch (err) {
        console.warn('Proxy: failed to parse HTML for og:image', err);
      }

      return NextResponse.json({ error: 'URL returned a non-image HTML response and no og:image was found' }, { status: 400 });
    }

    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL does not point to an image' }, { status: 400 });
    }

    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

    // Stream the response body back to the client
    return new NextResponse(res.body, { headers });
  } catch (err) {
    console.error('Image proxy error:', err);
    return NextResponse.json({ error: 'Internal proxy error' }, { status: 500 });
  }
}
