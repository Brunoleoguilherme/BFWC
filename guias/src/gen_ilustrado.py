# -*- coding: utf-8 -*-
"""Gera os guias ILUSTRADOS (PT/ES/EN) — BFWC 2026.

Uso:  python3 gen_ilustrado.py
Saída: ../Guia-Ilustrado-Inscricao-Times-BFWC2026-PT.pdf (etc.)

Screenshots: img/<lang>/*.png (1278×910, setas amarelas já desenhadas —
use arrow.py para anotar novas capturas).
"""
import os

from PIL import Image as PILImage
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Image, Table, TableStyle, KeepTogether,
                                Flowable)

from common import (SRC, OUT, NAVY, BLUE_STEP, YELLOW, SOFT_YELLOW, BROWN,
                    GRAY_CAP, GRAY_LINE, register_fonts, fix_chars)
from content_ilu import ILU

register_fonts()

PAGE_W, PAGE_H = A4
MARGIN = 45
CONTENT_W = PAGE_W - 2 * MARGIN

S = {
    'title': ParagraphStyle('title', fontName='Helvetica-Bold', fontSize=17,
                            leading=21, textColor=NAVY, alignment=1),
    'subtitle': ParagraphStyle('subtitle', fontName='Helvetica', fontSize=8.5,
                               leading=11.5, textColor=colors.HexColor('#555555'),
                               alignment=1),
    'box_t': ParagraphStyle('box_t', fontName='Helvetica-Bold', fontSize=9,
                            leading=12, textColor=colors.black),
    'box_b': ParagraphStyle('box_b', fontName='Helvetica', fontSize=8,
                            leading=11.5, textColor=colors.HexColor('#333333')),
    'howto': ParagraphStyle('howto', fontName='Helvetica', fontSize=8,
                            leading=11, textColor=BROWN),
    'parte': ParagraphStyle('parte', fontName='Helvetica-Bold', fontSize=11,
                            leading=14, textColor=colors.white),
    'step_h': ParagraphStyle('step_h', fontName='Helvetica-Bold', fontSize=10,
                             leading=13, textColor=BLUE_STEP, spaceBefore=4),
    'step_b': ParagraphStyle('step_b', fontName='Helvetica', fontSize=8.5,
                             leading=12, textColor=colors.HexColor('#222222'),
                             alignment=4),
    'cap': ParagraphStyle('cap', fontName='Helvetica', fontSize=7,
                          leading=9, textColor=GRAY_CAP, alignment=1),
    'date_d': ParagraphStyle('date_d', fontName='Helvetica-Bold', fontSize=9,
                             leading=12, textColor=NAVY),
    'date_l': ParagraphStyle('date_l', fontName='Helvetica', fontSize=8.5,
                             leading=12, textColor=colors.HexColor('#333333')),
    'check': ParagraphStyle('check', fontName='Helvetica', fontSize=8.5,
                            leading=12, textColor=colors.HexColor('#333333')),
    'ffoot': ParagraphStyle('ffoot', fontName='Helvetica', fontSize=7.5,
                            leading=10, textColor=GRAY_CAP, alignment=1),
}


class ParteBar(Flowable):
    def __init__(self, text):
        super().__init__()
        self.text = text
        self.width = CONTENT_W
        self.height = 22

    def draw(self):
        c = self.canv
        c.setFillColor(NAVY)
        c.rect(0, 0, self.width, self.height, stroke=0, fill=1)
        c.setFillColor(colors.white)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(10, 6.5, self.text)


class HowtoBox(Flowable):
    PAD = 7

    def __init__(self, text):
        super().__init__()
        self.width = CONTENT_W
        self.p = Paragraph(fix_chars(text), S['howto'])

    def wrap(self, aw, ah):
        _, h = self.p.wrap(self.width - 2 * self.PAD, ah)
        self.ph = h
        self.height = h + 2 * self.PAD
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.setFillColor(SOFT_YELLOW)
        c.rect(0, 0, self.width, self.height, stroke=0, fill=1)
        self.p.drawOn(c, self.PAD, self.PAD)


