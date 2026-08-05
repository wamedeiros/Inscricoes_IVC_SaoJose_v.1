import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
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
  ModalidadeCatequese,
  PublicComprovanteDTO
} from '../types';
import { DEFAULT_CONFIG } from './config';

// Helper para remover valores `undefined` antes de enviar ao Firestore
function cleanUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanUndefined) as unknown as T;
  const res: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      res[key] = cleanUndefined(val);
    }
  }
  return res as T;
}

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
    turmaId: 'tur-euc-dom',
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
      { id: 'aud-2', inscritoId: 'ins-01', usuarioId: 'usr-sec', usuarioNome: 'Secretaria Catedral', usuarioPerfil: 'Secretaria', dataHora: '2028-01-16 11:00:00', campo: 'Turma', valorAntigo: null, valorNovo: 'Eucaristia - Domingo', descricao: 'Atribuído à turma pelo coordenador' }
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
    turmaId: 'tur-cri-dom',
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
  }
];

const SEED_USUARIOS: UsuarioSistema[] = [
  { uid: 'usr-admin', nome: 'Wallison Angelim Medeiros (Coordenador)', email: 'wamedeiros@gmail.com', perfil: 'Administrador', paroquiaId: 'par-01', ativo: true },
  { uid: 'usr-sec', nome: 'Rosângela Ferreira (Secretária)', email: 'secretaria.saojose@gmail.com', perfil: 'Secretaria', paroquiaId: 'par-01', ativo: true },
  { uid: 'usr-coord', nome: 'Dra. Teresa Cristina (Coord. Catequese)', email: 'coord.saojose@gmail.com', perfil: 'Coordenador', paroquiaId: 'par-01', ativo: true },
  { uid: 'usr-cat', nome: 'Maria do Socorro Alves (Catequista)', email: 'socorro.catequese@gmail.com', perfil: 'Catequista', paroquiaId: 'par-01', turmasAtribuidas: ['tur-pre-dom', 'tur-euc-dom'], ativo: true }
];

// Cache local sincronizado em tempo real com o Firestore
let cachedInscritos: Inscrito[] = [];
let cachedResponsaveis: Responsavel[] = [];
let cachedParoquias: Paroquia[] = [];
let cachedComunidades: Comunidade[] = [];
let cachedCatequistas: Catequista[] = [];
let cachedTurmas: Turma[] = [];
let cachedUsuarios: UsuarioSistema[] = [];
let cachedAuditoria: RegistroAuditoria[] = [];
let cachedConfig: ConfigSistema = DEFAULT_CONFIG;

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

let isInitialized = false;

/**
 * Inicializador da Conexão em Tempo Real com Firestore
 * Conecta-se às coleções remotas e sincroniza os dados no dispositivo
 */
