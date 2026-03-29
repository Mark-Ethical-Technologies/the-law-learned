/**
 * Lightweight HTML sanitizer that runs in pure Node.js (no JSDOM/browser APIs).
 * Used for FWC award HTML which comes from a trusted Australian government source.
 * Strips scripts, inline event handlers, javascript: links, and style blocks.
 */
export function sanitizeAwardHtml(html: string): string {
  return html
    // Remove <script> blocks entirely
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    // Remove <style> blocks
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    // Remove inline event handlers (onclick=, onmouseover=, etc.)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    // Replace javascript: hrefs
    .replace(/href\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, 'href="#"')
    // Remove <iframe>, <object>, <embed>, <form>
    .replace(/<\/?(iframe|object|embed|form|input|button|select|textarea)\b[^>]*>/gi, "")
    // Remove data: URIs from src/href
    .replace(/(src|href)\s*=\s*["']?data:[^"'\s>]*/gi, '$1="#"');
}