class DeadBox(Flowable):
    PAD = 9

    def __init__(self, title, body):
        super().__init__()
        self.width = CONTENT_W
        self.t = Paragraph(fix_chars(title), S['box_t'])
        self.b = Paragraph(fix_chars(body), S['box_b'])

    def wrap(self, aw, ah):
        tw = self.width - 2 * self.PAD
        _, h1 = self.t.wrap(tw, ah)
        _, h2 = self.b.wrap(tw, ah)
        self.hh = (h1, h2)
        self.height = h1 + 4 + h2 + 2 * self.PAD
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.setStrokeColor(colors.HexColor('#cccccc'))
        c.setFillColor(colors.white)
        c.rect(0, 0, self.width, self.height, stroke=1, fill=1)
        h1, h2 = self.hh
        y = self.height - self.PAD - h1
        self.t.drawOn(c, self.PAD, y)
        y -= (4 + h2)
        self.b.drawOn(c, self.PAD, y)


def shot(path, max_w=CONTENT_W * 0.88, max_h=250):
    """Imagem com borda fina, proporção preservada."""
    with PILImage.open(path) as im:
        w, h = im.size
    scale = min(max_w / w, max_h / h)
    img = Image(path, width=w * scale, height=h * scale)
    t = Table([[img]], colWidths=[w * scale])
    t.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor('#333333')),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    t.hAlign = 'CENTER'
    return t


def build(lang):
    d = ILU[lang]
    out = os.path.join(OUT, d['filename'])
    footer_tpl = d['footer']

    def on_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(YELLOW)                      # faixa amarela no topo
        canvas.rect(0, PAGE_H - 10, PAGE_W, 10, stroke=0, fill=1)
        canvas.setFont('Helvetica', 7)
        canvas.setFillColor(GRAY_CAP)
        canvas.drawCentredString(PAGE_W / 2, 20, footer_tpl.format(n=doc.page))
        canvas.restoreState()

    doc = BaseDocTemplate(out, pagesize=A4,
                          leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=32, bottomMargin=38)
    frame = Frame(MARGIN, 38, CONTENT_W, PAGE_H - 32 - 38, id='f')
    doc.addPageTemplates([PageTemplate(id='p', frames=[frame], onPage=on_page)])

    story = [Paragraph(fix_chars(d['title']), S['title']), Spacer(1, 4),
             Paragraph(fix_chars(d['subtitle']), S['subtitle']), Spacer(1, 12),
             DeadBox(d['deadlines_title'], d['deadlines_body']), Spacer(1, 8),
             HowtoBox(d['howto']), Spacer(1, 14)]

    if d.get('timeline'):
        story.append(ParteBar(d['timeline_title']))
        story.append(Spacer(1, 8))
        rows = [[Paragraph(fix_chars(n), S['date_d']),
                 Paragraph(fix_chars(e), S['box_t']),
                 Paragraph(fix_chars(p), S['box_b'])] for n, e, p in d['timeline']]
        tt = Table(rows, colWidths=[22, 220, CONTENT_W - 242])
        tt.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -2), 0.5, GRAY_LINE),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(tt)
        story.append(Spacer(1, 14))

    for part in d['parts']:
        story.append(ParteBar(part['title']))
        story.append(Spacer(1, 8))
        for st in part['steps']:
            block = [Paragraph(fix_chars(st['h']), S['step_h']), Spacer(1, 3),
                     Paragraph(fix_chars(st['b']), S['step_b'])]
            if st.get('img'):
                p = os.path.join(SRC, st['img'])
                block += [Spacer(1, 5), shot(p)]
                if st.get('cap'):
                    block += [Spacer(1, 3),
                              Paragraph(fix_chars(st['cap']), S['cap'])]
            story.append(KeepTogether(block))
            story.append(Spacer(1, 7))
        story.append(Spacer(1, 4))

    story.append(ParteBar(d['dates_title']))
    story.append(Spacer(1, 8))
    rows = [[Paragraph(fix_chars(dt), S['date_d']),
             Paragraph(fix_chars(lb), S['date_l'])] for dt, lb in d['dates']]
    t = Table(rows, colWidths=[60, CONTENT_W - 60])
    t.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, GRAY_LINE),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 14))

    story.append(ParteBar(d['checklist_title']))
    story.append(Spacer(1, 8))
    for item in d['checklist']:
        story.append(Paragraph(fix_chars('☐&nbsp;&nbsp;' + item), S['check']))
        story.append(Spacer(1, 5))
    story.append(Spacer(1, 12))
    story.append(Paragraph(fix_chars(d['final_footer']), S['ffoot']))

    doc.build(story)
    print('OK', out)


if __name__ == '__main__':
    for lang in ('pt', 'es', 'en'):
        build(lang)