export function initStorage(): void {
  if (isInitialized) return;
  isInitialized = true;

  // Realtime listener em 'config'
  onSnapshot(doc(db, 'config', 'default'), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as ConfigSistema;
      cachedConfig = {
        ...DEFAULT_CONFIG,
        ...data,
        inscricoesAbertas: data.inscricoesAbertas !== undefined ? data.inscricoesAbertas : true
      };
    } else {
      setDoc(doc(db, 'config', 'default'), cleanUndefined(DEFAULT_CONFIG));
      cachedConfig = DEFAULT_CONFIG;
    }
    notify();
  }, (err) => console.error('Erro Firestore config:', err));

  // Realtime listener em 'paroquias'
  onSnapshot(collection(db, 'paroquias'), (snapshot) => {
    if (snapshot.empty) {
      SEED_PAROQUIAS.forEach(p => setDoc(doc(db, 'paroquias', p.id), cleanUndefined(p)));
    } else {
      cachedParoquias = snapshot.docs.map(d => d.data() as Paroquia);
    }
    notify();
  }, (err) => console.error('Erro Firestore paroquias:', err));

  // Realtime listener em 'comunidades'
  onSnapshot(collection(db, 'comunidades'), (snapshot) => {
    if (snapshot.empty) {
      SEED_COMUNIDADES.forEach(c => setDoc(doc(db, 'comunidades', c.id), cleanUndefined(c)));
    } else {
      cachedComunidades = snapshot.docs.map(d => d.data() as Comunidade);
    }
    notify();
  }, (err) => console.error('Erro Firestore comunidades:', err));

  // Realtime listener em 'catequistas'
  onSnapshot(collection(db, 'catequistas'), (snapshot) => {
    if (snapshot.empty) {
      SEED_CATEQUISTAS.forEach(c => setDoc(doc(db, 'catequistas', c.id), cleanUndefined(c)));
    } else {
      cachedCatequistas = snapshot.docs.map(d => d.data() as Catequista);
    }
    notify();
  }, (err) => console.error('Erro Firestore catequistas:', err));

  // Realtime listener em 'turmas'
  onSnapshot(collection(db, 'turmas'), (snapshot) => {
    if (snapshot.empty) {
      SEED_TURMAS.forEach(t => setDoc(doc(db, 'turmas', t.id), cleanUndefined(t)));
    } else {
      cachedTurmas = snapshot.docs.map(d => d.data() as Turma);
    }
    notify();
  }, (err) => console.error('Erro Firestore turmas:', err));

  // Realtime listener em 'responsaveis'
  onSnapshot(collection(db, 'responsaveis'), (snapshot) => {
    if (snapshot.empty) {
      SEED_RESPONSAVEIS.forEach(r => setDoc(doc(db, 'responsaveis', r.id), cleanUndefined(r)));
    } else {
      cachedResponsaveis = snapshot.docs.map(d => d.data() as Responsavel);
    }
    notify();
  }, (err) => console.error('Erro Firestore responsaveis:', err));

  // Realtime listener em 'inscritos'
  onSnapshot(collection(db, 'inscritos'), (snapshot) => {
    if (snapshot.empty) {
      SEED_INSCRITOS.forEach(i => setDoc(doc(db, 'inscritos', i.id), cleanUndefined(i)));
    } else {
      cachedInscritos = snapshot.docs.map(d => d.data() as Inscrito);
    }
    notify();
  }, (err) => console.error('Erro Firestore inscritos:', err));

  // Realtime listener em 'usuarios'
  onSnapshot(collection(db, 'usuarios'), (snapshot) => {
    if (snapshot.empty) {
      SEED_USUARIOS.forEach(u => setDoc(doc(db, 'usuarios', u.uid), cleanUndefined(u)));
    } else {
      cachedUsuarios = snapshot.docs.map(d => d.data() as UsuarioSistema);
    }
    notify();
  }, (err) => console.error('Erro Firestore usuarios:', err));

  // Realtime listener em 'auditoria'
  onSnapshot(collection(db, 'auditoria'), (snapshot) => {
    cachedAuditoria = snapshot.docs.map(d => d.data() as RegistroAuditoria);
    notify();
  }, (err) => console.error('Erro Firestore auditoria:', err));
}

// Configuração do Sistema
export function getConfig(): ConfigSistema {
  return cachedConfig;
}

export function saveConfig(cfg: ConfigSistema): void {
  cachedConfig = cfg;
  setDoc(doc(db, 'config', 'default'), cleanUndefined(cfg)).catch(err => console.error('Erro ao salvar config no Firestore:', err));
  notify();
}

// Paróquias, Comunidades e Catequistas
export function getParoquias(): Paroquia[] {
  return cachedParoquias;
}

export function saveParoquia(paroquia: Paroquia): void {
  const index = cachedParoquias.findIndex(p => p.id === paroquia.id);
  if (index >= 0) {
    cachedParoquias[index] = paroquia;
  } else {
    cachedParoquias.push(paroquia);
  }
  setDoc(doc(db, 'paroquias', paroquia.id), cleanUndefined(paroquia)).catch(err => console.error('Erro ao salvar paróquia no Firestore:', err));
  notify();
}

export function getComunidades(paroquiaId?: string): Comunidade[] {
  if (paroquiaId) {
    return cachedComunidades.filter(c => c.paroquiaId === paroquiaId);
  }
  return cachedComunidades;
}

