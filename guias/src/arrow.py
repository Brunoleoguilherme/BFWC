# -*- coding: utf-8 -*-
"""Desenha a seta amarela padrão dos guias sobre um screenshot.

Uso:
  python3 arrow.py entrada.png saida.png x_ponta y_ponta [angulo] [comprimento]

  x_ponta, y_ponta = pixel para onde a seta aponta (a ponta encosta aí)
  angulo  = de onde a seta vem, em graus (0 = da direita, 90 = de cima,
            180 = da esquerda, 270 = de baixo). Padrão: 45 (vem de cima/direita).
  comprimento = tamanho da seta em px. Padrão: 260.

Padrão visual: corpo amarelo #FFD600 com contorno escuro, ponta triangular —
igual às setas dos guias ilustrados.
"""
import math
import sys

from PIL import Image, ImageDraw

YELLOW = (255, 214, 0, 255)
OUTLINE = (140, 110, 0, 255)


def add_arrow(src, dst, tip_x, tip_y, angle_deg=45, length=260,
              width=26, head_len=64, head_w=64):
    im = Image.open(src).convert('RGBA')
    ov = Image.new('RGBA', im.size, (0, 0, 0, 0))
    dr = ImageDraw.Draw(ov)

    a = math.radians(angle_deg)
    dx, dy = math.cos(a), -math.sin(a)          # direção DE ONDE a seta vem
    tail = (tip_x + dx * length, tip_y + dy * length)
    tip = (tip_x, tip_y)
    # base da ponta
    bx, by = tip_x + dx * head_len, tip_y + dy * head_len
    # perpendicular
    px, py = -dy, dx

    def pt(x, y):
        return (x, y)

    # corpo (retângulo)
    hw = width / 2
    body = [pt(tail[0] + px * hw, tail[1] + py * hw),
            pt(tail[0] - px * hw, tail[1] - py * hw),
            pt(bx - px * hw, by - py * hw),
            pt(bx + px * hw, by + py * hw)]
    # ponta (triângulo)
    head = [pt(bx + px * head_w / 2, by + py * head_w / 2),
            pt(bx - px * head_w / 2, by - py * head_w / 2),
            tip]
    dr.polygon(body, fill=YELLOW, outline=OUTLINE)
    dr.polygon(head, fill=YELLOW, outline=OUTLINE)

    out = Image.alpha_composite(im, ov).convert('RGB')
    out.save(dst)
    print('OK', dst)


if __name__ == '__main__':
    if len(sys.argv) < 5:
        print(__doc__)
        sys.exit(1)
    src, dst = sys.argv[1], sys.argv[2]
    x, y = int(sys.argv[3]), int(sys.argv[4])
    ang = float(sys.argv[5]) if len(sys.argv) > 5 else 45
    ln = int(sys.argv[6]) if len(sys.argv) > 6 else 260
    add_arrow(src, dst, x, y, ang, ln)
