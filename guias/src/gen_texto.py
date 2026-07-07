# -*- coding: utf-8 -*-
"""Gera os guias de TEXTO (PT/ES/EN) — BFWC 2026.

Uso:  python3 gen_texto.py
Saída: ../Guia-de-Inscricao-dos-Times-BFWC2026-PT.pdf (etc.)
"""
import os

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Table, TableStyle, Flowable, KeepTogether)

from common import (SRC, OUT, NAVY_DARK, BLUE, LIGHT_BLUE, BLUE_BORDER,
                    GRAY_TEXT, GRAY_LINE, register_fonts, fix_chars)
from content_txt import TXT

register_fonts()

PAGE_W, PAGE_H = A4
MARGIN = 40

S = {
    'hdr_title': ParagraphStyle('hdr_title', fontName='Helvetica-Bold', fontSize=19,
                                leading=23, textColor=colors.white),
    'hdr_sub': ParagraphStyle('hdr_sub', fontName='Helvetica', fontSize=8.5,
                              leading=11.5, textColor=colors.HexColor('#b8c4d8')),
    'box_title': ParagraphStyle('box_title', fontName='Helvetica-Bold', fontSize=9,
                                leading=12, textColor=BLUE),
    'box_body': ParagraphStyle('box_body', fontName='Helvetica', fontSize=8,
                               leading=11, textColor=colors.HexColor('#333333')),
    'parte': ParagraphStyle('parte', fontName='Helvetica-Bold', fontSize=11,
                            leading=14, textColor=colors.white),
    'step_h': ParagraphStyle('step_h', fontName='Helvetica-Bold', fontSize=9.5,
                             leading=12, textColor=colors.HexColor('#111111')),
    'step_b': ParagraphStyle('step_b', fontName='Helvetica', fontSize=8,
                             leading=11.5, textColor=GRAY_TEXT),
    'tbl_k': ParagraphStyle('tbl_k', fontName='Helvetica-Bold', fontSize=8,
                            leading=10, textColor=colors.HexColor('#222222')),
    'tbl_v': ParagraphStyle('tbl_v', fontName='Helvetica', fontSize=8,
                            leading=10, textColor=colors.HexColor('#5e6471')),
    'date_d': ParagraphStyle('date_d', fontName='Helvetica-Bold', fontSize=9,
                             leading=12, textColor=BLUE),
    'date_l': ParagraphStyle('date_l', fontName='Helvetica', fontSize=8.5,
                             leading=12, textColor=GRAY_TEXT),
    'check': ParagraphStyle('check', fontName='Helvetica', fontSize=8.5,
                            leading=12, textColor=GRAY_TEXT),
}


class Header(Flowable):
    def __init__(self, title, subtitle, logo):
        super().__init__()
        self.title, self.subtitle, self.logo = title, subtitle, logo
        self.width = PAGE_W - 2 * MARGIN
        self.height = 72

    def draw(self):
        c = self.canv
        c.setFillColor(NAVY_DARK)
        c.roundRect(0, 0, self.width, self.height, 8, stroke=0, fill=1)
        if os.path.exists(self.logo):
            c.drawImage(self.logo, 14, (self.height - 48) / 2, 48, 48,
                        mask='auto', preserveAspectRatio=True)
        tx = 76
        c.setFillColor(colors.white)
        c.setFont('Helvetica-Bold', 19)
        c.drawString(tx, self.height - 28, self.title)
        c.setFillColor(colors.HexColor('#b8c4d8'))
        c.setFont('Helvetica', 8.5)
        words, lines, cur = self.subtitle.split(), [], ''
        for w in words:
            t = (cur + ' ' + w).strip()
            if c.stringWidth(t, 'Helvetica', 8.5) > self.width - tx - 14:
                lines.append(cur); cur = w
            else:
                cur = t
        lines.append(cur)
        y = self.height - 44
        for ln in lines[:2]:
            c.drawString(tx, y, ln); y -= 11.5


class ParteBar(Flowable):
    def __init__(self, text):
        super().__init__()
        self.text = text
        self.width = PAGE_W - 2 * MARGIN
        self.height = 22

    def draw(self):
        c = self.canv
        c.setFillColor(BLUE)
        c.roundRect(0, 0, self.width, self.height, 6, stroke=0, fill=1)
        c.setFillColor(colors.white)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(12, 6.5, self.text)


