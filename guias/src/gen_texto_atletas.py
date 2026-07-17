# -*- coding: utf-8 -*-
"""Gera os guias de TEXTO dos ATLETAS (PT/EN/ES) reaproveitando o renderizador dos times."""
import gen_texto, content_txt_atletas
gen_texto.TXT = content_txt_atletas.TXT
if __name__ == '__main__':
    for lang in ('pt', 'en', 'es'):
        gen_texto.build(lang)
