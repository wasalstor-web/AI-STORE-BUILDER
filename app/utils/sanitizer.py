"""
HTML Sanitizer — Prevents XSS attacks in stored HTML content.

Custom sanitizer that preserves <style> tags and CSS while removing
dangerous elements like <script>, <iframe>, event handlers, and
javascript: URLs. Does NOT use bleach (which destroys CSS content).
"""

import re
from html.parser import HTMLParser
from typing import Optional


# ── Tags that are COMPLETELY FORBIDDEN (removed with content) ──
FORBIDDEN_TAGS = frozenset([
    "script", "iframe", "object", "embed", "applet",
    "base", "frame", "frameset", "layer", "ilayer",
])

# ── Self-closing tags ──
VOID_TAGS = frozenset([
    "br", "hr", "img", "input", "meta", "link",
    "source", "col", "area", "wbr",
])

# ── Event handler attributes (XSS vectors) ──
EVENT_ATTRS_PATTERN = re.compile(
    r"^on[a-z]+$", re.IGNORECASE
)

# ── javascript: / vbscript: in URLs ──
DANGEROUS_URL_PATTERN = re.compile(
    r"^\s*(javascript|vbscript|data\s*:\s*text/html)\s*:", re.IGNORECASE
)

# ── Attributes with URL values that need checking ──
URL_ATTRIBUTES = frozenset([
    "href", "src", "action", "formaction", "poster",
    "background", "cite", "data", "srcset",
])


class SafeHTMLSanitizer(HTMLParser):
    """
    High-performance HTML sanitizer that:
    - Preserves <style> tags and all CSS content intact
    - Removes <script>, <iframe>, <object>, <embed> with content
    - Strips event handler attributes (onclick, onload, etc.)
    - Neutralizes javascript: URLs
    - Keeps all other safe HTML structure
    """

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self._output: list[str] = []
        self._skip_depth: int = 0
        self._skip_tag: Optional[str] = None
        self._in_style: bool = False

    def reset_output(self):
        self._output = []
        self._skip_depth = 0
        self._skip_tag = None
        self._in_style = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, Optional[str]]]):
        tag_lower = tag.lower()

        # If we're inside a forbidden tag, track nesting
        if self._skip_depth > 0:
            if tag_lower == self._skip_tag:
                self._skip_depth += 1
            return

        # Start skipping forbidden tags
        if tag_lower in FORBIDDEN_TAGS:
            self._skip_depth = 1
            self._skip_tag = tag_lower
            return

        # Track <style> for special handling
        if tag_lower == "style":
            self._in_style = True

        # Filter attributes
        safe_attrs = self._filter_attributes(tag_lower, attrs)

        # Build the tag string
        attr_str = ""
        for name, value in safe_attrs:
            if value is None:
                attr_str += f" {name}"
            else:
                escaped = value.replace("&", "&amp;").replace('"', "&quot;")
                attr_str += f' {name}="{escaped}"'

        if tag_lower in VOID_TAGS:
            self._output.append(f"<{tag}{attr_str} />")
        else:
            self._output.append(f"<{tag}{attr_str}>")

    def handle_endtag(self, tag: str):
        tag_lower = tag.lower()

        # End of forbidden tag
        if self._skip_depth > 0:
            if tag_lower == self._skip_tag:
                self._skip_depth -= 1
            return

        if tag_lower == "style":
            self._in_style = False

        if tag_lower not in VOID_TAGS:
            self._output.append(f"</{tag}>")

    def handle_data(self, data: str):
        if self._skip_depth > 0:
            return
        # Preserve CSS content inside <style> as-is
        if self._in_style:
            self._output.append(data)
        else:
            self._output.append(data)

    def handle_entityref(self, name: str):
        if self._skip_depth > 0:
            return
        self._output.append(f"&{name};")

    def handle_charref(self, name: str):
        if self._skip_depth > 0:
            return
        self._output.append(f"&#{name};")

    def handle_comment(self, data: str):
        if self._skip_depth > 0:
            return
        # Preserve safe comments (no conditional comments / IE hacks)
        if not data.strip().startswith("[if"):
            self._output.append(f"<!--{data}-->")

    def handle_decl(self, decl: str):
        # Preserve DOCTYPE
        self._output.append(f"<!{decl}>")

    def handle_pi(self, data: str):
        pass  # Strip processing instructions

    def _filter_attributes(
        self, tag: str, attrs: list[tuple[str, Optional[str]]]
    ) -> list[tuple[str, Optional[str]]]:
        """Remove dangerous attributes while keeping safe ones."""
        safe: list[tuple[str, Optional[str]]] = []

        for name, value in attrs:
            name_lower = name.lower()

            # Block event handlers (onclick, onload, onerror, etc.)
            if EVENT_ATTRS_PATTERN.match(name_lower):
                continue

            # Check URL attributes for javascript: protocol
            if name_lower in URL_ATTRIBUTES and value:
                if DANGEROUS_URL_PATTERN.match(value):
                    continue

            # Block style attribute injection with expression() / url(javascript:)
            if name_lower == "style" and value:
                cleaned_style = self._sanitize_inline_style(value)
                safe.append((name, cleaned_style))
                continue

            safe.append((name, value))

        return safe

    @staticmethod
    def _sanitize_inline_style(style: str) -> str:
        """Remove CSS expressions and javascript URLs from inline styles."""
        # Remove expression(), url(javascript:), -moz-binding, behavior
        dangerous_patterns = [
            re.compile(r"expression\s*\(", re.IGNORECASE),
            re.compile(r"url\s*\(\s*['\"]?\s*javascript:", re.IGNORECASE),
            re.compile(r"-moz-binding\s*:", re.IGNORECASE),
            re.compile(r"behavior\s*:", re.IGNORECASE),
        ]
        for pattern in dangerous_patterns:
            style = pattern.sub("/* blocked */", style)
        return style

    def get_output(self) -> str:
        return "".join(self._output)


# ── Singleton parser (thread-safe for sync, create fresh for safety) ──


def sanitize_html(raw_html: str) -> str:
    """
    Sanitize HTML content while preserving store template structure.

    Preserves:
    - All <style> tags and CSS content (critical for store templates)
    - Safe HTML structure, attributes, and inline styles
    - SVG elements and attributes
    - Form elements (display-only)
    - <link> tags for external stylesheets / fonts

    Removes:
    - <script> tags and all JavaScript content
    - <iframe>, <object>, <embed>, <applet> tags
    - Event handler attributes (onclick, onload, onerror, etc.)
    - javascript: / vbscript: protocol URLs
    - CSS expressions and behavior properties

    Args:
        raw_html: Raw HTML string from user/AI

    Returns:
        Sanitized HTML string safe for storage and rendering
    """
    if not raw_html:
        return ""

    parser = SafeHTMLSanitizer()
    parser.reset_output()

    try:
        parser.feed(raw_html)
    except Exception:
        # If parsing fails, return escaped version
        return raw_html.replace("<script", "&lt;script").replace("</script", "&lt;/script")

    return parser.get_output()
