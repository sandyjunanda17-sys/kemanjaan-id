"""Extract and crop authentic Kemanjaan.id brand & store assets from captured screenshots."""

from pathlib import Path
from PIL import Image

SCREENSHOT_DIR = Path(
    r"C:\Users\Sandy\.gemini\antigravity\brain\f7789f5c-5a3c-4c36-a01e-a4452e95fb11\browser_sandbox\screenshots"
)
OUTPUT_DIR = Path(r"c:\Users\Sandy\Downloads\client kemanjaan\assets")

CROPS = [
    ("step_70.png", (344, 108, 446, 208), "logo-kemanjaan.png", None),
    ("step_26.png", (14, 75, 95, 156), "logo-kedai.png", None),
    ("step_4.png", (8, 70, 410, 248), "storefront-gmaps.jpg", "JPEG"),
    ("step_20.png", (76, 366, 136, 426), "toner-kemanjaan.jpg", "JPEG"),
    ("step_20.png", (6, 366, 66, 426), "pricelist-highlight.jpg", "JPEG"),
    ("step_34.png", (481, 253, 719, 566), "gallery-wall-of-beauty.jpg", "JPEG"),
    ("step_34.png", (240, 253, 478, 566), "gallery-bags-accessories.jpg", "JPEG"),
    ("step_34.png", (0, 253, 238, 566), "gallery-beauty-talk.jpg", "JPEG"),
    ("step_36.png", (0, 60, 238, 268), "gallery-team-pink.jpg", "JPEG"),
    ("step_34.png", (481, 60, 719, 250), "gallery-skincare-shelf.jpg", "JPEG"),
    ("step_36.png", (481, 270, 719, 566), "gallery-store-interior.jpg", "JPEG"),
]


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for src_name, box, dst_name, fmt in CROPS:
        src_path = SCREENSHOT_DIR / src_name
        if not src_path.exists():
            raise FileNotFoundError(f"Missing screenshot: {src_path}")
        with Image.open(src_path) as img:
            cropped = img.crop(box)
            dst_path = OUTPUT_DIR / dst_name
            if fmt == "JPEG":
                cropped.convert("RGB").save(dst_path, format="JPEG", quality=92)
            else:
                cropped.save(dst_path)
            print(f"Saved {dst_path.name}: {cropped.size} ({dst_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
