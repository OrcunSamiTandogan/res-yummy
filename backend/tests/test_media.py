from io import BytesIO

import pytest
from fastapi import HTTPException
from PIL import Image

from app.media import detect_raster, render_upload


def test_magic_bytes_reject_svg_and_fake_webp():
    assert detect_raster(b"<svg><script>alert(1)</script></svg>") is None
    assert detect_raster(b"RIFF1234FAKE") is None


def test_webp_render_is_decodable():
    src = BytesIO()
    Image.new("RGB", (40, 30), "red").save(src, format="PNG")
    result, width, height = render_upload(src.getvalue(), 10000)
    assert (width, height) == (40, 30)
    assert result[:4] == b"RIFF" and result[8:12] == b"WEBP"


def test_pixel_limit_rejected_before_decode():
    src = BytesIO()
    Image.new("RGB", (200, 200), "red").save(src, format="PNG")
    with pytest.raises(HTTPException) as exc:
        render_upload(src.getvalue(), 10000)
    assert exc.value.status_code == 422
