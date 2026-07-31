import {
  ConfigSistema,
  Inscrito,
  Responsavel,
  Paroquia,
  Comunidade,
  Catequista,
  Turma,
  UsuarioSistema,
  RegistroAuditoria,
  StatusInscricao,
  ModalidadeCatequese
} from '../types';
import { DEFAULT_CONFIG } from './config';

const STORAGE_KEYS = {
  INSCRITOS: 'ivc_teresina_inscritos_v2',
  RESPONSAVEIS: 'ivc_teresina_responsaveis_v2',
  PAROQUIAS: 'ivc_teresina_paroquias_v2',
  COMUNIDADES: 'ivc_teresina_comunidades_v2',
  CATEQUISTAS: 'ivc_teresina_catequistas_v2',
  TURMAS: 'ivc_teresina_turmas_v2',
  USUARIOS: 'ivc_teresina_usuarios_v2',
  AUDITORIA: 'ivc_teresina_auditoria_v2',
  CONFIG: 'ivc_teresina_config_v2'
};

// Dados Iniciais Demonstrativos para a Igreja São José - Lar de Misericórdia
const SEED_PAROQUIAS: Paroquia[] = [
  {
    id: 'par-01',
    nome: 'Igreja São José - Lar de Misericórdia',
    arquidiocese: 'Arquidiocese de Teresina',
    endereco: 'Teresina - PI',
    telefone: '(86) 3222-2253',
    email: 'saojose.lardemisericordia@arquidiocese.org.br',
    paroco: 'Pe. Klebert Viana'
  }
];

const SEED_COMUNIDADES: Comunidade[] = [
  { id: 'com-01', paroquiaId: 'par-01', nome: 'Igreja São José - Lar de Misericórdia', endereco: 'Teresina - PI' }
];

const SEED_CATEQUISTAS: Catequista[] = [
  {
    id: 'cat-wallison',
    nome: 'Wallison Angelim Medeiros',
    cpf: '000.000.000-01',
    email: 'wamedeiros@gmail.com',
    telefone: '(86) 99989-0000',
    dataNascimento: '1979-01-28',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidadesAtendidas: ['PRE', 'EUC', 'CRI', 'ADU'],
    ativo: true
  },
  {
    id: 'cat-cynara',
    nome: 'Cynara Pádua Oliveira',
    cpf: '000.000.000-02',
    email: 'cynarapaduaoliveira@gmail.com',
    telefone: '(86) 99510-9595',
    dataNascimento: '1979-10-08',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidadesAtendidas: ['PRE', 'EUC', 'CRI', 'ADU'],
    ativo: true
  }
];

const SEED_TURMAS: Turma[] = [
  {
    id: 'tur-pre-dom',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidade: 'PRE',
    anoPastoral: 2028,
    nome: 'Pré-Catequese - Domingo (10:00 às 11:00)',
    horario: '10:00 - 11:00',
    diaSemana: 'Domingo',
    sala: 'Sala 01 – Santa Teresinha',
    catequistaId: 'cat-wallison',
    catequistaNome: 'Wallison Angelim Medeiros',
    vagasMaximas: 25,
    vagasOcupadas: 0,
    listaEsperaCount: 0,
    ativa: true
  },
  {
    id: 'tur-euc-dom',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidade: 'EUC',
    anoPastoral: 2028,
    nome: 'Eucaristia - Domingo (08:30 às 09:30)',
    horario: '08:30 - 09:30',
    diaSemana: 'Domingo',
    sala: 'Sala 01 – Santa Teresinha',
    catequistaId: 'cat-cynara',
    catequistaNome: 'Cynara Pádua Oliveira',
    vagasMaximas: 25,
    vagasOcupadas: 0,
    listaEsperaCount: 0,
    ativa: true
  },
  {
    id: 'tur-per-dom',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidade: 'PER',
    anoPastoral: 2028,
    nome: 'Perseverança - Domingo (08:30 às 09:30)',
    horario: '08:30 - 09:30',
    diaSemana: 'Domingo',
    sala: 'Sala 01 – São Carlo Acutis',
    catequistaId: 'cat-cynara',
    catequistaNome: 'Cynara Pádua Oliveira',
    vagasMaximas: 25,
    vagasOcupadas: 0,
    listaEsperaCount: 0,
    ativa: true
  },
  {
    id: 'tur-cri-dom',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidade: 'CRI',
    anoPastoral: 2028,
    nome: 'Crisma Jovem - Domingo (08:30 às 09:30)',
    horario: '08:30 - 09:30',
    diaSemana: 'Domingo',
    sala: 'Sala 02 – São Carlo Acutis',
    catequistaId: 'cat-wallison',
    catequistaNome: 'Wallison Angelim Medeiros',
    vagasMaximas: 25,
    vagasOcupadas: 0,
    listaEsperaCount: 0,
    ativa: true
  },
  {
    id: 'tur-adu-dom',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidade: 'ADU',
    anoPastoral: 2028,
    nome: 'Catecumenato Adulto - Domingo (08:30 às 09:30)',
    horario: '08:30 - 09:30',
    diaSemana: 'Domingo',
    sala: 'Sala 02 – São Carlo Acutis',
    catequistaId: 'cat-cynara',
    catequistaNome: 'Cynara Pádua Oliveira',
    vagasMaximas: 25,
    vagasOcupadas: 0,
    listaEsperaCount: 0,
    ativa: true
  },
  {
    id: 'tur-adu-seg',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidade: 'ADU',
    anoPastoral: 2028,
    nome: 'Catecumenato Adulto - Segunda-feira (19:00 às 20:30)',
    horario: '19:00 - 20:30',
    diaSemana: 'Segunda-feira',
    sala: 'Sala 01 – São Carlo Acutis',
    catequistaId: 'cat-cynara',
    catequistaNome: 'Cynara Pádua Oliveira',
    vagasMaximas: 25,
    vagasOcupadas: 0,
    listaEsperaCount: 0,
    ativa: true
  },
  {
    id: 'tur-adu-ter',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidade: 'ADU',
    anoPastoral: 2028,
    nome: 'Catecumenato Adulto - Terça-feira (19:00 às 20:30)',
    horario: '19:00 - 20:30',
    diaSemana: 'Terça-feira',
    sala: 'Sala 01 – São Carlo Acutis',
    catequistaId: 'cat-wallison',
    catequistaNome: 'Wallison Angelim Medeiros',
    vagasMaximas: 25,
    vagasOcupadas: 0,
    listaEsperaCount: 0,
    ativa: true
  },
  {
    id: 'tur-adu-qua',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidade: 'ADU',
    anoPastoral: 2028,
    nome: 'Catecumenato Adulto - Quarta-feira (19:00 às 20:30)',
    horario: '19:00 - 20:30',
    diaSemana: 'Quarta-feira',
    sala: 'Sala 01 – São Carlo Acutis',
    catequistaId: 'cat-cynara',
    catequistaNome: 'Cynara Pádua Oliveira',
    vagasMaximas: 25,
    vagasOcupadas: 0,
    listaEsperaCount: 0,
    ativa: true
  },
  {
    id: 'tur-adu-qui',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidade: 'ADU',
    anoPastoral: 2028,
    nome: 'Catecumenato Adulto - Quinta-feira (19:00 às 20:30)',
    horario: '19:00 - 20:30',
    diaSemana: 'Quinta-feira',
    sala: 'Sala 01 – São Carlo Acutis',
    catequistaId: 'cat-wallison',
    catequistaNome: 'Wallison Angelim Medeiros',
    vagasMaximas: 25,
    vagasOcupadas: 0,
    listaEsperaCount: 0,
    ativa: true
  },
  {
    id: 'tur-adu-sex',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidade: 'ADU',
    anoPastoral: 2028,
    nome: 'Catecumenato Adulto - Sexta-feira (19:00 às 20:30)',
    horario: '19:00 - 20:30',
    diaSemana: 'Sexta-feira',
    sala: 'Sala 01 – São Carlo Acutis',
    catequistaId: 'cat-cynara',
    catequistaNome: 'Cynara Pádua Oliveira',
    vagasMaximas: 25,
    vagasOcupadas: 0,
    listaEsperaCount: 0,
    ativa: true
  },
  {
    id: 'tur-adu-sab',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    modalidade: 'ADU',
    anoPastoral: 2028,
    nome: 'Catecumenato Adulto - Sábado (15:30 às 16:30)',
    horario: '15:30 - 16:30',
    diaSemana: 'Sábado',
    sala: 'Sala 01 – São Carlo Acutis',
    catequistaId: 'cat-wallison',
    catequistaNome: 'Wallison Angelim Medeiros',
    vagasMaximas: 25,
    vagasOcupadas: 0,
    listaEsperaCount: 0,
    ativa: true
  }
];

