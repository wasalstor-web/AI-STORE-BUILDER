"""
HTML Sanitizer — Prevents XSS attacks in stored HTML content.
Uses bleach to whitelist safe HTML tags, attributes, and CSS properties.
"""

import bleach

# ── Allowed HTML tags for store templates ──
ALLOWED_TAGS = [
    # Structure
    "html",
    "head",
    "body",
    "div",
    "span",
    "section",
    "article",
    "aside",
    "header",
    "footer",
    "nav",
    "main",
    # Text
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "hr",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "small",
    "sub",
    "sup",
    "blockquote",
    "pre",
    "code",
    # Lists
    "ul",
    "ol",
    "li",
    "dl",
    "dt",
    "dd",
    # Links & Media
    "a",
    "img",
    "picture",
    "source",
    "figure",
    "figcaption",
    "video",
    "audio",
    # Tables
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "caption",
    "colgroup",
    "col",
    # Forms (display only)
    "form",
    "input",
    "button",
    "select",
    "option",
    "textarea",
    "label",
    "fieldset",
    "legend",
    # Inline styling
    "style",
    "link",
    # Meta
    "meta",
    "title",
    # SVG basics
    "svg",
    "path",
    "circle",
    "rect",
    "line",
    "polyline",
    "polygon",
    "g",
    "defs",
    "use",
    "text",
    "tspan",
]

# ── Allowed attributes ──
ALLOWED_ATTRIBUTES = {
    "*": [
        "class",
        "id",
        "style",
        "dir",
        "lang",
        "role",
        "aria-label",
        "aria-hidden",
        "data-*",
        "title",
    ],
    "a": ["href", "target", "rel"],
    "img": ["src", "alt", "width", "height", "loading"],
    "link": ["href", "rel", "type", "crossorigin"],
    "meta": ["charset", "name", "content", "http-equiv", "viewport"],
    "input": ["type", "placeholder", "value", "name", "disabled", "readonly"],
    "button": ["type", "disabled"],
    "form": ["action", "method"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan", "scope"],
    "source": ["src", "srcset", "type", "media"],
    "video": ["src", "controls", "autoplay", "muted", "loop", "poster"],
    "audio": ["src", "controls"],
    "svg": ["viewBox", "xmlns", "width", "height", "fill", "stroke"],
    "path": ["d", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"],
    "circle": ["cx", "cy", "r", "fill", "stroke"],
    "rect": ["x", "y", "width", "height", "rx", "ry", "fill"],
    "select": ["name", "disabled"],
    "option": ["value", "selected"],
    "textarea": ["name", "placeholder", "rows", "cols", "disabled", "readonly"],
    "col": ["span"],
    "colgroup": ["span"],
}

# ── Protocols allowed in href/src ──
ALLOWED_PROTOCOLS = ["http", "https", "mailto", "tel", "data"]


def sanitize_html(raw_html: str) -> str:
    """
    Sanitize HTML content while preserving store template structure.

    Allows safe HTML/CSS for store rendering while stripping:
    - <script> tags and JavaScript event handlers (onclick, onload, etc.)
    - <iframe>, <object>, <embed> tags
    - javascript: protocol URLs

    Args:
        raw_html: Raw HTML string from user/AI

    Returns:
        Sanitized HTML string safe for storage and rendering
    """
    if not raw_html:
        return ""

    # bleach.clean strips disallowed tags/attributes
    cleaned = bleach.clean(
        raw_html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True,  # Strip disallowed tags instead of escaping
    )

    return cleaned
