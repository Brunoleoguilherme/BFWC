# -*- coding: utf-8 -*-
"""Gera o guia de TEXTO dos ATLETAS (PT) reaproveitando o renderizador dos times."""
import gen_texto
import content_txt_atletas

# Reusa exatamente o mesmo layout/estilo do guia dos times, trocando só o conteúdo.
gen_texto.TXT = content_txt_atletas.TXT

if __name__ == '__main__':
    gen_texto.build('pt')