const SEED_RESPONSAVEIS: Responsavel[] = [
  {
    id: 'resp-01',
    nome: 'Carlos Eduardo da Silva',
    cpf: '888.111.222-33',
    rg: '1.234.567 SSP-PI',
    telefone: '(86) 99888-1122',
    whatsapp: '(86) 99888-1122',
    email: 'carloseduardo.silva@gmail.com',
    endereco: 'Rua Desembargador Pires de Castro, 450',
    bairro: 'Centro',
    cidade: 'Teresina',
    cep: '64000-000',
    createdAt: '2028-01-10T09:00:00.000Z',
    updatedAt: '2028-01-10T09:00:00.000Z'
  },
  {
    id: 'resp-02',
    nome: 'Raimunda Nonata de Sousa',
    cpf: '777.222.333-44',
    rg: '2.345.678 SSP-PI',
    telefone: '(86) 98877-3344',
    whatsapp: '(86) 98877-3344',
    email: 'raimundansousa@hotmail.com',
    endereco: 'Av. Frei Serafim, 1200',
    bairro: 'Centro',
    cidade: 'Teresina',
    cep: '64001-020',
    createdAt: '2028-01-12T14:30:00.000Z',
    updatedAt: '2028-01-12T14:30:00.000Z'
  }
];

const SEED_INSCRITOS: Inscrito[] = [
  {
    id: 'ins-01',
    protocolo: '2028-EUC-000001',
    nome: 'Gabriel Silva da Costa',
    dataNascimento: '2018-05-14',
    idadeCalculada: 9,
    modalidade: 'EUC',
    ondeNasceu: 'Teresina - PI',
    endereco: 'Rua Desembargador Pires de Castro, 450',
    bairro: 'Centro',
    cidade: 'Teresina',
    telefone: '(86) 99888-1122',
    email: 'carloseduardo.silva@gmail.com',
    batizado: true,
    localBatismo: 'Paróquia N. Sra. das Dores',
    dataBatismo: '2019-02-10',
    eucaristia: false,
    crisma: false,
    responsavelId: 'resp-01',
    nomePai: 'Carlos Eduardo da Silva',
    nomeMae: 'Patrícia Costa da Silva',
    paiSacramentos: { batismo: true, eucaristia: true, crisma: true },
    maeSacramentos: { batismo: true, eucaristia: true, crisma: false },
    paisMatrimonio: true,
    familiaPastoral: true,
    qualPastoral: 'Pastoral Familiar',
    necessidadeEspecial: false,
    observacoes: 'Gosta de desenhar.',
    dataInscricao: '2028-01-15',
    horaInscricao: '10:15:00',
    status: 'Turma definida',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    turmaId: 'tur-01',
    documentos: [
      { id: 'doc-1', tipo: 'Certidão de Nascimento', nomeArquivo: 'certidao_gabriel.pdf', url: '#', dataEnvio: '2028-01-15', status: 'Aprovado' },
      { id: 'doc-2', tipo: 'Certificado de Batismo', nomeArquivo: 'batismo_gabriel.pdf', url: '#', dataEnvio: '2028-01-15', status: 'Aprovado' }
    ],
    termoAceite: {
      aceito: true,
      dataHora: '2028-01-15 10:15:00',
      ip: '189.40.12.5',
      versaoTermo: '1.0 - IVC 2028'
    },
    historicoAuditoria: [
      { id: 'aud-1', inscritoId: 'ins-01', usuarioId: 'usr-01', usuarioNome: 'Carlos Eduardo (Pai)', usuarioPerfil: 'Administrador', dataHora: '2028-01-15 10:15:00', campo: 'Status', valorAntigo: null, valorNovo: 'Inscrição enviada', descricao: 'Inscrição realizada via portal público' },
      { id: 'aud-2', inscritoId: 'ins-01', usuarioId: 'usr-sec', usuarioNome: 'Secretaria Catedral', usuarioPerfil: 'Secretaria', dataHora: '2028-01-16 11:00:00', campo: 'Turma', valorAntigo: null, valorNovo: 'Eucaristia I - Sábado Manhã', descricao: 'Atribuído à turma pelo coordenador' }
    ]
  },
  {
    id: 'ins-02',
    protocolo: '2028-CRI-000002',
    nome: 'Beatriz Sousa de Oliveira',
    dataNascimento: '2012-08-20',
    idadeCalculada: 15,
    modalidade: 'CRI',
    ondeNasceu: 'Teresina - PI',
    endereco: 'Av. Frei Serafim, 1200',
    bairro: 'Centro',
    cidade: 'Teresina',
    telefone: '(86) 98877-3344',
    email: 'beatriz.sousa@gmail.com',
    batizado: true,
    localBatismo: 'Igreja de São Benedito',
    dataBatismo: '2013-05-12',
    eucaristia: true,
    localEucaristia: 'Catedral das Dores',
    dataEucaristia: '2021-11-20',
    crisma: false,
    responsavelId: 'resp-02',
    nomePai: 'Antônio de Oliveira',
    nomeMae: 'Raimunda Nonata de Sousa',
    paiSacramentos: { batismo: true, eucaristia: true, crisma: false },
    maeSacramentos: { batismo: true, eucaristia: true, crisma: true },
    paisMatrimonio: true,
    familiaPastoral: false,
    necessidadeEspecial: false,
    dataInscricao: '2028-01-18',
    horaInscricao: '14:20:00',
    status: 'Matriculada',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    turmaId: 'tur-02',
    documentos: [
      { id: 'doc-3', tipo: 'Certidão de Nascimento', nomeArquivo: 'certidao_beatriz.pdf', url: '#', dataEnvio: '2028-01-18', status: 'Aprovado' },
      { id: 'doc-4', tipo: 'Certificado de Eucaristia', nomeArquivo: 'eucaristia_beatriz.pdf', url: '#', dataEnvio: '2028-01-18', status: 'Aprovado' }
    ],
    termoAceite: {
      aceito: true,
      dataHora: '2028-01-18 14:20:00',
      ip: '177.30.50.12',
      versaoTermo: '1.0 - IVC 2028'
    },
    historicoAuditoria: [
      { id: 'aud-3', inscritoId: 'ins-02', usuarioId: 'usr-sec', usuarioNome: 'Secretaria Catedral', usuarioPerfil: 'Secretaria', dataHora: '2028-01-18 14:20:00', campo: 'Status', valorAntigo: null, valorNovo: 'Aprovada', descricao: 'Documentos analisados e aprovados' }
    ]
  },
  {
    id: 'ins-03',
    protocolo: '2028-ADU-000003',
    nome: 'Luciano de Alencar Viana',
    dataNascimento: '1995-11-03',
    idadeCalculada: 32,
    modalidade: 'ADU',
    ondeNasceu: 'Picos - PI',
    endereco: 'Rua São Pedro, 890',
    bairro: 'Cabral',
    cidade: 'Teresina',
    telefone: '(86) 99455-8899',
    email: 'luciano.viana@gmail.com',
    batizado: true,
    localBatismo: 'Paróquia de Picos',
    dataBatismo: '1996-04-14',
    eucaristia: false,
    crisma: false,
    estadoCivil: 'Solteiro(a)',
    motivacao: 'Desejo receber o Sacramento do Matrimônio na Igreja Católica e aprofundar minha fé na comunidade.',
    familiaPastoral: false,
    necessidadeEspecial: false,
    dataInscricao: '2028-01-20',
    horaInscricao: '16:45:00',
    status: 'Turma definida',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    turmaId: 'tur-03',
    documentos: [
      { id: 'doc-5', tipo: 'RG / CPF', nomeArquivo: 'rg_luciano.pdf', url: '#', dataEnvio: '2028-01-20', status: 'Aprovado' },
      { id: 'doc-6', tipo: 'Comprovante de Residência', nomeArquivo: 'residencia_luciano.pdf', url: '#', dataEnvio: '2028-01-20', status: 'Aprovado' }
    ],
    termoAceite: {
      aceito: true,
      dataHora: '2028-01-20 16:45:00',
      ip: '201.12.80.4',
      versaoTermo: '1.0 - IVC 2028'
    },
    historicoAuditoria: []
  },
  {
    id: 'ins-04',
    protocolo: '2028-PRE-000004',
    nome: 'Helena Mendes Castro',
    dataNascimento: '2021-09-10',
    idadeCalculada: 6,
    modalidade: 'PRE',
    ondeNasceu: 'Teresina - PI',
    endereco: 'Rua Barão de Uruçuí, 102',
    bairro: 'Centro',
    cidade: 'Teresina',
    telefone: '(86) 99922-3344',
    email: 'helena.mae@gmail.com',
    batizado: true,
    localBatismo: 'Catedral de Teresina',
    dataBatismo: '2022-01-10',
    eucaristia: false,
    crisma: false,
    nomePai: 'Marcos Castro',
    telefonePai: '(86) 99922-3344',
    emailPai: 'marcos.castro@gmail.com',
    nomeMae: 'Lívia Mendes Castro',
    telefoneMae: '(86) 99922-3355',
    emailMae: 'livia.castro@gmail.com',
    paiSacramentos: { batismo: true, eucaristia: true, crisma: true },
    maeSacramentos: { batismo: true, eucaristia: true, crisma: true },
    paisMatrimonio: true,
    paisDivorciados: false,
    guardaDivorcio: '',
    preferenciasHorario: ['Domingo (10:00 às 11:00)'],
    familiaPastoral: true,
    qualPastoral: 'ECC - Encontro de Casais com Cristo',
    necessidadeEspecial: false,
    dataInscricao: '2028-01-22',
    horaInscricao: '09:30:00',
    status: 'Inscrição enviada',
    paroquiaId: 'par-01',
    comunidadeId: 'com-01',
    documentos: [],
    termoAceite: {
      aceito: true,
      dataHora: '2028-01-22 09:30:00',
      ip: '189.40.15.8',
      versaoTermo: '1.0 - IVC 2028'
    },
    historicoAuditoria: []
  }
];

