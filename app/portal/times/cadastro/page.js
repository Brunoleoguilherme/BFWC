'use client';

import { useState, useEffect, useRef } from 'react';
import '../../../admin/admin.css';

const CATEGORIES = [
  { value: 'Masculino',  label: 'Masculino' },
  { value: 'Feminino',   label: 'Feminino' },
  { value: 'Sub-15',     label: 'Sub-15' },
  { value: 'Sub-12',     label: 'Sub-12' },
];

// Rótulos de exibição das categorias por idioma (o value salvo não muda)
const CATEGORY_LABELS = {
  pt: { 'Masculino': 'Masculino', 'Feminino': 'Feminino', 'Sub-15': 'Sub-15', 'Sub-12': 'Sub-12' },
  en: { 'Masculino': "Men's",     'Feminino': "Women's",  'Sub-15': 'U-15',   'Sub-12': 'U-12' },
  es: { 'Masculino': 'Masculino', 'Feminino': 'Femenino', 'Sub-15': 'Sub-15', 'Sub-12': 'Sub-12' },
};

const COUNTRIES = [
  'Brasil',
  'Afeganistão', 'África do Sul', 'Albânia', 'Alemanha', 'Andorra', 'Angola', 'Antígua e Barbuda', 'Arábia Saudita', 'Argélia', 'Argentina', 'Armênia', 'Austrália', 'Áustria', 'Azerbaijão',
  'Bahamas', 'Bangladesh', 'Barbados', 'Barein', 'Bélgica', 'Belize', 'Benin', 'Bielorrússia', 'Bolívia', 'Bósnia e Herzegovina', 'Botsuana', 'Brunei', 'Bulgária', 'Burquina Faso', 'Burundi', 'Butão',
  'Cabo Verde', 'Camarões', 'Camboja', 'Canadá', 'Catar', 'Cazaquistão', 'Chade', 'Chile', 'China', 'Chipre', 'Cingapura', 'Colômbia', 'Comores', 'Congo', 'Coreia do Norte', 'Coreia do Sul', 'Costa do Marfim', 'Costa Rica', 'Croácia', 'Cuba',
  'Dinamarca', 'Djibuti', 'Dominica',
  'Egito', 'El Salvador', 'Emirados Árabes Unidos', 'Equador', 'Eritreia', 'Eslováquia', 'Eslovênia', 'Espanha', 'Estados Unidos', 'Estônia', 'Eswatini', 'Etiópia',
  'Fiji', 'Filipinas', 'Finlândia', 'França',
  'Gabão', 'Gâmbia', 'Gana', 'Geórgia', 'Granada', 'Grécia', 'Guatemala', 'Guiana', 'Guiné', 'Guiné Equatorial', 'Guiné-Bissau',
  'Haiti', 'Holanda', 'Honduras', 'Hungria',
  'Iêmen', 'Ilhas Marshall', 'Ilhas Salomão', 'Índia', 'Indonésia', 'Irã', 'Iraque', 'Irlanda', 'Islândia', 'Israel', 'Itália',
  'Jamaica', 'Japão', 'Jordânia',
  'Kiribati', 'Kuwait',
  'Laos', 'Lesoto', 'Letônia', 'Líbano', 'Libéria', 'Líbia', 'Liechtenstein', 'Lituânia', 'Luxemburgo',
  'Macedônia do Norte', 'Madagascar', 'Malásia', 'Malaui', 'Maldivas', 'Mali', 'Malta', 'Marrocos', 'Maurício', 'Mauritânia', 'México', 'Mianmar', 'Micronésia', 'Moçambique', 'Moldávia', 'Mônaco', 'Mongólia', 'Montenegro',
  'Namíbia', 'Nauru', 'Nepal', 'Nicarágua', 'Níger', 'Nigéria', 'Noruega', 'Nova Zelândia',
  'Omã',
  'Palau', 'Panamá', 'Papua-Nova Guiné', 'Paquistão', 'Paraguai', 'Peru', 'Polônia', 'Portugal',
  'Quênia', 'Quirguistão',
  'Reino Unido', 'República Centro-Africana', 'República Dominicana', 'República Tcheca', 'Romênia', 'Ruanda', 'Rússia',
  'Samoa', 'San Marino', 'Santa Lúcia', 'São Cristóvão e Névis', 'São Tomé e Príncipe', 'São Vicente e Granadinas', 'Seicheles', 'Senegal', 'Serra Leoa', 'Sérvia', 'Síria', 'Somália', 'Sri Lanka', 'Sudão', 'Sudão do Sul', 'Suécia', 'Suíça', 'Suriname',
  'Tailândia', 'Taiwan', 'Tajiquistão', 'Tanzânia', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad e Tobago', 'Tunísia', 'Turcomenistão', 'Turquia', 'Tuvalu',
  'Ucrânia', 'Uganda', 'Uruguai', 'Uzbequistão',
  'Vanuatu', 'Vaticano', 'Venezuela', 'Vietnã',
  'Zâmbia', 'Zimbábue',
  'Outro',
];

