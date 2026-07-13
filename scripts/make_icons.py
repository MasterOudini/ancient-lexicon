"""Generate the app icons (public/icon-180.png, icon-192.png, icon-512.png).

Dark ink background with a simple two-stroke cuneiform-wedge motif:
a large horizontal wedge in limestone and a smaller vertical wedge in
faience. The motif stays inside the central ~72% of the canvas so the
512 px icon survives circular masking (it is declared purpose
"any maskable" in the manifest).

Run from the repo root:  python3 scripts/make_icons.py
Requires: pip install pillow
"""

from PIL import Image, ImageDraw

INK = (0x26, 0x20, 0x1A)        # #26201A
LIMESTONE = (0xEC, 0xE5, 0xD5)  # #ECE5D5
FAIENCE = (0x1F, 0x6F, 0x63)    # #1F6F63

MASTER = 1024
SIZES = (512, 192, 180)


def wedge(draw, head, tail, head_size, tail_width, color):
    """Draw one cuneiform-style wedge: a triangular head tapering to a tail.

    head: (x, y) of the head centre; tail: (x, y) of the tail tip.
    The head triangle points along the head->tail direction.
    """
    hx, hy = head
    tx, ty = tail
    # Direction unit vector head -> tail
    dx, dy = tx - hx, ty - hy
    length = (dx * dx + dy * dy) ** 0.5
    ux, uy = dx / length, dy / length
    # Perpendicular
    px, py = -uy, ux
    # Head triangle: broad base perpendicular to the stroke, apex slightly
    # behind the head centre so the head reads as a solid triangle.
    base1 = (hx + px * head_size, hy + py * head_size)
    base2 = (hx - px * head_size, hy - py * head_size)
    apex = (hx - ux * head_size * 1.1, hy - uy * head_size * 1.1)
    draw.polygon([base1, apex, base2], fill=color)
    # Tapering tail: quad from the head base edge to a narrow tip.
    tip1 = (tx + px * tail_width, ty + py * tail_width)
    tip2 = (tx - px * tail_width, ty - py * tail_width)
    draw.polygon([base1, tip1, tip2, base2], fill=color)


def main():
    img = Image.new("RGB", (MASTER, MASTER), INK)
    draw = ImageDraw.Draw(img)

    c = MASTER / 2
    # Large horizontal wedge in limestone, head left of centre, tail right.
    wedge(draw,
          head=(c - 190, c + 60),
          tail=(c + 300, c + 60),
          head_size=150, tail_width=26,
          color=LIMESTONE)
    # Smaller vertical wedge in faience, head above, tail down-left,
    # overlapping the horizontal stroke like a two-stroke sign.
    wedge(draw,
          head=(c + 40, c - 280),
          tail=(c - 60, c + 10),
          head_size=95, tail_width=20,
          color=FAIENCE)

    for size in SIZES:
        out = img.resize((size, size), Image.LANCZOS)
        path = f"public/icon-{size}.png"
        out.save(path, optimize=True)
        # Sanity: reopen and assert dimensions.
        check = Image.open(path)
        assert check.size == (size, size), path
        print(f"wrote {path} {check.size} {check.mode}")


if __name__ == "__main__":
    main()