const SEED_USUARIOS: UsuarioSistema[] = [
  { uid: 'usr-admin', nome: 'Wallison Angelim Medeiros (Coordenador)', email: 'wamedeiros@gmail.com', perfil: 'Administrador', paroquiaId: 'par-01', ativo: true },
  { uid: 'usr-sec', nome: 'Rosângela Ferreira (Secretária)', email: 'secretaria.saojose@gmail.com', perfil: 'Secretaria', paroquiaId: 'par-01', ativo: true },
  { uid: 'usr-coord', nome: 'Dra. Teresa Cristina (Coord. Catequese)', email: 'coord.saojose@gmail.com', perfil: 'Coordenador', paroquiaId: 'par-01', ativo: true },
  { uid: 'usr-cat', nome: 'Maria do Socorro Alves (Catequista)', email: 'socorro.catequese@gmail.com', perfil: 'Catequista', paroquiaId: 'par-01', turmasAtribuidas: ['tur-01', 'tur-04'], ativo: true }
];

// Barramento Reativo em Memória
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(cb => cb());
}

export function subscribeStorage(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Helpers de Leitura e Escrita LocalStorage
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Erro ao carregar chave ${key}:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notify();
  } catch (err) {
    console.error(`Erro ao salvar chave ${key}:`, err);
  }
}