// Nome de exibição dos países em EN/ES: [en, es].
// O value salvo continua sendo o nome em PT; países ausentes usam o nome PT.
const COUNTRY_NAMES = {
  'Afeganistão': ['Afghanistan', 'Afganistán'],
  'África do Sul': ['South Africa', 'Sudáfrica'],
  'Albânia': ['Albania', 'Albania'],
  'Alemanha': ['Germany', 'Alemania'],
  'Antígua e Barbuda': ['Antigua and Barbuda', 'Antigua y Barbuda'],
  'Arábia Saudita': ['Saudi Arabia', 'Arabia Saudita'],
  'Argélia': ['Algeria', 'Argelia'],
  'Armênia': ['Armenia', 'Armenia'],
  'Austrália': ['Australia', 'Australia'],
  'Áustria': ['Austria', 'Austria'],
  'Azerbaijão': ['Azerbaijan', 'Azerbaiyán'],
  'Bangladesh': ['Bangladesh', 'Bangladés'],
  'Barein': ['Bahrain', 'Baréin'],
  'Bélgica': ['Belgium', 'Bélgica'],
  'Benin': ['Benin', 'Benín'],
  'Bielorrússia': ['Belarus', 'Bielorrusia'],
  'Bolívia': ['Bolivia', 'Bolivia'],
  'Bósnia e Herzegovina': ['Bosnia and Herzegovina', 'Bosnia y Herzegovina'],
  'Botsuana': ['Botswana', 'Botsuana'],
  'Brasil': ['Brazil', 'Brasil'],
  'Bulgária': ['Bulgaria', 'Bulgaria'],
  'Burquina Faso': ['Burkina Faso', 'Burkina Faso'],
  'Butão': ['Bhutan', 'Bután'],
  'Cabo Verde': ['Cape Verde', 'Cabo Verde'],
  'Camarões': ['Cameroon', 'Camerún'],
  'Camboja': ['Cambodia', 'Camboya'],
  'Canadá': ['Canada', 'Canadá'],
  'Catar': ['Qatar', 'Catar'],
  'Cazaquistão': ['Kazakhstan', 'Kazajistán'],
  'Chade': ['Chad', 'Chad'],
  'Chipre': ['Cyprus', 'Chipre'],
  'Cingapura': ['Singapore', 'Singapur'],
  'Colômbia': ['Colombia', 'Colombia'],
  'Comores': ['Comoros', 'Comoras'],
  'Coreia do Norte': ['North Korea', 'Corea del Norte'],
  'Coreia do Sul': ['South Korea', 'Corea del Sur'],
  'Costa do Marfim': ['Ivory Coast', 'Costa de Marfil'],
  'Croácia': ['Croatia', 'Croacia'],
  'Dinamarca': ['Denmark', 'Dinamarca'],
  'Djibuti': ['Djibouti', 'Yibuti'],
  'Egito': ['Egypt', 'Egipto'],
  'Emirados Árabes Unidos': ['United Arab Emirates', 'Emiratos Árabes Unidos'],
  'Equador': ['Ecuador', 'Ecuador'],
  'Eritreia': ['Eritrea', 'Eritrea'],
  'Eslováquia': ['Slovakia', 'Eslovaquia'],
  'Eslovênia': ['Slovenia', 'Eslovenia'],
  'Espanha': ['Spain', 'España'],
  'Estados Unidos': ['United States', 'Estados Unidos'],
  'Estônia': ['Estonia', 'Estonia'],
  'Etiópia': ['Ethiopia', 'Etiopía'],
  'Fiji': ['Fiji', 'Fiyi'],
  'Filipinas': ['Philippines', 'Filipinas'],
  'Finlândia': ['Finland', 'Finlandia'],
  'França': ['France', 'Francia'],
  'Gabão': ['Gabon', 'Gabón'],
  'Gâmbia': ['Gambia', 'Gambia'],
  'Gana': ['Ghana', 'Ghana'],
  'Geórgia': ['Georgia', 'Georgia'],
  'Granada': ['Grenada', 'Granada'],
  'Grécia': ['Greece', 'Grecia'],
  'Guiana': ['Guyana', 'Guyana'],
  'Guiné': ['Guinea', 'Guinea'],
  'Guiné Equatorial': ['Equatorial Guinea', 'Guinea Ecuatorial'],
  'Guiné-Bissau': ['Guinea-Bissau', 'Guinea-Bisáu'],
  'Haiti': ['Haiti', 'Haití'],
  'Holanda': ['Netherlands', 'Países Bajos'],
  'Hungria': ['Hungary', 'Hungría'],
  'Iêmen': ['Yemen', 'Yemen'],
  'Ilhas Marshall': ['Marshall Islands', 'Islas Marshall'],
  'Ilhas Salomão': ['Solomon Islands', 'Islas Salomón'],
  'Índia': ['India', 'India'],
  'Indonésia': ['Indonesia', 'Indonesia'],
  'Irã': ['Iran', 'Irán'],
  'Iraque': ['Iraq', 'Irak'],
  'Irlanda': ['Ireland', 'Irlanda'],
  'Islândia': ['Iceland', 'Islandia'],
  'Itália': ['Italy', 'Italia'],
  'Japão': ['Japan', 'Japón'],
  'Jordânia': ['Jordan', 'Jordania'],
  'Lesoto': ['Lesotho', 'Lesoto'],
  'Letônia': ['Latvia', 'Letonia'],
  'Líbano': ['Lebanon', 'Líbano'],
  'Libéria': ['Liberia', 'Liberia'],
  'Líbia': ['Libya', 'Libia'],
  'Lituânia': ['Lithuania', 'Lituania'],
  'Luxemburgo': ['Luxembourg', 'Luxemburgo'],
  'Macedônia do Norte': ['North Macedonia', 'Macedonia del Norte'],
  'Malásia': ['Malaysia', 'Malasia'],
  'Malaui': ['Malawi', 'Malaui'],
  'Maldivas': ['Maldives', 'Maldivas'],
  'Mali': ['Mali', 'Malí'],
  'Marrocos': ['Morocco', 'Marruecos'],
  'Maurício': ['Mauritius', 'Mauricio'],
  'Mauritânia': ['Mauritania', 'Mauritania'],
  'México': ['Mexico', 'México'],
  'Mianmar': ['Myanmar', 'Myanmar'],
  'Micronésia': ['Micronesia', 'Micronesia'],
  'Moçambique': ['Mozambique', 'Mozambique'],
  'Moldávia': ['Moldova', 'Moldavia'],
  'Mônaco': ['Monaco', 'Mónaco'],
  'Mongólia': ['Mongolia', 'Mongolia'],
  'Namíbia': ['Namibia', 'Namibia'],
  'Nicarágua': ['Nicaragua', 'Nicaragua'],
  'Níger': ['Niger', 'Níger'],
  'Nigéria': ['Nigeria', 'Nigeria'],
  'Noruega': ['Norway', 'Noruega'],
  'Nova Zelândia': ['New Zealand', 'Nueva Zelanda'],
  'Omã': ['Oman', 'Omán'],
  'Palau': ['Palau', 'Palaos'],
  'Panamá': ['Panama', 'Panamá'],
  'Papua-Nova Guiné': ['Papua New Guinea', 'Papúa Nueva Guinea'],
  'Paquistão': ['Pakistan', 'Pakistán'],
  'Paraguai': ['Paraguay', 'Paraguay'],
  'Peru': ['Peru', 'Perú'],
  'Polônia': ['Poland', 'Polonia'],
  'Quênia': ['Kenya', 'Kenia'],
  'Quirguistão': ['Kyrgyzstan', 'Kirguistán'],
  'Reino Unido': ['United Kingdom', 'Reino Unido'],
  'República Centro-Africana': ['Central African Republic', 'República Centroafricana'],
  'República Dominicana': ['Dominican Republic', 'República Dominicana'],
  'República Tcheca': ['Czech Republic', 'República Checa'],
  'Romênia': ['Romania', 'Rumania'],
  'Ruanda': ['Rwanda', 'Ruanda'],
  'Rússia': ['Russia', 'Rusia'],
  'Santa Lúcia': ['Saint Lucia', 'Santa Lucía'],
  'São Cristóvão e Névis': ['Saint Kitts and Nevis', 'San Cristóbal y Nieves'],
  'São Tomé e Príncipe': ['São Tomé and Príncipe', 'Santo Tomé y Príncipe'],
  'São Vicente e Granadinas': ['Saint Vincent and the Grenadines', 'San Vicente y las Granadinas'],
  'Seicheles': ['Seychelles', 'Seychelles'],
  'Serra Leoa': ['Sierra Leone', 'Sierra Leona'],
  'Sérvia': ['Serbia', 'Serbia'],
  'Síria': ['Syria', 'Siria'],
  'Somália': ['Somalia', 'Somalia'],
  'Sudão': ['Sudan', 'Sudán'],
  'Sudão do Sul': ['South Sudan', 'Sudán del Sur'],
  'Suécia': ['Sweden', 'Suecia'],
  'Suíça': ['Switzerland', 'Suiza'],
  'Suriname': ['Suriname', 'Surinam'],
  'Tailândia': ['Thailand', 'Tailandia'],
  'Taiwan': ['Taiwan', 'Taiwán'],
  'Tajiquistão': ['Tajikistan', 'Tayikistán'],
  'Tanzânia': ['Tanzania', 'Tanzania'],
  'Timor-Leste': ['Timor-Leste', 'Timor Oriental'],
  'Trinidad e Tobago': ['Trinidad and Tobago', 'Trinidad y Tobago'],
  'Tunísia': ['Tunisia', 'Túnez'],
  'Turcomenistão': ['Turkmenistan', 'Turkmenistán'],
  'Turquia': ['Turkey', 'Turquía'],
  'Ucrânia': ['Ukraine', 'Ucrania'],
  'Uruguai': ['Uruguay', 'Uruguay'],
  'Uzbequistão': ['Uzbekistan', 'Uzbekistán'],
  'Vaticano': ['Vatican City', 'Ciudad del Vaticano'],
  'Vietnã': ['Vietnam', 'Vietnam'],
  'Zâmbia': ['Zambia', 'Zambia'],
  'Zimbábue': ['Zimbabwe', 'Zimbabue'],
  'Outro': ['Other', 'Otro'],
};

