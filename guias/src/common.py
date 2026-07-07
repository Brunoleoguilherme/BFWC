# -*- coding: utf-8 -*-
"""Helpers compartilhados pelos geradores dos guias BFWC 2026."""
import os
import re

from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(SRC)  # pasta guias/

# Paleta
NAVY_DARK   = HexColor('#071a3a')  # header do guia texto
NAVY        = HexColor('#12306b')  # título/barras do guia ilustrado
BLUE        = HexColor('#0d4bff')  # barras/círculos do guia texto
BLUE_STEP   = HexColor('#1f4e79')  # títulos de passo do ilustrado
YELLOW      = HexColor('#ffd600')  # faixa amarela do ilustrado
SOFT_YELLOW = HexColor('#fff7cc')  # destaque "como usar"
BROWN       = HexColor('#7a5c00')  # texto do destaque
LIGHT_BLUE  = HexColor('#eff6ff')  # caixa prazos (guia texto)
BLUE_BORDER = HexColor('#bfdbfe')
GRAY_TEXT   = HexColor('#444444')
GRAY_CAP    = HexColor('#777777')
GRAY_LINE   = HexColor('#d8dde5')

def register_fonts():
    """Registra DejaVu para caracteres fora do WinAnsi (→ ✓ ✕ ☐ ✎ ⚠)."""
    base = '/usr/share/fonts/truetype/dejavu'
    pdfmetrics.registerFont(TTFont('DejaVuSans', os.path.join(base, 'DejaVuSans.ttf')))
    pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', os.path.join(base, 'DejaVuSans-Bold.ttf')))

_SPECIALS = re.compile(r'([→✓✕☐✎⚠■−])')

def fix_chars(txt):
    """Envolve caracteres não-WinAnsi em <font name="DejaVuSans"> p/ Helvetica."""
    return _SPECIALS.sub(r'<font name="DejaVuSans">\1</font>', txt)
