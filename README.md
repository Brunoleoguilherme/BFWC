# Brasil Flag World Championship 2026 - Site Premium

Site institucional premium, responsivo e trilíngue para o Mundial de Flag Football no Brasil.

## Inclui

- Identidade visual azul, verde e amarelo baseada no Brasil Flag World Championship.
- Seletor PT / EN / ES.
- Formulário de interesse de clubes para análise e aprovação.
- API `/api/club-interest` com gravação no Supabase.
- E-mail automático para o clube cadastrado.
- E-mail automático para o responsável do Mundial analisar/aprovar.
- Blue Panda Travel como agência oficial de viagens.
- API para leads de viagem.
- SQL completo do Supabase.
- Pronto para Vercel.

## Instalação

```bash
npm install
npm run dev
```

## Supabase

1. Abra o Supabase.
2. Vá em SQL Editor.
3. Rode o arquivo `supabase/schema.sql`.
4. Pegue a `service_role key` em Project Settings > API.
5. Configure o `.env.local`.

## .env.local

Copie `.env.example` para `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ptgebiynkuejmgxcqulb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_JlXV2-Rd69YtvwzjS6LBYg_j7Onfs9k
SUPABASE_SERVICE_ROLE_KEY=cole_a_service_role_key_aqui
RESEND_API_KEY=cole_a_chave_resend_aqui
MUNDIAL_ADMIN_EMAIL=inscricoes@seudominio.com
FROM_EMAIL=Brasil Flag World Championship <noreply@seudominio.com>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Deploy Vercel

```bash
npm run build
git add .
git commit -m "Site premium Brasil Flag World Championship"
git push origin main
```

Na Vercel, configure as mesmas variáveis do `.env.local`.

## Observação importante

Para os e-mails funcionarem com domínio próprio no Resend, configure e valide o domínio do remetente. Enquanto não validar, use o domínio de teste do Resend apenas para testes.