const TERMS_PT = `TERMO DE INSCRIÇÃO E PARTICIPAÇÃO — BRASIL FLAG WORLD CHAMPIONSHIP 2026

1. PARTES E OBJETO
Estes Termos regulam a inscrição e a participação do clube/equipe identificado neste cadastro ("CLUBE") no Brasil Flag World Championship 2026 ("EVENTO"), a realizar-se em Leme/SP, Brasil, em 31/10/2026, organizado por BRASIL SPORTS BUSINESS, CNPJ 27.517.868/0001-10 ("ORGANIZAÇÃO"). O aceite eletrônico destes Termos pelo responsável indicado no cadastro constitui contrato válido entre as partes (art. 425 do Código Civil), dispensando assinatura física.

2. CADASTRO E APROVAÇÃO
2.1. As informações fornecidas devem ser verdadeiras, completas e atualizadas; o responsável declara ter poderes para representar o CLUBE.
2.2. O cadastro está sujeito à análise e aprovação pela ORGANIZAÇÃO e não garante vaga.
2.3. A vaga em cada categoria somente é reservada com a confirmação do pagamento da 1ª parcela, respeitada a ordem cronológica de pagamento e o limite de vagas por categoria.

3. VALORES E PAGAMENTO
3.1. A taxa de inscrição é definida por categoria, à escolha do CLUBE no portal: Opção 1 (Pacote) — R$ 2.000,00 por categoria, atletas inclusos; ou Opção 2 (Por atleta) — R$ 800,00 por categoria + R$ 90,00 por atleta (mínimo 12, máximo 20 por categoria). O total é a soma das categorias inscritas.
3.2. O pagamento pode ser parcelado em até 3 parcelas, com vencimentos em 20/07/2026, 20/08/2026 e 20/09/2026, via Pix ou cartão de crédito. Inscrições posteriores seguem o parcelamento remanescente.
3.3. A escolha da opção fica vinculada após o pagamento da 1ª parcela.
3.4. A participação está condicionada à quitação integral até 20/09/2026.

4. CANCELAMENTO, DESISTÊNCIA E REEMBOLSO
4.1. As parcelas pagas NÃO são reembolsáveis, em nenhuma hipótese de desistência, ausência (no-show), desclassificação disciplinar ou não quitação das parcelas seguintes.
4.2. Em caso de não quitação até o vencimento final, a ORGANIZAÇÃO poderá cancelar a inscrição e liberar a vaga, permanecendo não reembolsáveis os valores pagos.
4.3. Se o EVENTO for cancelado sem remarcação, os valores pagos serão devolvidos integralmente em até 30 dias. Em caso de adiamento ou alteração de data/local por força maior (clima, determinação do poder público, segurança), as inscrições permanecem válidas para a nova data, sem direito a reembolso pela alteração.
4.4. A vaga é intransferível sem anuência escrita da ORGANIZAÇÃO.

5. ROSTER, ELEGIBILIDADE E ESCALAÇÃO
5.1. Cada categoria exige roster de no mínimo 12 e no máximo 20 atletas, além de até 7 membros de comissão técnica/staff, cadastrados no portal nos prazos divulgados.
5.2. Limites de idade: Sub-15 — nascidos a partir de 2011; Sub-12 — nascidos a partir de 2014; demais categorias conforme Regulamento Oficial.
5.3. O CLUBE responde pela elegibilidade, documentação e veracidade dos dados de seus atletas e staff. Atleta inelegível ou dados falsos sujeitam o CLUBE às sanções do Regulamento, inclusive desclassificação, sem reembolso.
5.4. Atletas menores de 18 anos somente participarão mediante autorização assinada pelo responsável legal (participação, uso de imagem e tratamento de dados), enviada no portal. Sem a autorização, o atleta não será credenciado.

6. SAÚDE, SEGURO E RESPONSABILIDADE
6.1. O CLUBE declara que seus atletas estão aptos à prática esportiva, responsabilizando-se pela verificação das condições de saúde (recomenda-se avaliação médica prévia).
6.2. A ORGANIZAÇÃO disponibilizará atendimento médico de emergência no local do EVENTO. Tratamentos posteriores, exames, internações e despesas correlatas são de responsabilidade do CLUBE/atleta.
6.3. O CLUBE e seus atletas assumem os riscos inerentes à prática do flag football. A ORGANIZAÇÃO não responde por danos decorrentes desses riscos inerentes, respondendo apenas por danos causados por dolo ou culpa comprovada de sua parte, na forma da lei.
6.4. A ORGANIZAÇÃO não se responsabiliza por objetos pessoais, deslocamento, hospedagem e alimentação das delegações, salvo quando expressamente contratados por meio dela.

7. IMAGEM E MARCA
O CLUBE autoriza, sem ônus e por prazo indeterminado, o uso de seu nome, escudo, uniforme e da imagem coletiva de sua delegação em fotos, vídeos, transmissões e materiais promocionais do EVENTO e de suas edições, no Brasil e no exterior. O uso da marca BFWC pelo CLUBE depende de autorização escrita.

8. CONDUTA E DISCIPLINA
O CLUBE, seus atletas, staff e torcida vinculada comprometem-se com o fair play e com o Regulamento Oficial (parte integrante destes Termos, disponível no site e sujeito a atualizações divulgadas no portal). Infrações sujeitam o CLUBE a advertência, suspensão, desclassificação e/ou responsabilização civil, sem reembolso. Atletas estão sujeitos a controle antidoping.

9. PROTEÇÃO DE DADOS (LGPD)
9.1. Os dados do CLUBE, atletas e staff serão tratados pela ORGANIZAÇÃO para: gestão de inscrições e pagamentos, credenciamento, organização esportiva (tabelas, súmulas, resultados), comunicações do EVENTO e cumprimento de obrigações legais.
9.2. Poderão ser compartilhados com operadores estritamente necessários: processadores de pagamento, plataforma de hospedagem do site, parceiro oficial de viagens (quando solicitado pelo CLUBE) e autoridades, quando exigido por lei.
9.3. Dados de menores são tratados com o consentimento específico do responsável legal (cláusula 5.4).
9.4. Solicitações de titulares (acesso, correção, exclusão): contato@brasilflag.com.

10. DISPOSIÇÕES GERAIS
10.1. Comunicações oficiais serão feitas pelo e-mail cadastrado no portal e consideram-se recebidas na data do envio.
10.2. A ORGANIZAÇÃO pode ajustar formato de competição, tabela e horários por necessidade técnica, sem direito a reembolso por isso.
10.3. O registro eletrônico do aceite (data, hora, IP e versão dos Termos) constitui prova da contratação.
10.4. Fica eleito o foro da Comarca de Leme/SP, com renúncia a qualquer outro.`;