class Step(Flowable):
    """Círculo numerado + título + corpo (+ tabela opcional)."""
    CIRCLE = 16
    GAP = 10

    def __init__(self, num, head, body, table=None, after=None):
        super().__init__()
        self.num = num
        self.width = PAGE_W - 2 * MARGIN
        tw = self.width - self.CIRCLE - self.GAP
        self.head = Paragraph(fix_chars(head), S['step_h'])
        self.body = Paragraph(fix_chars(body), S['step_b'])
        self.tbl = None
        self.after = Paragraph(fix_chars(after), S['step_b']) if after else None
        if table:
            rows = [[Paragraph(fix_chars(k), S['tbl_k']),
                     Paragraph(fix_chars(v), S['tbl_v'])] for k, v in table]
            self.tbl = Table(rows, colWidths=[150, tw - 150])
            self.tbl.setStyle(TableStyle([
                ('GRID', (0, 0), (-1, -1), 0.5, GRAY_LINE),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
        self._tw = tw

    def wrap(self, aw, ah):
        tw = self._tw
        _, self.h_h = self.head.wrap(tw, ah)
        _, self.h_b = self.body.wrap(tw, ah)
        self.h_t = 0
        if self.tbl:
            _, self.h_t = self.tbl.wrap(tw, ah)
            self.h_t += 6
        self.h_a = 0
        if self.after:
            _, self.h_a = self.after.wrap(tw, ah)
            self.h_a += 4
        self.height = max(self.h_h + 2 + self.h_b + self.h_t + self.h_a, self.CIRCLE)
        return self.width, self.height

    def draw(self):
        c = self.canv
        r = self.CIRCLE / 2
        cy = self.height - r
        c.setFillColor(BLUE)
        c.circle(r, cy, r, stroke=0, fill=1)
        c.setFillColor(colors.white)
        c.setFont('Helvetica-Bold', 9)
        c.drawCentredString(r, cy - 3.2, str(self.num))
        x = self.CIRCLE + self.GAP
        y = self.height - self.h_h
        self.head.drawOn(c, x, y)
        y -= (2 + self.h_b)
        self.body.drawOn(c, x, y)
        if self.tbl:
            y -= self.h_t
            self.tbl.drawOn(c, x, y + 6 - 6)
        if self.after:
            y -= self.h_a
            self.after.drawOn(c, x, y)


class Box(Flowable):
    """Caixa dos prazos (fundo azul claro)."""
    PAD = 10

    def __init__(self, title, body, contact):
        super().__init__()
        self.width = PAGE_W - 2 * MARGIN
        tw = self.width - 2 * self.PAD
        self.t = Paragraph(fix_chars(title), S['box_title'])
        self.b = Paragraph(fix_chars(body), S['box_body'])
        self.k = Paragraph(fix_chars(contact), S['box_body'])
        self._tw = tw

    def wrap(self, aw, ah):
        _, h1 = self.t.wrap(self._tw, ah)
        _, h2 = self.b.wrap(self._tw, ah)
        _, h3 = self.k.wrap(self._tw, ah)
        self.hh = (h1, h2, h3)
        self.height = h1 + 4 + h2 + 6 + h3 + 2 * self.PAD
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.setFillColor(LIGHT_BLUE)
        c.setStrokeColor(BLUE_BORDER)
        c.roundRect(0, 0, self.width, self.height, 8, stroke=1, fill=1)
        h1, h2, h3 = self.hh
        y = self.height - self.PAD - h1
        self.t.drawOn(c, self.PAD, y)
        y -= (4 + h2)
        self.b.drawOn(c, self.PAD, y)
        y -= (6 + h3)
        self.k.drawOn(c, self.PAD, y)


def build(lang):
    d = TXT[lang]
    out = os.path.join(OUT, d['filename'])
    footer_text = d['footer']

    def on_page(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 6.5)
        canvas.setFillColor(colors.HexColor('#9aa2b1'))
        canvas.drawString(MARGIN, 22, footer_text)
        canvas.drawRightString(PAGE_W - MARGIN, 22, str(doc.page))
        canvas.restoreState()

    doc = BaseDocTemplate(out, pagesize=A4,
                          leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=MARGIN, bottomMargin=42)
    frame = Frame(MARGIN, 42, PAGE_W - 2 * MARGIN, PAGE_H - MARGIN - 42, id='f')
    doc.addPageTemplates([PageTemplate(id='p', frames=[frame], onPage=on_page)])

    logo = os.path.join(SRC, 'img', 'logo-bfwc.png')
    story = [Header(d['title'], d['subtitle'], logo), Spacer(1, 14),
             Box(d['deadlines_title'], d['deadlines_body'], d['contact']),
             Spacer(1, 16)]

    if d.get('timeline'):
        story.append(ParteBar(d['timeline_title']))
        story.append(Spacer(1, 10))
        rows = [[Paragraph(fix_chars(n), S['date_d']),
                 Paragraph(fix_chars(e), S['step_h']),
                 Paragraph(fix_chars(p), S['tbl_v'])] for n, e, p in d['timeline']]
        tt = Table(rows, colWidths=[22, 225, PAGE_W - 2 * MARGIN - 247])
        tt.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -2), 0.5, GRAY_LINE),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(tt)
        story.append(Spacer(1, 16))

    for part in d['parts']:
        story.append(ParteBar(part['title']))
        story.append(Spacer(1, 10))
        for i, st in enumerate(part['steps'], 1):
            fl = Step(i, st['h'], st['b'], st.get('table'), st.get('after'))
            story.append(KeepTogether(fl))
            story.append(Spacer(1, 9))
        story.append(Spacer(1, 6))

    story.append(ParteBar(d['dates_title']))
    story.append(Spacer(1, 10))
    rows = [[Paragraph(fix_chars(dt), S['date_d']),
             Paragraph(fix_chars(lb), S['date_l'])] for dt, lb in d['dates']]
    t = Table(rows, colWidths=[60, PAGE_W - 2 * MARGIN - 60])
    t.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, GRAY_LINE),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 16))

    story.append(ParteBar(d['checklist_title']))
    story.append(Spacer(1, 10))
    for item in d['checklist']:
        story.append(Paragraph(fix_chars('☐&nbsp;&nbsp;' + item), S['check']))
        story.append(Spacer(1, 5))

    doc.build(story)
    print('OK', out)


if __name__ == '__main__':
    for lang in ('pt', 'es', 'en'):
        build(lang)
