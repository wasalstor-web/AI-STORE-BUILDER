"""Quick tests for the new HTML sanitizer."""
from app.utils.sanitizer import sanitize_html

def test_preserve_style():
    html = '<html><head><style>body { color: red; background: #fafafa; } .card { box-shadow: 0 2px 8px rgba(0,0,0,.1); }</style></head><body><h1>Test</h1></body></html>'
    result = sanitize_html(html)
    assert '<style>' in result, f'FAIL: style tag stripped! Got: {result[:200]}'
    assert 'color: red' in result, f'FAIL: CSS content lost!'
    print('Test 1 PASS: Style tags preserved')

def test_remove_script():
    html = '<html><body><h1>Hi</h1><script>alert(1)</script><p>Safe</p></body></html>'
    result = sanitize_html(html)
    assert '<script>' not in result, f'FAIL: script not removed!'
    assert '<p>Safe</p>' in result, f'FAIL: safe content lost!'
    print('Test 2 PASS: Script tags removed')

def test_remove_event_handlers():
    html = '<div onclick="alert(1)" class="card">Content</div>'
    result = sanitize_html(html)
    assert 'onclick' not in result, f'FAIL: onclick not removed! Got: {result}'
    assert 'class="card"' in result, f'FAIL: class attr lost!'
    print('Test 3 PASS: Event handlers removed')

def test_block_javascript_urls():
    html = '<a href="javascript:alert(1)">Bad</a><a href="https://safe.com">Safe</a>'
    result = sanitize_html(html)
    assert 'javascript:' not in result, f'FAIL: javascript URL not removed!'
    assert 'https://safe.com' in result, f'FAIL: safe URL lost!'
    print('Test 4 PASS: javascript: URLs blocked')

def test_remove_iframe():
    html = '<div>Safe</div><iframe src="evil.com"></iframe><p>Also safe</p>'
    result = sanitize_html(html)
    assert '<iframe' not in result, f'FAIL: iframe not removed!'
    assert 'Safe' in result
    print('Test 5 PASS: iframe removed')

if __name__ == '__main__':
    test_preserve_style()
    test_remove_script()
    test_remove_event_handlers()
    test_block_javascript_urls()
    test_remove_iframe()
    print('\nALL SANITIZER TESTS PASSED!')