const TERMS_EN = `REGISTRATION AND PARTICIPATION AGREEMENT — BRASIL FLAG WORLD CHAMPIONSHIP 2026

1. PARTIES AND PURPOSE
These Terms govern the registration and participation of the club/team identified in this form ("CLUB") in the Brasil Flag World Championship 2026 ("EVENT"), to be held in Leme/SP, Brazil, on Oct 31, 2026, organized by BRASIL SPORTS BUSINESS, Brazilian company ID (CNPJ) 27.517.868/0001-10 ("ORGANIZER"). Electronic acceptance of these Terms by the person responsible for the registration constitutes a valid contract between the parties under Brazilian law (Civil Code, art. 425), no physical signature required.

2. REGISTRATION AND APPROVAL
2.1. All information provided must be true, complete and up to date; the responsible person declares having powers to represent the CLUB.
2.2. Registration is subject to review and approval by the ORGANIZER and does not guarantee a spot.
2.3. A spot in each category is only reserved upon confirmation of the 1st installment payment, following the chronological order of payment and the limit of spots per category.

3. FEES AND PAYMENT
3.1. The registration fee is set per category, at the CLUB's choice in the portal: Option 1 (Package) — R$ 2,000.00 per category, athletes included; or Option 2 (Per athlete) — R$ 800.00 per category + R$ 90.00 per athlete (minimum 12, maximum 20 per category). The total is the sum of the registered categories.
3.2. Payment may be split into up to 3 installments, due Jul 20, Aug 20 and Sep 20, 2026, via Pix or credit card. Later registrations follow the remaining schedule.
3.3. The chosen option is locked after payment of the 1st installment.
3.4. Participation is conditioned on full payment by Sep 20, 2026.

4. CANCELLATION, WITHDRAWAL AND REFUNDS
4.1. Paid installments are NON-REFUNDABLE in any case of withdrawal, no-show, disciplinary disqualification or failure to pay the remaining installments.
4.2. If payment is not completed by the final due date, the ORGANIZER may cancel the registration and release the spot; amounts paid remain non-refundable.
4.3. If the EVENT is cancelled without rescheduling, amounts paid will be fully refunded within 30 days. In case of postponement or change of date/venue due to force majeure (weather, public authority order, safety), registrations remain valid for the new date, with no refund due to the change.
4.4. Spots are non-transferable without the ORGANIZER's written consent.

5. ROSTER, ELIGIBILITY AND LINEUP
5.1. Each category requires a roster of at least 12 and at most 20 athletes, plus up to 7 coaching staff members, registered in the portal within the published deadlines.
5.2. Age limits: U-15 — born 2011 or later; U-12 — born 2014 or later; other categories as per the Official Rulebook.
5.3. The CLUB is responsible for the eligibility, documentation and accuracy of its athletes' and staff's data. Ineligible athletes or false data subject the CLUB to the Rulebook sanctions, including disqualification, without refund.
5.4. Athletes under 18 may only participate upon a signed authorization by their legal guardian (participation, image use and data processing), uploaded in the portal. Without it, the athlete will not be accredited.

6. HEALTH, INSURANCE AND LIABILITY
6.1. The CLUB declares its athletes are fit for sports practice and is responsible for verifying their health condition (prior medical evaluation is recommended).
6.2. The ORGANIZER will provide emergency medical care at the EVENT venue. Subsequent treatments, exams, hospitalizations and related expenses are the responsibility of the CLUB/athlete.
6.3. The CLUB and its athletes assume the risks inherent to flag football. The ORGANIZER is not liable for damages arising from such inherent risks, remaining liable only for damages caused by its proven fault or intent, as per the law.
6.4. The ORGANIZER is not responsible for personal belongings, transportation, lodging or meals of delegations, unless expressly contracted through it.

7. IMAGE AND BRAND
The CLUB authorizes, free of charge and for an indefinite period, the use of its name, crest, uniform and the collective image of its delegation in photos, videos, broadcasts and promotional materials of the EVENT and its editions, in Brazil and abroad. Use of the BFWC brand by the CLUB requires written authorization.

8. CONDUCT AND DISCIPLINE
The CLUB, its athletes, staff and affiliated supporters commit to fair play and to the Official Rulebook (an integral part of these Terms, available on the website and subject to updates published in the portal). Violations subject the CLUB to warning, suspension, disqualification and/or civil liability, without refund. Athletes are subject to anti-doping control.

9. DATA PROTECTION (LGPD)
9.1. Data of the CLUB, athletes and staff will be processed by the ORGANIZER for: registration and payment management, accreditation, sports organization (schedules, match reports, results), EVENT communications and compliance with legal obligations.
9.2. Data may be shared with strictly necessary processors: payment providers, website hosting platform, official travel partner (when requested by the CLUB) and authorities, when required by law.
9.3. Minors' data is processed with the specific consent of the legal guardian (clause 5.4).
9.4. Data subject requests (access, correction, deletion): contato@brasilflag.com.

10. GENERAL PROVISIONS
10.1. Official communications will be sent to the e-mail registered in the portal and are deemed received on the date of sending.
10.2. The ORGANIZER may adjust competition format, schedule and times for technical reasons, with no refund due.
10.3. The electronic record of acceptance (date, time, IP and Terms version) constitutes proof of contract.
10.4. The courts of the District of Leme/SP, Brazil, are elected as the competent forum, waiving any other.`;

