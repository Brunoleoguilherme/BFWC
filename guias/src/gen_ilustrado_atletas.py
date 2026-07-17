# -*- coding: utf-8 -*-
"""Gera o guia ILUSTRADO dos ATLETAS (PT) reaproveitando o renderizador dos times."""
import gen_ilustrado, content_ilu_atletas
gen_ilustrado.ILU = content_ilu_atletas.ILU
if __name__ == '__main__':
    gen_ilustrado.build('pt')
