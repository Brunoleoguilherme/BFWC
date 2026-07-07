# -*- coding: utf-8 -*-
# Atualiza os preços nos conteúdos dos guias: 3x de R$ 667 / 3x de R$ 267 + 20 atletas inclusos.
# Rodar DEPOIS de restaurar os arquivos do git (git checkout -- guias/src/content_*.py)
import io, os, sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))

subs = [
    ("Cada categoria tem seus próprios botões: <b>Opção 1 · Pacote</b> — R$ 2.000, atletas inclusos — ou <b>Opção 2 · Por atleta</b> — R$ 800 + R$ 90 por atleta.",
     "Cada categoria tem seus próprios botões: <b>Opção 1 · Pacote</b> — 3x de R$ 667, 20 atletas inclusos — ou <b>Opção 2 · Por atleta</b> — 3x de R$ 267 + R$ 90 por atleta."),
    ("Cada categoría tiene sus propios botones: <b>Opción 1 · Paquete</b> — R$ 2.000, atletas incluidos — u <b>Opción 2 · Por atleta</b> — R$ 800 + R$ 90 por atleta.",
     "Cada categoría tiene sus propios botones: <b>Opción 1 · Paquete</b> — 3x de R$ 667, 20 atletas incluidos — u <b>Opción 2 · Por atleta</b> — 3x de R$ 267 + R$ 90 por atleta."),
    ("Each category has its own buttons: <b>Option 1 · Package</b> — R$ 2,000, athletes included — or <b>Option 2 · Per athlete</b> — R$ 800 + R$ 90 per athlete.",
     "Each category has its own buttons: <b>Option 1 · Package</b> — 3x R$ 667, 20 athletes included — or <b>Option 2 · Per athlete</b> — 3x R$ 267 + R$ 90 per athlete."),
]

ok = True
for f in ['content_txt.py', 'content_ilu.py']:
    with io.open(f, encoding='utf-8') as fh:
        src = fh.read()
    n = 0
    for old, new in subs:
        if old in src:
            src = src.replace(old, new)
            n += 1
    with io.open(f, 'w', encoding='utf-8') as fh:
        fh.write(src)
    print(f'{f}: {n}/3 substituições')
    if n != 3:
        ok = False

print('✅ Tudo certo — agora rode: python gen_texto.py && python gen_ilustrado.py' if ok
      else '⚠️ Alguma substituição não bateu — confira se restaurou os arquivos do git antes.')
