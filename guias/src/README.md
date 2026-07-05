# Fonte dos Guias de Inscrição — BFWC 2026

Gera os 6 PDFs da pasta `guias/` (texto + ilustrado, em PT/ES/EN).

## Arquivos

- `content_txt.py` — conteúdo dos guias de texto (3 idiomas)
- `content_ilu.py` — conteúdo dos guias ilustrados (3 idiomas, com refs às imagens)
- `gen_texto.py` — gera os 3 guias de texto
- `gen_ilustrado.py` — gera os 3 guias ilustrados
- `arrow.py` — desenha a seta amarela padrão em um screenshot
- `common.py` — paleta de cores e helpers
- `img/<idioma>/` — screenshots (1278×910) já anotados com setas
- `img/logo-bfwc.png` — logo usado no cabeçalho do guia texto

## Regenerar os PDFs

```bash
cd guias/src
python3 gen_texto.py      # guias de texto
python3 gen_ilustrado.py  # guias ilustrados
```

Requisitos: Python 3 com `reportlab` e `Pillow`; fontes DejaVu em
`/usr/share/fonts/truetype/dejavu` (padrão no Linux).

## Adicionar uma nova imagem a um passo

1. Capture a tela em **1278×910** (mesma proporção das demais).
2. Anote com a seta amarela:
   ```bash
   python3 arrow.py captura.png img/pt/11-nome.png X_PONTA Y_PONTA [ANGULO] [COMPRIMENTO]
   ```
   - `X_PONTA/Y_PONTA`: pixel onde a ponta da seta encosta
   - `ANGULO`: de onde a seta vem (0 = direita, 90 = cima, 180 = esquerda, 270 = baixo); padrão 45
   - `COMPRIMENTO`: px, padrão 260
3. No `content_ilu.py`, adicione `'img': 'img/pt/11-nome.png'` e `'cap': 'Legenda.'`
   ao passo desejado (repita para `es`/`en` com as capturas localizadas).
4. Rode `python3 gen_ilustrado.py`.

## Histórico

- 04/07/2026 — Passo "Pagar com cartão" corrigido (cartão agora cobra por
  parcela, igual ao Pix — commit `ac66968` do site). Botões EN/ES alinhados
  com a UI ("Submit Lineup" / "Enviar Alineación").