// Inicializador
export function initStorage(): void {
  // Garantir a data de referência 30/04/2028
  const cfg = getItem<ConfigSistema>(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
  if (cfg.dataReferencia !== '2028-04-30') {
    setItem(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
  }

  localStorage.setItem(STORAGE_KEYS.PAROQUIAS, JSON.stringify(SEED_PAROQUIAS));
  localStorage.setItem(STORAGE_KEYS.COMUNIDADES, JSON.stringify(SEED_COMUNIDADES));
  localStorage.setItem(STORAGE_KEYS.CATEQUISTAS, JSON.stringify(SEED_CATEQUISTAS));
  localStorage.setItem(STORAGE_KEYS.TURMAS, JSON.stringify(SEED_TURMAS));
  if (!localStorage.getItem(STORAGE_KEYS.RESPONSAVEIS)) {
    localStorage.setItem(STORAGE_KEYS.RESPONSAVEIS, JSON.stringify(SEED_RESPONSAVEIS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INSCRITOS)) {
    localStorage.setItem(STORAGE_KEYS.INSCRITOS, JSON.stringify(SEED_INSCRITOS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USUARIOS)) {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(SEED_USUARIOS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
  }
}

// API DE DADOS

// Config
export function getConfig(): ConfigSistema {
  return getItem<ConfigSistema>(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
}

export function saveConfig(cfg: ConfigSistema): void {
  setItem(STORAGE_KEYS.CONFIG, cfg);
}

// Paróquias, Comunidades, Catequistas
export function getParoquias(): Paroquia[] {
  return getItem<Paroquia[]>(STORAGE_KEYS.PAROQUIAS, SEED_PAROQUIAS);
}

export function saveParoquia(paroquia: Paroquia): void {
  const paroquias = getParoquias();
  const index = paroquias.findIndex(p => p.id === paroquia.id);
  if (index >= 0) {
    paroquias[index] = paroquia;
  } else {
    paroquias.push(paroquia);
  }
  setItem(STORAGE_KEYS.PAROQUIAS, paroquias);
}

export function getComunidades(paroquiaId?: string): Comunidade[] {
  const comunidades = getItem<Comunidade[]>(STORAGE_KEYS.COMUNIDADES, SEED_COMUNIDADES);
  if (paroquiaId) {
    return comunidades.filter(c => c.paroquiaId === paroquiaId);
  }
  return comunidades;
}

export function saveComunidade(comunidade: Comunidade): void {
  const comunidades = getComunidades();
  const index = comunidades.findIndex(c => c.id === comunidade.id);
  if (index >= 0) {
    comunidades[index] = comunidade;
  } else {
    comunidades.push(comunidade);
  }
  setItem(STORAGE_KEYS.COMUNIDADES, comunidades);
}

export function getCatequistas(paroquiaId?: string): Catequista[] {
  const list = getItem<Catequista[]>(STORAGE_KEYS.CATEQUISTAS, SEED_CATEQUISTAS);
  const filtered = paroquiaId ? list.filter(c => c.paroquiaId === paroquiaId) : list;
  return filtered.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function saveCatequista(catequista: Catequista): void {
  const list = getItem<Catequista[]>(STORAGE_KEYS.CATEQUISTAS, SEED_CATEQUISTAS);
  const idx = list.findIndex(c => c.id === catequista.id);
  if (idx >= 0) {
    list[idx] = catequista;
  } else {
    list.push(catequista);
  }
  setItem(STORAGE_KEYS.CATEQUISTAS, list);
}

// Turmas
export function getTurmas(paroquiaId?: string): Turma[] {
  const turmas = getItem<Turma[]>(STORAGE_KEYS.TURMAS, SEED_TURMAS);
  const inscritos = getInscritos();

  // Recalcular ocupação real baseada estritamente nos inscritos alocados
  const turmasAtualizadas = turmas.map(t => {
    const ocupacaoReal = inscritos.filter(i => i.turmaId === t.id).length;
    const listaEspera = Math.max(0, ocupacaoReal - (t.vagasMaximas || 20));
    return {
      ...t,
      vagasOcupadas: ocupacaoReal,
      listaEsperaCount: listaEspera
    };
  });

  if (paroquiaId) {
    return turmasAtualizadas.filter(t => t.paroquiaId === paroquiaId);
  }
  return turmasAtualizadas;
}

export function saveTurma(turma: Turma): void {
  const turmas = getItem<Turma[]>(STORAGE_KEYS.TURMAS, SEED_TURMAS);
  const idx = turmas.findIndex(t => t.id === turma.id);
  if (idx >= 0) {
    turmas[idx] = turma;
  } else {
    turmas.push(turma);
  }
  setItem(STORAGE_KEYS.TURMAS, turmas);
}

export function deleteTurma(turmaId: string): void {
  const turmas = getItem<Turma[]>(STORAGE_KEYS.TURMAS, SEED_TURMAS);
  const novasturmas = turmas.filter(t => t.id !== turmaId);
  setItem(STORAGE_KEYS.TURMAS, novasturmas);

  // Desvincular inscritos da turma excluída
  const list = getItem<Inscrito[]>(STORAGE_KEYS.INSCRITOS, SEED_INSCRITOS);
  let modificado = false;
  list.forEach(i => {
    if (i.turmaId === turmaId) {
      delete i.turmaId;
      i.status = 'Matriculada';
      modificado = true;
    }
  });
  if (modificado) {
    setItem(STORAGE_KEYS.INSCRITOS, list);
  }
}

export function deleteCatequista(catequistaId: string): void {
  const list = getItem<Catequista[]>(STORAGE_KEYS.CATEQUISTAS, SEED_CATEQUISTAS);
  const novaLista = list.filter(c => c.id !== catequistaId);
  setItem(STORAGE_KEYS.CATEQUISTAS, novaLista);

  // Desvincular das turmas
  const turmas = getItem<Turma[]>(STORAGE_KEYS.TURMAS, SEED_TURMAS);
  let alterado = false;
  turmas.forEach(t => {
    if (t.catequistaId === catequistaId) {
      delete t.catequistaId;
      t.catequistaNome = t.catequistaSecundarioNome || 'A definir';
      delete t.catequistaSecundarioId;
      delete t.catequistaSecundarioNome;
      alterado = true;
    } else if (t.catequistaSecundarioId === catequistaId) {
      delete t.catequistaSecundarioId;
      delete t.catequistaSecundarioNome;
      alterado = true;
    }
  });
  if (alterado) {
    setItem(STORAGE_KEYS.TURMAS, turmas);
  }
}

// Responsáveis
export function getResponsaveis(): Responsavel[] {
  return getItem<Responsavel[]>(STORAGE_KEYS.RESPONSAVEIS, SEED_RESPONSAVEIS).filter(r => !r.deleted);
}

export function getResponsavelPorCPF(cpf: string): Responsavel | undefined {
  if (!cpf) return undefined;
  const cleanCPF = cpf.replace(/\D/g, '');
  if (!cleanCPF) return undefined;
  return getResponsaveis().find(r => r.cpf && r.cpf.replace(/\D/g, '') === cleanCPF);
}

export function saveResponsavel(resp: Responsavel): Responsavel {
  const list = getItem<Responsavel[]>(STORAGE_KEYS.RESPONSAVEIS, SEED_RESPONSAVEIS);
  const cleanCPF = resp.cpf ? resp.cpf.replace(/\D/g, '') : '';
  const cleanNome = resp.nome ? resp.nome.trim().toLowerCase() : '';
  const cleanTel = resp.telefone ? resp.telefone.replace(/\D/g, '') : '';

  let duplicate: Responsavel | undefined = undefined;

  if (resp.id) {
    duplicate = list.find(r => !r.deleted && r.id === resp.id);
  } else {
    if (cleanCPF) {
      duplicate = list.find(r => !r.deleted && r.cpf && r.cpf.replace(/\D/g, '') === cleanCPF);
    }
    if (!duplicate && cleanNome && cleanTel) {
      duplicate = list.find(r => !r.deleted && r.nome.trim().toLowerCase() === cleanNome && r.telefone && r.telefone.replace(/\D/g, '') === cleanTel);
    }
    if (!duplicate && cleanNome) {
      duplicate = list.find(r => !r.deleted && r.nome.trim().toLowerCase() === cleanNome);
    }
  }

  const now = new Date().toISOString();
  let finalResp: Responsavel;

  if (duplicate) {
    finalResp = {
      ...duplicate,
      nome: resp.nome || duplicate.nome,
      cpf: resp.cpf || duplicate.cpf || '',
      rg: resp.rg || duplicate.rg,
      telefone: resp.telefone || duplicate.telefone,
      whatsapp: resp.whatsapp || resp.telefone || duplicate.whatsapp,
      email: resp.email || duplicate.email,
      endereco: resp.endereco || duplicate.endereco,
      bairro: resp.bairro || duplicate.bairro,
      cidade: resp.cidade || duplicate.cidade,
      updatedAt: now
    };
    const idx = list.findIndex(r => r.id === duplicate.id);
    if (idx >= 0) list[idx] = finalResp;
  } else {
    finalResp = {
      ...resp,
      id: resp.id || `resp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      cpf: resp.cpf || '',
      createdAt: now,
      updatedAt: now
    };
    list.push(finalResp);
  }

  setItem(STORAGE_KEYS.RESPONSAVEIS, list);

  // Sincronizar alterações de dados com inscritos vinculados
  const inscritos = getItem<Inscrito[]>(STORAGE_KEYS.INSCRITOS, SEED_INSCRITOS);
  let inscritosAlterados = false;
  inscritos.forEach(i => {
    if (
      i.responsavelId === finalResp.id ||
      (cleanCPF && i.responsavel && i.responsavel.cpf && i.responsavel.cpf.replace(/\D/g, '') === cleanCPF) ||
      (i.responsavel && i.responsavel.nome && i.responsavel.nome.trim().toLowerCase() === cleanNome)
    ) {
      i.responsavel = finalResp;
      i.responsavelId = finalResp.id;
      inscritosAlterados = true;
    }
  });

  if (inscritosAlterados) {
    setItem(STORAGE_KEYS.INSCRITOS, inscritos);
  }

  return finalResp;
}

export function deleteResponsavel(id: string): void {
  const list = getItem<Responsavel[]>(STORAGE_KEYS.RESPONSAVEIS, SEED_RESPONSAVEIS);
  const idx = list.findIndex(r => r.id === id);
  if (idx >= 0) {
    list[idx].deleted = true;
    setItem(STORAGE_KEYS.RESPONSAVEIS, list);
  }

  // Desvincular das inscrições
  const inscritos = getItem<Inscrito[]>(STORAGE_KEYS.INSCRITOS, SEED_INSCRITOS);
  let modificado = false;
  inscritos.forEach(i => {
    if (i.responsavelId === id) {
      delete i.responsavelId;
      delete i.responsavel;
      modificado = true;
    }
  });
  if (modificado) {
    setItem(STORAGE_KEYS.INSCRITOS, inscritos);
  }
}

// Inscritos
export function getInscritos(): Inscrito[] {
  const items = getItem<Inscrito[]>(STORAGE_KEYS.INSCRITOS, SEED_INSCRITOS);
  let hasChanges = false;
  const migrated = items.map(i => {
    if ((i.estadoCivil as any) === 'Outro') {
      hasChanges = true;
      return { ...i, estadoCivil: 'Outro (divorciado(a), 2ª união, ...)' as const };
    }
    return i;
  });

  if (hasChanges) {
    setItem(STORAGE_KEYS.INSCRITOS, migrated);
  }

  return migrated.filter(i => !i.deleted);
}

export function getInscritoPorProtocolo(protocoloOuId: string): Inscrito | undefined {
  const cleanKey = protocoloOuId.trim().toUpperCase();
  return getInscritos().find(i => i.protocolo.toUpperCase() === cleanKey || i.id === protocoloOuId);
}

/**
 * Gerador do Número Automático de Matrícula/Protocolo: AAAA-MODALIDADE-000001
 */
export function gerarProximoProtocolo(modalidade: ModalidadeCatequese, ano: number = 2028): string {
  const inscritos = getItem<Inscrito[]>(STORAGE_KEYS.INSCRITOS, SEED_INSCRITOS);
  const prefixo = `${ano}-${modalidade}-`;
  
  const numeros = inscritos
    .map(i => i.protocolo)
    .filter(p => p && p.startsWith(prefixo))
    .map(p => {
      const parts = p.split('-');
      return parseInt(parts[2] || '0', 10);
    })
    .filter(n => !isNaN(n));

  const maxNum = numeros.length > 0 ? Math.max(...numeros) : 0;
  const proximo = maxNum + 1;
  const sufixo = String(proximo).padStart(6, '0');

  return `${prefixo}${sufixo}`;
}

export function salvarInscrito(
  data: Partial<Inscrito>,
  usuarioAtual: { uid: string; nome: string; perfil: any } = { uid: 'usr-public', nome: 'Auto-Inscrição Online', perfil: 'Secretaria' }
): Inscrito {
  const list = getItem<Inscrito[]>(STORAGE_KEYS.INSCRITOS, SEED_INSCRITOS);

  // Validação de duplicidade: não permitir dois inscritos com mesmo nome e mesma data de nascimento
  const nomeNorm = (data.nome || '').trim().toLowerCase();
  const dataNasc = data.dataNascimento;

  const duplicado = list.find(i =>
    !i.deleted &&
    i.id !== data.id &&
    i.nome.trim().toLowerCase() === nomeNorm &&
    i.dataNascimento === dataNasc
  );

  if (duplicado) {
    throw new Error(`Já existe uma inscrição registrada para ${data.nome} com a data de nascimento ${dataNasc} (Protocolo: ${duplicado.protocolo}).`);
  }

  const now = new Date();
  const dataStr = now.toISOString().split('T')[0];
  const horaStr = now.toTimeString().split(' ')[0];

  let finalInscrito: Inscrito;

  if (data.id) {
    const existingIdx = list.findIndex(i => i.id === data.id);
    if (existingIdx < 0) {
      throw new Error('Inscrição não encontrada para atualização.');
    }
    const old = list[existingIdx];

    // Registrar histórico de alteração
    const auditoriaNova: RegistroAuditoria = {
      id: `aud-${Date.now()}`,
      inscritoId: old.id,
      usuarioId: usuarioAtual.uid,
      usuarioNome: usuarioAtual.nome,
      usuarioPerfil: usuarioAtual.perfil,
      dataHora: `${dataStr} ${horaStr}`,
      campo: 'Atualização Cadastral',
      valorAntigo: old.status,
      valorNovo: data.status || old.status,
      descricao: `Alteração realizada por ${usuarioAtual.nome}`
    };

    finalInscrito = {
      ...old,
      ...data,
      estadoCivil: (data.estadoCivil as any) === 'Outro' ? 'Outro (divorciado(a), 2ª união, ...)' : (data.estadoCivil ?? old.estadoCivil),
      historicoAuditoria: [auditoriaNova, ...(old.historicoAuditoria || [])]
    } as Inscrito;

    list[existingIdx] = finalInscrito;
  } else {
    // Nova Inscrição
    const config = getConfig();
    const protocolo = gerarProximoProtocolo(data.modalidade || 'EUC', config.anoPastoralAtual);

    const auditoriaInicial: RegistroAuditoria = {
      id: `aud-${Date.now()}`,
      usuarioId: usuarioAtual.uid,
      usuarioNome: usuarioAtual.nome,
      usuarioPerfil: usuarioAtual.perfil,
      dataHora: `${dataStr} ${horaStr}`,
      campo: 'Inscrição Criada',
      valorAntigo: null,
      valorNovo: data.status || 'Inscrição enviada',
      descricao: 'Cadastro inicial de inscrição realizado no sistema'
    };

    finalInscrito = {
      id: `ins-${Date.now()}`,
      protocolo,
      nome: data.nome || '',
      dataNascimento: data.dataNascimento || '',
      idadeCalculada: data.idadeCalculada || 0,
      modalidade: data.modalidade || 'EUC',
      ondeNasceu: data.ondeNasceu || 'Teresina - PI',
      endereco: data.endereco || '',
      bairro: data.bairro || 'Centro',
      cidade: data.cidade || 'Teresina',
      telefone: data.telefone || '',
      email: data.email || '',

      batizado: !!data.batizado,
      localBatismo: data.localBatismo || '',
      dataBatismo: data.dataBatismo || '',
      eucaristia: !!data.eucaristia,
      localEucaristia: data.localEucaristia || '',
      dataEucaristia: data.dataEucaristia || '',
      crisma: !!data.crisma,

      estadoCivil: (data.estadoCivil as any) === 'Outro' ? 'Outro (divorciado(a), 2ª união, ...)' : data.estadoCivil,
      motivacao: data.motivacao,

      responsavelId: data.responsavelId,
      nomePai: data.nomePai || '',
      telefonePai: data.telefonePai || '',
      emailPai: data.emailPai || '',
      nomeMae: data.nomeMae || '',
      telefoneMae: data.telefoneMae || '',
      emailMae: data.emailMae || '',
      paiSacramentos: data.paiSacramentos || { batismo: false, eucaristia: false, crisma: false },
      maeSacramentos: data.maeSacramentos || { batismo: false, eucaristia: false, crisma: false },
      paisMatrimonio: !!data.paisMatrimonio,
      ondeMatrimonioPais: data.ondeMatrimonioPais || '',
      paisDivorciados: !!data.paisDivorciados,
      guardaDivorcio: data.guardaDivorcio || '',
      autorizaFotos: data.autorizaFotos !== false,
      preferenciasHorario: data.preferenciasHorario || [],

      familiaPastoral: !!data.familiaPastoral,
      qualPastoral: data.qualPastoral || '',

      necessidadeEspecial: !!data.necessidadeEspecial,
      qualNecessidade: data.qualNecessidade || '',

      observacoes: data.observacoes || '',

      dataInscricao: dataStr,
      horaInscricao: horaStr,
      status: data.status || 'Inscrição enviada',

      paroquiaId: data.paroquiaId || 'par-01',
      comunidadeId: data.comunidadeId || 'com-01',
      turmaId: data.turmaId,

      documentos: data.documentos || [],
      termoAceite: data.termoAceite || {
        aceito: true,
        dataHora: `${dataStr} ${horaStr}`,
        ip: '127.0.0.1',
        versaoTermo: '1.0'
      },

      historicoAuditoria: [auditoriaInicial]
    };

    list.push(finalInscrito);
  }

  // Recalcular vagas das turmas se vinculou a uma turma
  if (finalInscrito.turmaId) {
    recalcularVagasTurma(finalInscrito.turmaId);
  }

  setItem(STORAGE_KEYS.INSCRITOS, list);
  return finalInscrito;
}

// Exclusão Lógica e Definitiva
export function excluirInscritoLógico(
  id: string,
  usuarioAtual: { uid: string; nome: string; perfil: any }
): void {
  const list = getItem<Inscrito[]>(STORAGE_KEYS.INSCRITOS, SEED_INSCRITOS);
  const idx = list.findIndex(i => i.id === id);
  if (idx >= 0) {
    const target = list[idx];
    target.deleted = true;
    if (!target.historicoAuditoria) {
      target.historicoAuditoria = [];
    }
    target.historicoAuditoria.unshift({
      id: `aud-${Date.now()}`,
      inscritoId: target.id,
      usuarioId: usuarioAtual.uid,
      usuarioNome: usuarioAtual.nome,
      usuarioPerfil: usuarioAtual.perfil,
      dataHora: new Date().toLocaleString('pt-BR'),
      campo: 'Exclusão',
      valorAntigo: 'Ativo',
      valorNovo: 'Excluído',
      descricao: 'Registro de inscrito excluído do sistema'
    });
    list[idx] = target;
    if (target.turmaId) {
      recalcularVagasTurma(target.turmaId);
    }
    setItem(STORAGE_KEYS.INSCRITOS, list);
  }
}

export function registrarAuditoriaStandalone(log: RegistroAuditoria): void {
  const standalone = getItem<RegistroAuditoria[]>(STORAGE_KEYS.AUDITORIA, []);
  standalone.unshift(log);
  setItem(STORAGE_KEYS.AUDITORIA, standalone);
}

export function excluirInscritoDefinitivo(
  id: string,
  usuarioAtual?: { uid: string; nome: string; perfil: any }
): void {
  const list = getItem<Inscrito[]>(STORAGE_KEYS.INSCRITOS, SEED_INSCRITOS);
  const target = list.find(i => i.id === id);
  if (target) {
    if (usuarioAtual) {
      registrarAuditoriaStandalone({
        id: `aud-${Date.now()}`,
        inscritoId: target.id,
        usuarioId: usuarioAtual.uid,
        usuarioNome: usuarioAtual.nome,
        usuarioPerfil: usuarioAtual.perfil,
        dataHora: new Date().toLocaleString('pt-BR'),
        campo: 'Exclusão',
        valorAntigo: `${target.nome} (${target.protocolo})`,
        valorNovo: 'Excluído Definitivamente',
        descricao: `Inscrição de ${target.nome} (Protocolo: ${target.protocolo}) foi excluída permanentemente do sistema.`
      });
    }
    const novaLista = list.filter(i => i.id !== id);
    setItem(STORAGE_KEYS.INSCRITOS, novaLista);
    if (target.turmaId) {
      recalcularVagasTurma(target.turmaId);
    }
  }
}

// Função para Recalcular Vagas da Turma
export function recalcularVagasTurma(turmaId: string): void {
  const turmas = getTurmas();
  const idx = turmas.findIndex(t => t.id === turmaId);
  if (idx >= 0) {
    const inscritos = getInscritos().filter(i => i.turmaId === turmaId);
    const turma = turmas[idx];
    turma.vagasOcupadas = inscritos.length;
    
    if (turma.vagasOcupadas > turma.vagasMaximas) {
      turma.listaEsperaCount = turma.vagasOcupadas - turma.vagasMaximas;
    } else {
      turma.listaEsperaCount = 0;
    }
    turmas[idx] = turma;
    setItem(STORAGE_KEYS.TURMAS, turmas);
  }
}

// Audit Trail Global
export function limparAuditoria(): void {
  setItem(STORAGE_KEYS.AUDITORIA, []);
  const list = getItem<Inscrito[]>(STORAGE_KEYS.INSCRITOS, SEED_INSCRITOS);
  list.forEach(i => {
    i.historicoAuditoria = [];
  });
  setItem(STORAGE_KEYS.INSCRITOS, list);
}

export function deleteRegistroAuditoria(audId: string): void {
  // Remover de standalone AUDITORIA
  const standalone = getItem<RegistroAuditoria[]>(STORAGE_KEYS.AUDITORIA, []);
  const novaStandalone = standalone.filter(a => a.id !== audId);
  setItem(STORAGE_KEYS.AUDITORIA, novaStandalone);

  // Remover de inscritos
  const inscritos = getItem<Inscrito[]>(STORAGE_KEYS.INSCRITOS, SEED_INSCRITOS);
  let alterado = false;
  inscritos.forEach(i => {
    if (i.historicoAuditoria && i.historicoAuditoria.some(a => a.id === audId)) {
      i.historicoAuditoria = i.historicoAuditoria.filter(a => a.id !== audId);
      alterado = true;
    }
  });
  if (alterado) {
    setItem(STORAGE_KEYS.INSCRITOS, inscritos);
  }
}

export function getAuditoriaGlobal(): RegistroAuditoria[] {
  const standalone = getItem<RegistroAuditoria[]>(STORAGE_KEYS.AUDITORIA, []);
  const inscritos = getItem<Inscrito[]>(STORAGE_KEYS.INSCRITOS, SEED_INSCRITOS);
  const allLogs: RegistroAuditoria[] = [...standalone];

  inscritos.forEach(i => {
    if (i.historicoAuditoria) {
      allLogs.push(...i.historicoAuditoria);
    }
  });

  return allLogs.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
}

// Usuários do Sistema
export function getUsuariosSistema(): UsuarioSistema[] {
  return getItem<UsuarioSistema[]>(STORAGE_KEYS.USUARIOS, SEED_USUARIOS);
}

export function saveUsuarioSistema(usr: UsuarioSistema): UsuarioSistema {
  const list = getItem<UsuarioSistema[]>(STORAGE_KEYS.USUARIOS, SEED_USUARIOS);
  const finalUsr = {
    ...usr,
    uid: usr.uid || `usr-${Date.now()}`
  };
  const idx = list.findIndex(u => u.uid === finalUsr.uid);
  if (idx >= 0) {
    list[idx] = finalUsr;
  } else {
    list.push(finalUsr);
  }
  setItem(STORAGE_KEYS.USUARIOS, list);
  return finalUsr;
}

export function deleteUsuarioSistema(uid: string): void {
  const list = getItem<UsuarioSistema[]>(STORAGE_KEYS.USUARIOS, SEED_USUARIOS);
  const novaLista = list.filter(u => u.uid !== uid);
  setItem(STORAGE_KEYS.USUARIOS, novaLista);
}
