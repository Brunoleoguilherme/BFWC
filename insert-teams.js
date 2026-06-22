// Script de inserção — novos times recebidos por email
// node insert-teams.js

const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

const env = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8')
  .split('\n').reduce((acc, line) => {
    const [k, ...v] = line.split('=');
    if (k && v.length) acc[k.trim()] = v.join('=').trim();
    return acc;
  }, {});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'], { auth: { persistSession: false } });

const teams = [
  {
    club_name: "Empyreo Leme Lizards",
    country: "Brasil", city: "Leme",
    contact_name: "Anderson Ibanez", contact_role: "Treinador",
    whatsapp: "(19)993915988", email: "anderson.ibanez96@gmail.com",
    category: "Masculino", athletes_count: 20,
    competitive_history: "Com o nome de Leme temos apenas 6 meses de existência, mas a base vem de outra equipe, onde já participamos da super final, nos regionais e paulista sempre ficamos dentro do top8.",
    hosting_preference: "Não precisamos de hospedagem / Somos locais",
    notes: "Prioridades: Arbitragem; gramado/estrutura; festas/integração",
    travel_support: "no", preferred_language: "pt",
  },
  {
    club_name: "Phoenix Flag Football",
    country: "Brasil", city: "São Paulo",
    contact_name: "Pamella Aparecida Pereira", contact_role: "Diretora",
    whatsapp: "11984923749", email: "mvpamellapereira@gmail.com",
    category: "Feminino", athletes_count: 18,
    competitive_history: "Campeã Taça Brasil 2025, vice-campeão brasileiro 2022, vice-campeão regional sudeste 22/24, 3º lugar paulista 22/25.",
    hosting_preference: "Econômica / Hostels / Acomodações coletivas",
    notes: "Clube fundado 2020 por ex atletas de outros times de São Paulo. Prioridades: Arbitragem; gramado/estrutura; transmissão ao vivo",
    travel_support: "yes", preferred_language: "pt",
  },
  {
    club_name: "AzTKs",
    country: "Mexico", city: "Naucalpan",
    contact_name: "Mario Atzin", contact_role: "Dueño",
    whatsapp: "5564154553", email: "dsmario3@gmail.com",
    category: "Masculino", athletes_count: 11,
    competitive_history: "Campeones Flag Football World Championship 2025, Medalla Junior Olympics 2025, 5 veces Orlando Flag Football World Championships, Tercer lugar Harvard Summer Showdown, Campeones Nacionales 2024/2023/2025.",
    hosting_preference: "Intermedia / Hoteles 3 estrellas",
    notes: "Equipo viajero desde hace 5 años, campeones nacionales e internacionales. Prioridades: Logística de transporte y hoteles",
    travel_support: "yes", preferred_language: "es",
  },
  {
    club_name: "Seleccion IPN",
    country: "Mexico", city: "Ciudad de Mexico",
    contact_name: "Raul Rios Martinez", contact_role: "Head Coach",
    whatsapp: "5530828996", email: "raulrios.martinez_008@hotmail.com",
    category: "Feminino", athletes_count: 14,
    competitive_history: "Campeonas en AFFEMEX, campeonas en ligas CDMX, tercer lugar Panamá, campeonas en torneos Rafagas. Rankeadas #8 femenil y #6 universitario, #2 varonil.",
    hosting_preference: "Intermedia / Hoteles 3 estrellas",
    notes: "Una de las principales instituciones educativas del país. Prioridades: Logística; arbitragem; gramado/estrutura",
    travel_support: "yes", preferred_language: "es",
  },
  {
    club_name: "Portuguesa Lioness",
    country: "Brasil", city: "São Paulo",
    contact_name: "Natasha Araújo", contact_role: "Presidente e Diretora",
    whatsapp: "11983336483", email: "portuguesaflagfootball@gmail.com",
    category: "Feminino", athletes_count: 20,
    competitive_history: "Única equipe brasileira de flag feminino x5 com título internacional. 4 participações em torneios fora do país. Campeãs Taça Prata 2023, vice-campeãs regional sudeste 2022, campeãs Summer Festival e Tietê Bowl.",
    hosting_preference: "Econômica / Hostels / Acomodações coletivas",
    notes: "Prioridades: Arbitragem; gramado/estrutura; transmissão ao vivo",
    travel_support: "maybe", preferred_language: "pt",
  },
  {
    club_name: "Legionarios",
    country: "Argentina", city: "Buenos Aires",
    contact_name: "Franco Franceschetti", contact_role: "Owner",
    whatsapp: "+5491133233565", email: "franco.francescheti@gmail.com",
    category: "Masculino", athletes_count: 15,
    competitive_history: "Equipo de tackle que juega flag hace 10 años. Bicampeón de Buenos Aires, franquicia que más jugadores aporta al seleccionado nacional argentino.",
    hosting_preference: "Económica / Hostels / Alojamiento compartido",
    notes: "Prioridades: Gramado/estrutura; logística; arbitragem",
    travel_support: "no", preferred_language: "es",
  },
  {
    club_name: "Caniballs",
    country: "Brasil", city: "São Paulo",
    contact_name: "Rafael Belleza Simão", contact_role: "Presidente",
    whatsapp: "11965881722", email: "rafael@caniballs.com.br",
    category: "Masculino, Feminino, Sub 15 (misto), Sub 12 (misto)", athletes_count: 60,
    competitive_history: "Vice-campeão nacional masculino, vice-campeão paulista, campeão regional masculino, 3º nacional sub-17.",
    hosting_preference: "Intermediária / Hotéis 3 estrelas",
    notes: "Prioridades: Gramado/estrutura; arbitragem; transmissão ao vivo",
    travel_support: "yes", preferred_language: "pt",
  },
  {
    club_name: "GOIÂNIA FOXES",
    country: "Brasil", city: "Goiânia",
    contact_name: "Lara Gabrielly de Lima", contact_role: "Presidente",
    whatsapp: "62981311857", email: "laragaby.lima69@gmail.com",
    category: "Feminino", athletes_count: 25,
    competitive_history: "2º lugar regional CO 2026, 3º lugar nacional 2025, 1º lugar regional CO/SE 2025.",
    hosting_preference: "Premium / Hotéis 4 ou 5 estrelas",
    notes: "Prioridades: Arbitragem; gramado/estrutura; logística/hotéis",
    travel_support: "yes", preferred_language: "pt",
  },
  {
    club_name: "Caipiras Flag Football",
    country: "Brasil", city: "Piracicaba - SP",
    contact_name: "Stefany Adriana Campos Mendes Fernandes", contact_role: "Comissão Administrativa",
    whatsapp: "19992369695", email: "stefanyadriana_cm@hotmail.com",
    category: "Feminino", athletes_count: 25,
    competitive_history: "Mais de 10 anos de experiência. 2x vice-campeãs paulista (2023/2025), vice-campeãs regional Sudeste 2025, 9º Brasileirão 2025, CAMPEÃS regional Sudeste Brasileirão 2026.",
    hosting_preference: "Intermediária / Hotéis 3 estrelas",
    notes: "Prioridades: Arbitragem; gramado/estrutura; transmissão ao vivo",
    travel_support: "maybe", preferred_language: "pt",
  },
  {
    club_name: "Educando pelo Esporte",
    country: "Brasil", city: "Piracicaba",
    contact_name: "Karoline Souza", contact_role: "Head Coach",
    whatsapp: "19993193884", email: "souza.kf@hotmail.com",
    category: "Sub 12 (misto)", athletes_count: 20,
    athletes_sub12: 20,
    competitive_history: "Regionais NFL Flag e Brasileirinho 2025. SPFL KIDS 2026. Instituição com quase 30 anos, projeto Flag iniciado em 2024 com 60 crianças.",
    hosting_preference: "Não precisamos de hospedagem / Somos locais",
    notes: "25 crianças aptas para competição (8-13 anos), outras 35 no âmbito social. Prioridades: Gramado/estrutura; arbitragem; logística",
    travel_support: "no", preferred_language: "pt",
  },
  {
    club_name: "NIX FLAG FOOTBALL",
    country: "Brasil", city: "São Paulo",
    contact_name: "Ingrid Camargo", contact_role: "Head Coach",
    whatsapp: "11976324010", email: "iac_guidi@hotmail.com",
    category: "Feminino", athletes_count: 18,
    competitive_history: "No cenário desde 2014. Latino Bowl Colômbia 2025. Elenco experiente, ex-integrantes do São Paulo Storm.",
    hosting_preference: "Intermediária / Hotéis 3 estrelas",
    notes: "Prioridades: Arbitragem; gramado/estrutura; transmissão ao vivo",
    travel_support: "maybe", preferred_language: "pt",
  },
  {
    club_name: "Capital FA",
    country: "Brasil", city: "Brasília",
    contact_name: "Joaquim de Souza Soares Sucena", contact_role: "Head Coach",
    whatsapp: "61998127080", email: "jquims10@gmail.com",
    category: "Masculino, Sub 15 (misto), Sub 12 (misto)", athletes_count: 40,
    competitive_history: "Fundado abril 2025. TOP6 Brasileirão sub-17, vice-campeão estadual sub-20, campeão estadual sub-13.",
    hosting_preference: "Intermediária / Hotéis 3 estrelas",
    notes: "Treinos de Flag (sub-18 masc e sub-13 misto) e Futebol Americano Full Pad. Prioridades: Gramado/estrutura; transmissão; logística",
    travel_support: "yes", preferred_language: "pt",
  },
  {
    club_name: "Braves Academy",
    country: "Brasil", city: "Sorocaba",
    contact_name: "Paulo Ricardo Lisboa", contact_role: "Gestor",
    whatsapp: "5515981157192", email: "Weare@bravesacademy.com.br",
    category: "Masculino, Sub 15 (misto), Sub 12 (misto)", athletes_count: 65,
    competitive_history: "Centro de Formação desde 02/10/2015. Parceria com New England Flag Football League (Boston) e New Mexico Military Institute. Categorias sub-8 ao adulto.",
    hosting_preference: "Econômica / Hostels / Acomodações coletivas",
    notes: "Prioridades: Arbitragem; gramado/estrutura; festas/integração",
    travel_support: "yes", preferred_language: "pt",
  },
  {
    club_name: "Instituto Vale em Movimento",
    country: "Brasil", city: "Timbó",
    contact_name: "Andrey Pereira", contact_role: "Presidente",
    whatsapp: "47988126938", email: "institutovaleemmovimento@gmail.com",
    category: "Sub 15 (misto)", athletes_count: 15,
    athletes_sub15: 15,
    competitive_history: "Atletas e comissão já ficaram em 3º torneio nacional sub-15 feminino.",
    hosting_preference: "Econômica / Hostels / Acomodações coletivas",
    notes: "Prioridades: Arbitragem; gramado/estrutura; logística",
    travel_support: "yes", preferred_language: "pt",
  },
];

async function run() {
  console.log(`\n🚀 Inserindo ${teams.length} times...\n`);
  let ok = 0, err = 0;

  for (const team of teams) {
    const { data, error } = await supabase
      .from('club_interests')
      .insert({ ...team, status: 'pre_inscrito', approval_token: randomUUID() })
      .select('id, club_name')
      .single();

    if (error) {
      console.error(`  ❌ ${team.club_name}: ${error.message}`);
      err++;
    } else {
      console.log(`  ✅ ${team.club_name}`);
      ok++;
    }
  }

  console.log(`\n✨ ${ok} inseridos, ${err} erros.\n`);
  console.log('⚠️  Nota: Rebeldes do Cerrado e Campo Grande Predadores já estavam no sistema — não reinseridos.\n');
}

run().catch(console.error);