const TERMS_ES = `TÉRMINO DE INSCRIPCIÓN Y PARTICIPACIÓN — BRASIL FLAG WORLD CHAMPIONSHIP 2026

1. PARTES Y OBJETO
Estos Términos regulan la inscripción y participación del club/equipo identificado en este registro ("CLUB") en el Brasil Flag World Championship 2026 ("EVENTO"), a realizarse en Leme/SP, Brasil, el 31/10/2026, organizado por BRASIL SPORTS BUSINESS, CNPJ 27.517.868/0001-10 ("ORGANIZACIÓN"). La aceptación electrónica de estos Términos por el responsable indicado en el registro constituye contrato válido entre las partes según la ley brasileña (Código Civil, art. 425), sin necesidad de firma física.

2. REGISTRO Y APROBACIÓN
2.1. La información proporcionada debe ser verdadera, completa y actualizada; el responsable declara tener poderes para representar al CLUB.
2.2. El registro está sujeto a análisis y aprobación por la ORGANIZACIÓN y no garantiza cupo.
2.3. El cupo en cada categoría solo se reserva con la confirmación del pago de la 1.ª cuota, respetando el orden cronológico de pago y el límite de cupos por categoría.

3. VALORES Y PAGO
3.1. La tarifa de inscripción se define por categoría, a elección del CLUB en el portal: Opción 1 (Paquete) — R$ 2.000,00 por categoría, atletas incluidos; u Opción 2 (Por atleta) — R$ 800,00 por categoría + R$ 90,00 por atleta (mínimo 12, máximo 20 por categoría). El total es la suma de las categorías inscritas.
3.2. El pago puede dividirse en hasta 3 cuotas, con vencimientos el 20/07/2026, 20/08/2026 y 20/09/2026, vía Pix o tarjeta de crédito. Inscripciones posteriores siguen el calendario restante.
3.3. La opción elegida queda vinculada tras el pago de la 1.ª cuota.
3.4. La participación está condicionada al pago total hasta el 20/09/2026.

4. CANCELACIÓN, DESISTIMIENTO Y REEMBOLSO
4.1. Las cuotas pagadas NO son reembolsables, en ningún caso de desistimiento, ausencia (no-show), descalificación disciplinaria o falta de pago de las cuotas siguientes.
4.2. En caso de falta de pago hasta el vencimiento final, la ORGANIZACIÓN podrá cancelar la inscripción y liberar el cupo, permaneciendo no reembolsables los valores pagados.
4.3. Si el EVENTO fuera cancelado sin reprogramación, los valores pagados serán devueltos íntegramente en hasta 30 días. En caso de aplazamiento o cambio de fecha/lugar por fuerza mayor (clima, orden de autoridad pública, seguridad), las inscripciones permanecen válidas para la nueva fecha, sin derecho a reembolso por el cambio.
4.4. El cupo es intransferible sin consentimiento escrito de la ORGANIZACIÓN.

5. ROSTER, ELEGIBILIDAD Y ALINEACIÓN
5.1. Cada categoría exige roster de mínimo 12 y máximo 20 atletas, además de hasta 7 miembros del cuerpo técnico/staff, registrados en el portal dentro de los plazos divulgados.
5.2. Límites de edad: Sub-15 — nacidos desde 2011; Sub-12 — nacidos desde 2014; demás categorías según el Reglamento Oficial.
5.3. El CLUB responde por la elegibilidad, documentación y veracidad de los datos de sus atletas y staff. Atleta inelegible o datos falsos sujetan al CLUB a las sanciones del Reglamento, incluida la descalificación, sin reembolso.
5.4. Atletas menores de 18 años solo participarán mediante autorización firmada por el responsable legal (participación, uso de imagen y tratamiento de datos), enviada en el portal. Sin la autorización, el atleta no será acreditado.

6. SALUD, SEGURO Y RESPONSABILIDAD
6.1. El CLUB declara que sus atletas están aptos para la práctica deportiva, responsabilizándose por verificar sus condiciones de salud (se recomienda evaluación médica previa).
6.2. La ORGANIZACIÓN dispondrá de atención médica de emergencia en el lugar del EVENTO. Tratamientos posteriores, exámenes, internaciones y gastos relacionados son responsabilidad del CLUB/atleta.
6.3. El CLUB y sus atletas asumen los riesgos inherentes al flag football. La ORGANIZACIÓN no responde por daños derivados de esos riesgos inherentes, respondiendo solo por daños causados por dolo o culpa comprobada de su parte, conforme a la ley.
6.4. La ORGANIZACIÓN no se responsabiliza por objetos personales, traslado, hospedaje y alimentación de las delegaciones, salvo cuando sean contratados expresamente por medio de ella.

7. IMAGEN Y MARCA
El CLUB autoriza, sin costo y por plazo indeterminado, el uso de su nombre, escudo, uniforme y de la imagen colectiva de su delegación en fotos, videos, transmisiones y materiales promocionales del EVENTO y sus ediciones, en Brasil y en el exterior. El uso de la marca BFWC por el CLUB depende de autorización escrita.

8. CONDUCTA Y DISCIPLINA
El CLUB, sus atletas, staff y afición vinculada se comprometen con el fair play y con el Reglamento Oficial (parte integrante de estos Términos, disponible en el sitio y sujeto a actualizaciones divulgadas en el portal). Las infracciones sujetan al CLUB a advertencia, suspensión, descalificación y/o responsabilidad civil, sin reembolso. Los atletas están sujetos a control antidopaje.

9. PROTECCIÓN DE DATOS (LGPD)
9.1. Los datos del CLUB, atletas y staff serán tratados por la ORGANIZACIÓN para: gestión de inscripciones y pagos, acreditación, organización deportiva (calendarios, actas, resultados), comunicaciones del EVENTO y cumplimiento de obligaciones legales.
9.2. Podrán compartirse con operadores estrictamente necesarios: procesadores de pago, plataforma de hosting del sitio, socio oficial de viajes (cuando lo solicite el CLUB) y autoridades, cuando lo exija la ley.
9.3. Los datos de menores se tratan con el consentimiento específico del responsable legal (cláusula 5.4).
9.4. Solicitudes de titulares (acceso, corrección, eliminación): contato@brasilflag.com.

10. DISPOSICIONES GENERALES
10.1. Las comunicaciones oficiales se harán al e-mail registrado en el portal y se consideran recibidas en la fecha de envío.
10.2. La ORGANIZACIÓN puede ajustar el formato de competición, calendario y horarios por necesidad técnica, sin derecho a reembolso por ello.
10.3. El registro electrónico de la aceptación (fecha, hora, IP y versión de los Términos) constituye prueba de la contratación.
10.4. Se elige el fuero de la Comarca de Leme/SP, Brasil, con renuncia a cualquier otro.`;

const TERMS = { pt: TERMS_PT, en: TERMS_EN, es: TERMS_ES };