export function saveComunidade(comunidade: Comunidade): void {
  const index = cachedComunidades.findIndex(c => c.id === comunidade.id);
  if (index >= 0) {
    cachedComunidades[index] = comunidade;
  } else {
    cachedComunidades.push(comunidade);
  }
  setDoc(doc(db, 'comunidades', comunidade.id), cleanUndefined(comunidade)).catch(err => console.error('Erro ao salvar comunidade no Firestore:', err));
  notify();
}

export function getCatequistas(paroquiaId?: string): Catequista[] {
  const filtered = paroquiaId ? cachedCatequistas.filter(c => c.paroquiaId === paroquiaId) : cachedCatequistas;
  return filtered.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function saveCatequista(catequista: Catequista): void {
  const idx = cachedCatequistas.findIndex(c => c.id === catequista.id);
  if (idx >= 0) {
    cachedCatequistas[idx] = catequista;
  } else {
    cachedCatequistas.push(catequista);
  }
  setDoc(doc(db, 'catequistas', catequista.id), cleanUndefined(catequista)).catch(err => console.error('Erro ao salvar catequista no Firestore:', err));
  notify();
}

export function deleteCatequista(catequistaId: string): void {
  cachedCatequistas = cachedCatequistas.filter(c => c.id !== catequistaId);
  deleteDoc(doc(db, 'catequistas', catequistaId)).catch(err => console.error('Erro ao excluir catequista do Firestore:', err));

  // Desvincular das turmas
  cachedTurmas.forEach(t => {
    if (t.catequistaId === catequistaId) {
      delete t.catequistaId;
      t.catequistaNome = t.catequistaSecundarioNome || 'A definir';
      delete t.catequistaSecundarioId;
      delete t.catequistaSecundarioNome;
      setDoc(doc(db, 'turmas', t.id), cleanUndefined(t));
    } else if (t.catequistaSecundarioId === catequistaId) {
      delete t.catequistaSecundarioId;
      delete t.catequistaSecundarioNome;
      setDoc(doc(db, 'turmas', t.id), cleanUndefined(t));
    }
  });
  notify();
}

// Turmas
export function getTurmas(paroquiaId?: string): Turma[] {
  const inscritos = getInscritos();
  const turmasAtualizadas = cachedTurmas.map(t => {
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
  const idx = cachedTurmas.findIndex(t => t.id === turma.id);
  if (idx >= 0) {
    cachedTurmas[idx] = turma;
  } else {
    cachedTurmas.push(turma);
  }
  setDoc(doc(db, 'turmas', turma.id), cleanUndefined(turma)).catch(err => console.error('Erro ao salvar turma no Firestore:', err));
  notify();
}

export function deleteTurma(turmaId: string): void {
  cachedTurmas = cachedTurmas.filter(t => t.id !== turmaId);
  deleteDoc(doc(db, 'turmas', turmaId)).catch(err => console.error('Erro ao excluir turma do Firestore:', err));

  // Desvincular inscritos da turma excluída
  cachedInscritos.forEach(i => {
    if (i.turmaId === turmaId) {
      delete i.turmaId;
      i.status = 'Matriculada';
      setDoc(doc(db, 'inscritos', i.id), cleanUndefined(i));
    }
  });
  notify();
}

// Responsáveis
export function getResponsaveis(): Responsavel[] {
  return cachedResponsaveis.filter(r => !r.deleted);
}

export function getResponsavelPorCPF(cpf: string): Responsavel | undefined {
  if (!cpf) return undefined;
  const cleanCPF = cpf.replace(/\D/g, '');
  if (!cleanCPF) return undefined;
  return getResponsaveis().find(r => r.cpf && r.cpf.replace(/\D/g, '') === cleanCPF);
}

export function saveResponsavel(resp: Responsavel): Responsavel {
  const list = cachedResponsaveis;
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

  setDoc(doc(db, 'responsaveis', finalResp.id), cleanUndefined(finalResp)).catch(err => console.error('Erro ao salvar responsável no Firestore:', err));

  // Sincronizar alterações com inscritos vinculados
  cachedInscritos.forEach(i => {
    if (
      i.responsavelId === finalResp.id ||
      (cleanCPF && i.responsavel && i.responsavel.cpf && i.responsavel.cpf.replace(/\D/g, '') === cleanCPF) ||
      (i.responsavel && i.responsavel.nome && i.responsavel.nome.trim().toLowerCase() === cleanNome)
    ) {
      i.responsavel = finalResp;
      i.responsavelId = finalResp.id;
      setDoc(doc(db, 'inscritos', i.id), cleanUndefined(i));
    }
  });

  notify();
  return finalResp;
}

export function deleteResponsavel(id: string): void {
  const idx = cachedResponsaveis.findIndex(r => r.id === id);
  if (idx >= 0) {
    cachedResponsaveis[idx].deleted = true;
    setDoc(doc(db, 'responsaveis', id), cleanUndefined(cachedResponsaveis[idx]));
  }

  // Desvincular das inscrições
  cachedInscritos.forEach(i => {
    if (i.responsavelId === id) {
      delete i.responsavelId;
      delete i.responsavel;
      setDoc(doc(db, 'inscritos', i.id), cleanUndefined(i));
    }
  });

  notify();
}

// Inscrições
export function getInscritos(): Inscrito[] {
  return cachedInscritos.filter(i => !i.deleted);
}

export function getInscritoPorProtocolo(protocoloOuId: string): Inscrito | undefined {
  const cleanKey = protocoloOuId.trim().toUpperCase();
  return getInscritos().find(i => i.protocolo.toUpperCase() === cleanKey || i.id === protocoloOuId);
}

export async function getInscritoPorProtocoloAsync(protocoloOuId: string): Promise<Inscrito | undefined> {
  const local = getInscritoPorProtocolo(protocoloOuId);
  if (local) return local;

  const cleanKey = protocoloOuId.trim().toUpperCase();
  try {
    const q = query(collection(db, 'inscritos'), where('protocolo', '==', cleanKey));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Inscrito;
    }
  } catch (err) {
    console.error('Erro ao consultar protocolo no Firestore:', err);
  }
  return undefined;
}

/**
 * Consulta Pública de Validação do Comprovante (DTO restrito com LGPD)
 * Retorna exclusivamente: Nome, Protocolo, Status e Data da Inscrição.
 */
export function validarComprovantePublico(protocoloOuId: string): PublicComprovanteDTO | null {
  const cleanKey = protocoloOuId.trim().toUpperCase();
  const inscrito = getInscritos().find(i => i.protocolo.toUpperCase() === cleanKey || i.id === protocoloOuId);
  if (!inscrito) return null;
  return {
    nome: inscrito.nome,
    protocolo: inscrito.protocolo,
    status: inscrito.status,
    dataInscricao: inscrito.dataInscricao
  };
}

export async function validarComprovantePublicoAsync(protocoloOuId: string): Promise<PublicComprovanteDTO | null> {
  const local = validarComprovantePublico(protocoloOuId);
  if (local) return local;

  const ins = await getInscritoPorProtocoloAsync(protocoloOuId);
  if (!ins) return null;
  return {
    nome: ins.nome,
    protocolo: ins.protocolo,
    status: ins.status,
    dataInscricao: ins.dataInscricao
  };
}

/**
 * Gerador do Número Automático de Matrícula/Protocolo: AAAA-MODALIDADE-000001
 */
export function gerarProximoProtocolo(modalidade: ModalidadeCatequese, ano: number = 2028): string {
  const list = cachedInscritos;
  const prefixo = `${ano}-${modalidade}-`;
  
  const numeros = list
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
  const list = cachedInscritos;

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

  // Persistir no Firestore
  setDoc(doc(db, 'inscritos', finalInscrito.id), cleanUndefined(finalInscrito)).catch(err => console.error('Erro ao salvar inscrito no Firestore:', err));

  if (finalInscrito.turmaId) {
    recalcularVagasTurma(finalInscrito.turmaId);
  }

  notify();
  return finalInscrito;
}

export function excluirInscritoLógico(
  id: string,
  usuarioAtual: { uid: string; nome: string; perfil: any }
): void {
  const idx = cachedInscritos.findIndex(i => i.id === id);
  if (idx >= 0) {
    const target = cachedInscritos[idx];
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
    cachedInscritos[idx] = target;
    setDoc(doc(db, 'inscritos', id), cleanUndefined(target)).catch(err => console.error('Erro ao excluir lógico no Firestore:', err));

    if (target.turmaId) {
      recalcularVagasTurma(target.turmaId);
    }
    notify();
  }
}

export function registrarAuditoriaStandalone(log: RegistroAuditoria): void {
  cachedAuditoria.unshift(log);
  setDoc(doc(db, 'auditoria', log.id), cleanUndefined(log)).catch(err => console.error('Erro ao salvar auditoria no Firestore:', err));
  notify();
}

export function excluirInscritoDefinitivo(
  id: string,
  usuarioAtual?: { uid: string; nome: string; perfil: any }
): void {
  const target = cachedInscritos.find(i => i.id === id);
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
    cachedInscritos = cachedInscritos.filter(i => i.id !== id);
    deleteDoc(doc(db, 'inscritos', id)).catch(err => console.error('Erro ao excluir definitivo no Firestore:', err));

    if (target.turmaId) {
      recalcularVagasTurma(target.turmaId);
    }
    notify();
  }
}

export function recalcularVagasTurma(turmaId: string): void {
  const turmas = cachedTurmas;
  const idx = turmas.findIndex(t => t.id === turmaId);
  if (idx >= 0) {
    const inscritos = getInscritos().filter(i => i.turmaId === turmaId);
    const turma = turmas[idx];
    turma.vagasOcupadas = inscritos.length;
    turma.listaEsperaCount = Math.max(0, turma.vagasOcupadas - (turma.vagasMaximas || 20));
    turmas[idx] = turma;
    setDoc(doc(db, 'turmas', turmaId), cleanUndefined(turma)).catch(err => console.error('Erro ao recalcular turma no Firestore:', err));
  }
}

export function limparAuditoria(): void {
  cachedAuditoria.forEach(a => deleteDoc(doc(db, 'auditoria', a.id)));
  cachedAuditoria = [];

  cachedInscritos.forEach(i => {
    i.historicoAuditoria = [];
    setDoc(doc(db, 'inscritos', i.id), cleanUndefined(i));
  });
  notify();
}

export function deleteRegistroAuditoria(audId: string): void {
  cachedAuditoria = cachedAuditoria.filter(a => a.id !== audId);
  deleteDoc(doc(db, 'auditoria', audId)).catch(err => console.error('Erro ao excluir auditoria do Firestore:', err));

  cachedInscritos.forEach(i => {
    if (i.historicoAuditoria && i.historicoAuditoria.some(a => a.id === audId)) {
      i.historicoAuditoria = i.historicoAuditoria.filter(a => a.id !== audId);
      setDoc(doc(db, 'inscritos', i.id), cleanUndefined(i));
    }
  });
  notify();
}

export function getAuditoriaGlobal(): RegistroAuditoria[] {
  const allLogs: RegistroAuditoria[] = [...cachedAuditoria];

  cachedInscritos.forEach(i => {
    if (i.historicoAuditoria) {
      allLogs.push(...i.historicoAuditoria);
    }
  });

  return allLogs.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
}

export function getUsuariosSistema(): UsuarioSistema[] {
  return cachedUsuarios;
}

export function saveUsuarioSistema(usr: UsuarioSistema): UsuarioSistema {
  const finalUsr = {
    ...usr,
    uid: usr.uid || `usr-${Date.now()}`
  };
  const idx = cachedUsuarios.findIndex(u => u.uid === finalUsr.uid);
  if (idx >= 0) {
    cachedUsuarios[idx] = finalUsr;
  } else {
    cachedUsuarios.push(finalUsr);
  }
  setDoc(doc(db, 'usuarios', finalUsr.uid), cleanUndefined(finalUsr)).catch(err => console.error('Erro ao salvar usuário no Firestore:', err));
  notify();
  return finalUsr;
}

export function deleteUsuarioSistema(uid: string): void {
  cachedUsuarios = cachedUsuarios.filter(u => u.uid !== uid);
  deleteDoc(doc(db, 'usuarios', uid)).catch(err => console.error('Erro ao excluir usuário no Firestore:', err));
  notify();
}
