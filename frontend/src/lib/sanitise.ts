/**
 * Thin wrapper around DOMPurify for sanitising server-rendered HTML
 * before inserting it via dangerouslySetInnerHTML.
 */
import DOMPurify from 'dompurify'

/**
 * Sanitise an HTML string. Returns a safe string suitable for use with
 * dangerouslySetInnerHTML={{ __html: sanitise(html) }}.
 */
export function sanitise(html: string | null | undefined): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    // Allow safe formatting tags for rich-text content
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'figure', 'figcaption',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'style',
    ],
    // Force rel="noopener noreferrer" on all external links
    ADD_ATTR: ['target'],
    FORCE_BODY: true,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
  })
}

export function sanitiseLayout(html: string | null | undefined): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['video', 'source'],
    ADD_ATTR: ['autoplay', 'muted', 'loop', 'playsinline', 'controls', 'poster', 'target', 'data-block'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'style'],
    FORCE_BODY: true,
  })
}