const T = {
  pt: {
    badge: 'Cadastro de Clube',
    title: 'BFWC',
    sub: 'Crie sua conta para acessar o portal',
    step1: 'Dados do Clube',
    step2: 'Categorias',
    step3: 'Conta & Termos',
    clubName: 'Nome do clube *',
    country: 'País *',
    city: 'Cidade',
    contactName: 'Nome do responsável *',
    contactRole: 'Cargo / Função',
    email: 'E-mail *',
    whatsapp: 'WhatsApp',
    logoLabel: 'Logo do clube',
    logoHint: 'PNG, JPG ou JPEG · Máx. 2 MB',
    logoBtn: 'Escolher arquivo',
    logoChange: 'Trocar imagem',
    categories: 'Categorias que pretende participar *',
    athletesPerCat: 'Número de atletas por categoria',
    password: 'Senha *',
    confirmPassword: 'Confirmar senha *',
    terms: 'Termos e Condições',
    acceptTerms: 'Li e aceito os termos e condições',
    btnNext: 'Continuar →',
    btnBack: '← Voltar',
    btnSubmit: 'Criar conta',
    btnLoading: 'Criando conta...',
    loginLink: 'Já tem conta?',
    login: 'Fazer login',
    back: '← Voltar ao portal',
    successTitle: 'Cadastro realizado!',
    successMsg: 'Enviamos um e-mail de confirmação para <strong>{email}</strong>. Verifique sua caixa de entrada (e spam) e clique no link para ativar sua conta.',
    successNote: 'Após a verificação, o administrador analisará seu cadastro. Você receberá um e-mail quando for aprovado.',
    required: 'Campo obrigatório',
    passwordMin: 'Senha deve ter no mínimo 8 caracteres',
    passwordMatch: 'As senhas não coincidem',
    categoryMin: 'Selecione ao menos uma categoria',
    athMin: 'Informe pelo menos 12 atletas por categoria (mínimo do roster)',
    termsRequired: 'Você deve aceitar os termos',
    logoInvalidType: 'Formato inválido. Use PNG, JPG ou JPEG.',
    logoTooLarge: 'Arquivo muito grande. Máximo 2 MB.',
    deadlinesTitle: '📅 Prazos de inscrição',
    deadlinesText: 'De <strong>07/07 a 12/07</strong> a inscrição é exclusiva para times <strong>já pré-inscritos</strong>. A partir de <strong>13/07</strong>, aberta para qualquer time.',
    sameEmail: '⚠️ Use o <strong>mesmo e-mail</strong> cadastrado na pré-inscrição para concluir o cadastro.',
    contactLabel: 'Dúvidas? E-mail',
    selectCountry: 'Selecione o país',
    phClubName: 'Ex: Clube Bandeirante',
    phCity: 'Ex: São Paulo',
    phContactName: 'Nome completo',
    phRole: 'Ex: Presidente, Técnico',
    phEmail: 'email@clube.com',
    phWhatsapp: '+55 11 99999-0000',
    phPassword: 'Mínimo 8 caracteres',
    phConfirm: 'Repita a senha',
    phAthletes: 'Nº de atletas (mín. 12)',
    noImage: 'Nenhuma imagem selecionada',
  },
  en: {
    badge: 'Club Registration',
    title: 'BFWC',
    sub: 'Create your account to access the portal',
    step1: 'Club Info',
    step2: 'Categories',
    step3: 'Account & Terms',
    clubName: 'Club name *',
    country: 'Country *',
    city: 'City',
    contactName: 'Contact name *',
    contactRole: 'Role / Position',
    email: 'Email *',
    whatsapp: 'WhatsApp',
    logoLabel: 'Club logo',
    logoHint: 'PNG, JPG or JPEG · Max 2 MB',
    logoBtn: 'Choose file',
    logoChange: 'Change image',
    categories: 'Categories you plan to enter *',
    athletesPerCat: 'Number of athletes per category',
    password: 'Password *',
    confirmPassword: 'Confirm password *',
    terms: 'Terms and Conditions',
    acceptTerms: 'I have read and accept the terms and conditions',
    btnNext: 'Continue →',
    btnBack: '← Back',
    btnSubmit: 'Create account',
    btnLoading: 'Creating account...',
    loginLink: 'Already have an account?',
    login: 'Log in',
    back: '← Back to portal',
    successTitle: 'Registration complete!',
    successMsg: 'We sent a confirmation email to <strong>{email}</strong>. Check your inbox (and spam) and click the link to activate your account.',
    successNote: 'After verification, the administrator will review your registration. You will receive an email when approved.',
    required: 'Required field',
    passwordMin: 'Password must be at least 8 characters',
    passwordMatch: 'Passwords do not match',
    categoryMin: 'Select at least one category',
    athMin: 'Enter at least 12 athletes per category (roster minimum)',
    termsRequired: 'You must accept the terms',
    logoInvalidType: 'Invalid format. Use PNG, JPG or JPEG.',
    logoTooLarge: 'File too large. Maximum 2 MB.',
    deadlinesTitle: '📅 Registration deadlines',
    deadlinesText: 'From <strong>Jul 7–12</strong>, registration is exclusive to <strong>already pre-registered</strong> teams. From <strong>Jul 13</strong>, open to any team.',
    sameEmail: '⚠️ Use the <strong>same email</strong> from your pre-registration to complete sign-up.',
    contactLabel: 'Questions? Email',
    selectCountry: 'Select country',
    phClubName: 'e.g. Bandeirante Club',
    phCity: 'e.g. São Paulo',
    phContactName: 'Full name',
    phRole: 'e.g. President, Coach',
    phEmail: 'email@yourclub.com',
    phWhatsapp: 'e.g. +1 202 555-0123',
    phPassword: 'Minimum 8 characters',
    phConfirm: 'Repeat the password',
    phAthletes: 'No. of athletes (min. 12)',
    noImage: 'No image selected',
  },
  es: {
    badge: 'Registro de Club',
    title: 'BFWC',
    sub: 'Crea tu cuenta para acceder al portal',
    step1: 'Datos del Club',
    step2: 'Categorías',
    step3: 'Cuenta y Términos',
    clubName: 'Nombre del club *',
    country: 'País *',
    city: 'Ciudad',
    contactName: 'Nombre del responsable *',
    contactRole: 'Cargo / Función',
    email: 'Correo electrónico *',
    whatsapp: 'WhatsApp',
    logoLabel: 'Logo del club',
    logoHint: 'PNG, JPG o JPEG · Máx. 2 MB',
    logoBtn: 'Elegir archivo',
    logoChange: 'Cambiar imagen',
    categories: 'Categorías en las que planea participar *',
    athletesPerCat: 'Número de atletas por categoría',
    password: 'Contraseña *',
    confirmPassword: 'Confirmar contraseña *',
    terms: 'Términos y Condiciones',
    acceptTerms: 'He leído y acepto los términos y condiciones',
    btnNext: 'Continuar →',
    btnBack: '← Volver',
    btnSubmit: 'Crear cuenta',
    btnLoading: 'Creando cuenta...',
    loginLink: '¿Ya tienes cuenta?',
    login: 'Iniciar sesión',
    back: '← Volver al portal',
    successTitle: '¡Registro completado!',
    successMsg: 'Enviamos un correo de confirmación a <strong>{email}</strong>. Revisa tu bandeja (y spam) y haz clic en el enlace para activar tu cuenta.',
    successNote: 'Tras la verificación, el administrador revisará tu registro. Recibirás un correo cuando sea aprobado.',
    required: 'Campo obligatorio',
    passwordMin: 'La contraseña debe tener al menos 8 caracteres',
    passwordMatch: 'Las contraseñas no coinciden',
    categoryMin: 'Selecciona al menos una categoría',
    athMin: 'Informa al menos 12 atletas por categoría (mínimo del roster)',
    termsRequired: 'Debes aceptar los términos',
    logoInvalidType: 'Formato inválido. Usa PNG, JPG o JPEG.',
    logoTooLarge: 'Archivo demasiado grande. Máximo 2 MB.',
    deadlinesTitle: '📅 Plazos de inscripción',
    deadlinesText: 'Del <strong>07/07 al 12/07</strong> la inscripción es exclusiva para equipos <strong>ya pre-inscritos</strong>. A partir del <strong>13/07</strong>, abierta para cualquier equipo.',
    sameEmail: '⚠️ Usa el <strong>mismo correo</strong> registrado en la pre-inscripción para completar el registro.',
    contactLabel: '¿Dudas? Correo',
    selectCountry: 'Selecciona el país',
    phClubName: 'Ej: Club Bandeirante',
    phCity: 'Ej: São Paulo',
    phContactName: 'Nombre completo',
    phRole: 'Ej: Presidente, Entrenador',
    phEmail: 'email@tuclub.com',
    phWhatsapp: 'Ej: +34 612 345 678',
    phPassword: 'Mínimo 8 caracteres',
    phConfirm: 'Repite la contraseña',
    phAthletes: 'N.º de atletas (mín. 12)',
    noImage: 'Ninguna imagen seleccionada',
  },
};

