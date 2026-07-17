# -*- coding: utf-8 -*-
"""Gera os guias ILUSTRADOS dos ATLETAS (PT/EN/ES) reaproveitando o renderizador dos times."""
import gen_ilustrado, content_ilu_atletas
gen_ilustrado.ILU = content_ilu_atletas.ILU
if __name__ == '__main__':
    for lang in ('pt', 'en', 'es'):
        gen_ilustrado.build(lang)