export default function CadastroPage() {
  const [lang, setLang] = useState('pt');
  const [langChosen, setLangChosen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    club_name: '', country: '', city: '',
    contact_name: '', contact_role: '',
    email: '', whatsapp: '',
    categories: [],
    athletes_per_category: {},
    password: '', confirmPassword: '',
    terms: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('bfwc_language') || localStorage.getItem('bfwc_lang');
    if (saved && T[saved]) setLang(saved); // usa como padrão, mas a tela de escolha ainda aparece
  }, []);

  function chooseLang(code) {
    setLang(code);
    setLangChosen(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bfwc_language', code);
      localStorage.setItem('bfwc_lang', code);
    }
  }

  const t = T[lang];
  const catLabel = (value) => CATEGORY_LABELS[lang]?.[value] || value;
  const countryLabel = (c) => {
    if (lang === 'pt') return c;
    const names = COUNTRY_NAMES[c];
    return names ? names[lang === 'en' ? 0 : 1] : c;
  };
  // Ordena pelo nome exibido no idioma atual (Brasil primeiro, "Outro" por último)
  const countryOptions = [
    COUNTRIES[0],
    ...COUNTRIES.slice(1, -1).sort((a, b) => countryLabel(a).localeCompare(countryLabel(b), lang)),
    COUNTRIES[COUNTRIES.length - 1],
  ];

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setErrors(er => ({ ...er, logo: t.logoInvalidType }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(er => ({ ...er, logo: t.logoTooLarge }));
      return;
    }
    setLogoFile(file);
    setErrors(er => ({ ...er, logo: '' }));
    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function toggleCategory(val) {
    setForm(f => {
      const next = f.categories.includes(val)
        ? f.categories.filter(c => c !== val)
        : [...f.categories, val];
      const apc = { ...f.athletes_per_category };
      if (!next.includes(val)) delete apc[val];
      return { ...f, categories: next, athletes_per_category: apc };
    });
    setErrors(e => ({ ...e, categories: '' }));
  }

  function setAthleteCount(cat, val) {
    setForm(f => ({ ...f, athletes_per_category: { ...f.athletes_per_category, [cat]: val } }));
  }

  function validateStep(n) {
    const errs = {};
    if (n === 1) {
      if (!form.club_name.trim()) errs.club_name = t.required;
      if (!form.country) errs.country = t.required;
      if (!form.contact_name.trim()) errs.contact_name = t.required;
      if (!form.email.trim() || !form.email.includes('@')) errs.email = t.required;
    }
    if (n === 2) {
      if (!form.categories.length) errs.categories = t.categoryMin;
      else if (form.categories.some(c => (parseInt(form.athletes_per_category[c], 10) || 0) < 12)) errs.categories = t.athMin;
    }
    if (n === 3) {
      if (!form.password) errs.password = t.required;
      else if (form.password.length < 8) errs.password = t.passwordMin;
      if (form.password !== form.confirmPassword) errs.confirmPassword = t.passwordMatch;
      if (!form.terms) errs.terms = t.termsRequired;
    }
    return errs;
  }

  function nextStep() {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep(3);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true); setServerError('');
    try {
      const fd = new FormData();
      fd.append('club_name', form.club_name);
      fd.append('country', form.country);
      fd.append('city', form.city);
      fd.append('contact_name', form.contact_name);
      fd.append('contact_role', form.contact_role);
      fd.append('email', form.email);
      fd.append('whatsapp', form.whatsapp);
      fd.append('category', form.categories.map(c => {
        const n = form.athletes_per_category[c];
        return n ? `${c} (${n})` : c;
      }).join(', '));
      fd.append('athletes_count', Object.values(form.athletes_per_category).reduce((s, v) => s + (parseInt(v) || 0), 0) || '');
      fd.append('password', form.password);
      fd.append('language', lang);
      if (logoFile) fd.append('logo', logoFile);

      const res = await fetch('/api/portal/times/register', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.ok) setSuccess(true);
      else setServerError(data.message || 'Erro ao criar conta.');
    } catch {
      setServerError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { width: '100%', boxSizing: 'border-box' };

  // Tela de escolha de idioma (entrada do cadastro)
  if (!langChosen) return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/assets/hero-rio-athletes.png')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,13,31,.80), rgba(3,13,31,.93))', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 460, background: 'rgba(10,20,40,.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 28, padding: '44px 34px', textAlign: 'center', boxShadow: '0 40px 120px rgba(0,0,0,.7)' }}>
        <img src="/assets/bfwc-logo.jpg" alt="BFWC" width={92} height={92} style={{ borderRadius: 18, marginBottom: 20, objectFit: 'cover' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 12, padding: '5px 14px', borderRadius: 20, background: 'rgba(255,255,255,.08)' }}>🏈 Cadastro de Clube</div>
        <h1 style={{ fontSize: 25, fontWeight: 900, color: '#fff', letterSpacing: -0.8, margin: '0 0 8px', lineHeight: 1.2 }}>Brasil Flag World Championship 2026</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', margin: '0 0 26px', lineHeight: 1.6 }}>Selecione o idioma · Select your language · Selecciona el idioma</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['pt', '/assets/flag-br.png', 'BR', 'Entrar em Português'], ['en', '/assets/flag-us.png', 'US', 'Enter in English'], ['es', '/assets/flag-es.png', 'ES', 'Entrar en Español']].map(([code, flag, short, title]) => (
            <button key={code} onClick={() => chooseLang(code)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 16, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.06)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .18s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.13)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,.25)' }}>
                <img src={flag} alt={short} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.15)', display: 'block' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#f4ff00' }}>{short}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{title}</div>
              </div>
              <span style={{ color: '#f4ff00', fontSize: 22, fontWeight: 900 }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Success screen
  if (success) {
    return (
      <div className="login-root">
        <div className="login-card" style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div className="login-badge">{t.badge}</div>
          <h1 className="login-title" style={{ justifyContent: 'center' }}>{t.successTitle}</h1>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '16px 0' }}
            dangerouslySetInnerHTML={{ __html: t.successMsg.replace('{email}', form.email) }}
          />
          <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(13,75,255,.05)', border: '1px solid rgba(13,75,255,.15)', fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
            💡 {t.successNote}
          </div>
          <a href="/portal/times/login" className="login-btn" style={{ display: 'block', textAlign: 'center', marginTop: 24, background: '#0D4BFF', color: '#fff', textDecoration: 'none' }}>
            {t.login}
          </a>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <a href="/portal" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>{t.back}</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-root" style={{ alignItems: 'flex-start', paddingTop: 40, paddingBottom: 40 }}>
      <div style={{ width: '100%', maxWidth: 560, animation: 'cardIn .55s cubic-bezier(.22,.61,.36,1) both' }}>
        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center', background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: 24, padding: '8px 20px', width: 'fit-content', margin: '0 auto 24px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
              color: step === n ? '#fff' : step > n ? '#4ade80' : 'rgba(255,255,255,.6)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 900,
                background: step === n ? '#0D4BFF' : step > n ? '#009c3b' : 'rgba(255,255,255,.08)',
                color: step > n ? '#fff' : '#fff',
                border: step === n ? '2px solid #0D4BFF' : '1px solid rgba(255,255,255,.1)',
              }}>
                {step > n ? '✓' : n}
              </div>
              {[t.step1, t.step2, t.step3][n - 1]}
              {n < 3 && <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,.1)' }} />}
            </div>
          ))}
        </div>

        <div className="login-card" style={{ maxWidth: '100%', overflow: 'hidden', paddingTop: 0 }}>
          {/* Accent stripe */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #0D4BFF, #60a5fa)', margin: '0 -44px 36px', width: 'calc(100% + 88px)' }} />

          <div className="login-badge">{t.badge}</div>
          <h1 className="login-title">{t.title} <span style={{ color: '#0D4BFF' }}>2026</span></h1>
          <p className="login-sub">{t.sub}</p>

          {/* Aviso: prazos de inscrição + contato */}
          <div style={{ marginBottom: 24, padding: '14px 16px', borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1e3a8a', marginBottom: 6 }}>{t.deadlinesTitle}</div>
            <div style={{ fontSize: 12.5, color: '#1e40af', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: t.deadlinesText }} />
            <div style={{ fontSize: 12.5, color: '#1e40af', lineHeight: 1.6, marginTop: 8 }} dangerouslySetInnerHTML={{ __html: t.sameEmail }} />
            <div style={{ fontSize: 12.5, color: '#1e40af', lineHeight: 1.6, marginTop: 8 }}>
              {t.contactLabel} <a href="mailto:contato@brasilflag.com" style={{ color: '#1d4ed8', fontWeight: 700 }}>contato@brasilflag.com</a> · WhatsApp <a href="https://wa.me/5516997754522" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', fontWeight: 700 }}>(16) 99775-4522</a>.
            </div>
          </div>

          {/* Step 1: Club info */}
          {step === 1 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="login-label">{t.clubName}</label>
                  <input className="login-input" style={inputStyle} value={form.club_name} onChange={e => set('club_name', e.target.value)} placeholder={t.phClubName} />
                  {errors.club_name && <div className="login-error" style={{ marginTop: 4 }}>{errors.club_name}</div>}
                </div>
                <div>
                  <label className="login-label">{t.country}</label>
                  <select className="login-input" style={{ ...inputStyle, cursor: 'pointer' }} value={form.country} onChange={e => set('country', e.target.value)}>
                    <option value="">{t.selectCountry}</option>
                    {countryOptions.map(c => <option key={c} value={c}>{countryLabel(c)}</option>)}
                  </select>
                  {errors.country && <div className="login-error" style={{ marginTop: 4 }}>{errors.country}</div>}
                </div>
                <div>
                  <label className="login-label">{t.city}</label>
                  <input className="login-input" style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder={t.phCity} />
                </div>
                <div>
                  <label className="login-label">{t.contactName}</label>
                  <input className="login-input" style={inputStyle} value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder={t.phContactName} />
                  {errors.contact_name && <div className="login-error" style={{ marginTop: 4 }}>{errors.contact_name}</div>}
                </div>
                <div>
                  <label className="login-label">{t.contactRole}</label>
                  <input className="login-input" style={inputStyle} value={form.contact_role} onChange={e => set('contact_role', e.target.value)} placeholder={t.phRole} />
                </div>
                <div>
                  <label className="login-label">{t.email}</label>
                  <input className="login-input" style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder={t.phEmail} />
                  {errors.email && <div className="login-error" style={{ marginTop: 4 }}>{errors.email}</div>}
                </div>
                <div>
                  <label className="login-label">{t.whatsapp}</label>
                  <input className="login-input" style={inputStyle} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder={t.phWhatsapp} />
                </div>

                {/* Logo upload */}
                <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                  <label className="login-label">{t.logoLabel}</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                    style={{ display: 'none' }}
                    onChange={handleLogoChange}
                  />
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 14px', borderRadius: 12,
                    border: errors.logo ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                  }} onClick={() => fileInputRef.current?.click()}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Preview" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'contain', background: '#e2e8f0' }} />
                    ) : (
                      <div style={{
                        width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                        background: '#e2e8f0', border: '1.5px dashed #cbd5e1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20,
                      }}>🏟</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: logoPreview ? '#0f172a' : '#94a3b8', marginBottom: 2 }}>
                        {logoPreview ? logoFile?.name : t.noImage}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '.5px' }}>{t.logoHint}</div>
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '.5px',
                      color: '#0D4BFF', padding: '6px 12px', borderRadius: 8,
                      border: '1px solid rgba(13,75,255,.35)', background: 'rgba(13,75,255,.1)',
                      flexShrink: 0,
                    }}>
                      {logoPreview ? t.logoChange : t.logoBtn}
                    </div>
                  </div>
                  {errors.logo && <div className="login-error" style={{ marginTop: 4 }}>{errors.logo}</div>}
                </div>
              </div>

              <button className="login-btn" onClick={nextStep} style={{ background: '#0D4BFF', color: '#fff', boxShadow: '0 8px 28px rgba(13,75,255,.35)', marginTop: 16 }}>
                {t.btnNext}
              </button>
            </div>
          )}

          {/* Step 2: Categories */}
          {step === 2 && (
            <div>
              <label className="login-label">{t.categories}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {CATEGORIES.map(cat => {
                  const checked = form.categories.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleCategory(cat.value)}
                      style={{
                        padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                        border: checked ? '2px solid #0D4BFF' : '1px solid #e2e8f0',
                        background: checked ? 'rgba(13,75,255,.08)' : '#f8fafc',
                        color: checked ? '#0D4BFF' : '#64748b',
                        fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'all .15s',
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        border: checked ? '2px solid #0D4BFF' : '2px solid #cbd5e1',
                        background: checked ? '#0D4BFF' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: '#fff',
                      }}>
                        {checked ? '✓' : ''}
                      </div>
                      {catLabel(cat.value)}
                    </button>
                  );
                })}
              </div>
              {errors.categories && <div className="login-error">{errors.categories}</div>}

              {form.categories.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <label className="login-label">{t.athletesPerCat}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                    {form.categories.map(cat => (
                      <div key={cat}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>{catLabel(cat)}</div>
                        <input
                          className="login-input"
                          style={{ width: '100%', boxSizing: 'border-box' }}
                          type="number" min={12} max={500}
                          value={form.athletes_per_category[cat] || ''}
                          onChange={e => setAthleteCount(cat, e.target.value)}
                          placeholder={t.phAthletes}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="login-btn" onClick={() => setStep(1)} style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none', border: '1px solid #e2e8f0', flex: 1 }}>
                  {t.btnBack}
                </button>
                <button className="login-btn" onClick={nextStep} style={{ background: '#0D4BFF', color: '#fff', boxShadow: '0 8px 28px rgba(13,75,255,.35)', flex: 2 }}>
                  {t.btnNext}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Account + Terms */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <label className="login-label">{t.password}</label>
              <input className="login-input" style={inputStyle} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder={t.phPassword} autoComplete="new-password" />
              {errors.password && <div className="login-error" style={{ marginTop: 4 }}>{errors.password}</div>}

              <label className="login-label" style={{ marginTop: 14 }}>{t.confirmPassword}</label>
              <input className="login-input" style={inputStyle} type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder={t.phConfirm} autoComplete="new-password" />
              {errors.confirmPassword && <div className="login-error" style={{ marginTop: 4 }}>{errors.confirmPassword}</div>}

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>{t.terms}</div>
                <div style={{
                  height: 280, overflowY: 'auto', padding: '14px 16px', borderRadius: 10,
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  fontSize: 11, color: '#64748b', lineHeight: 1.7, whiteSpace: 'pre-line',
                }}>
                  {TERMS[lang] || TERMS_PT}
                </div>
              </div>

              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 14, cursor: 'pointer',
                fontSize: 13, color: form.terms ? '#0f172a' : '#94a3b8',
              }}>
                <div
                  onClick={() => set('terms', !form.terms)}
                  style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                    border: form.terms ? '2px solid #0D4BFF' : '2px solid #cbd5e1',
                    background: form.terms ? '#0D4BFF' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#fff', transition: 'all .15s', cursor: 'pointer',
                  }}
                >
                  {form.terms ? '✓' : ''}
                </div>
                <span onClick={() => set('terms', !form.terms)}>{t.acceptTerms}</span>
              </label>
              {errors.terms && <div className="login-error" style={{ marginTop: 4 }}>{errors.terms}</div>}

              {serverError && <div className="login-error" style={{ marginTop: 12 }}>{serverError}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" className="login-btn" onClick={() => setStep(2)} style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none', border: '1px solid #e2e8f0', flex: 1 }}>
                  {t.btnBack}
                </button>
                <button type="submit" className="login-btn" disabled={loading} style={{ background: '#0D4BFF', color: '#fff', boxShadow: '0 8px 28px rgba(13,75,255,.35)', flex: 2 }}>
                  {loading ? t.btnLoading : t.btnSubmit}
                </button>
              </div>
            </form>
          )}

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
            {t.loginLink}{' '}
            <a href="/portal/times/login" style={{ color: '#0D4BFF', textDecoration: 'none', fontWeight: 700 }}>{t.login}</a>
          </div>
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <a href="/portal" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>{t.back}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
