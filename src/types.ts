/**
 * Tipos e Interfaces do Sistema de Gestão da Catequese (IVC)
 * Arquidiocese de Teresina
 */

export type ModalidadeCatequese = 'PRE' | 'EUC' | 'PER' | 'CRI' | 'ADU';

export const MODALIDADE_NAMES: Record<ModalidadeCatequese, string> = {
  PRE: 'Pré-Catequese (2 a 6 anos)',
  EUC: 'Eucaristia (7 a 13 anos)',
  PER: 'Perseverança (7 a 13 anos)',
  CRI: 'Catecumenato Crismal - Crisma Jovem (14 a 18 anos)',
  ADU: 'Catecumenato Adulto (A partir de 19 anos)'
};

export const MODALIDADE_SIGLAS: Record<ModalidadeCatequese, string> = {
  PRE: 'PRE',
  EUC: 'EUC',
  PER: 'PER',
  CRI: 'CRI',
  ADU: 'ADU'
};

export type StatusInscricao =
  | 'Inscrição enviada'
  | 'Documentos pendentes'
  | 'Matriculada'
  | 'Turma definida';

export type PerfilUsuario =
  | 'Administrador'
  | 'Secretaria'
  | 'Coordenador'
  | 'Catequista';

export interface Responsavel {
  id: string;
  nome: string;
  cpf?: string;
  rg?: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

export interface DocumentoAnexo {
  id: string;
  tipo: 'Certidão de Nascimento' | 'Certificado de Batismo' | 'Certificado de Eucaristia' | 'Certificado de Crisma' | 'Comprovante de Residência' | 'RG / CPF' | 'Outro';
  nomeArquivo: string;
  url: string;
  dataEnvio: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  observacao?: string;
}

export interface SacramentosPais {
  batismo: boolean;
  eucaristia: boolean;
  crisma: boolean;
}

export interface TermoAceiteLGPD {
  aceito: boolean;
  dataHora: string;
  ip: string;
  versaoTermo: string;
}

export interface RegistroAuditoria {
  id: string;
  inscritoId?: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioPerfil: PerfilUsuario;
  dataHora: string;
  campo: string;
  valorAntigo?: string | null;
  valorNovo?: string | null;
  descricao: string;
}

export interface Inscrito {
  id: string;
  protocolo: string; // Ex: 2028-EUC-000001
  nome: string;
  dataNascimento: string; // YYYY-MM-DD
  idadeCalculada: number;
  modalidade: ModalidadeCatequese;
  ondeNasceu: string; // Naturalidade
  endereco: string;
  bairro?: string;
  cidade?: string;
  telefone: string;
  email: string;

  // Sacramentos do inscrito
  batizado: boolean;
  localBatismo?: string;
  dataBatismo?: string;
  eucaristia: boolean;
  localEucaristia?: string;
  dataEucaristia?: string;
  crisma: boolean;

  // Campos específicos para Adulto
  estadoCivil?: 'Solteiro(a)' | 'Casado(a) no Civil' | 'Celebrou Matrimônio Religioso' | 'Viúvo(a)' | 'Outro';
  motivacao?: string;

  // Dados dos Responsáveis / Pais (Pai e Mãe são obrigatórios para menores e vêm antes do responsável legal)
  responsavelId?: string;
  responsavel?: Responsavel;
  nomePai?: string;
  telefonePai?: string;
  emailPai?: string;
  nomeMae?: string;
  telefoneMae?: string;
  emailMae?: string;
  paiSacramentos?: SacramentosPais;
  maeSacramentos?: SacramentosPais;
  paisMatrimonio?: boolean;
  ondeMatrimonioPais?: string;
  paisDivorciados?: boolean;
  guardaDivorcio?: string;

  // Informações comunitárias e pastorais
  familiaPastoral: boolean;
  qualPastoral?: string;

  // Necessidades Especiais & Autorização de Imagem
  necessidadeEspecial: boolean;
  qualNecessidade?: string;
  autorizaFotos?: boolean;

  observacoes?: string;

  // Preferência de Horários / Turmas
  preferenciasHorario?: string[];

  // Datas e Status
  dataInscricao: string; // YYYY-MM-DD
  horaInscricao: string; // HH:mm:ss
  status: StatusInscricao;

  // Vínculos administrativos
  paroquiaId: string;
  comunidadeId?: string;
  turmaId?: string;

  // Anexos
  documentos: DocumentoAnexo[];

  // LGPD
  termoAceite: TermoAceiteLGPD;

  // Auditoria
  historicoAuditoria: RegistroAuditoria[];

  deleted?: boolean;
}

export interface Paroquia {
  id: string;
  nome: string;
  arquidiocese: string;
  endereco: string;
  telefone: string;
  email: string;
  paroco?: string;
}

export interface Comunidade {
  id: string;
  paroquiaId: string;
  nome: string;
  endereco?: string;
  responsavel?: string;
}

export interface Catequista {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento?: string;
  formacao?: string;
  turmasAtribuidas?: string[];
  paroquiaId: string;
  comunidadeId?: string;
  modalidadesAtendidas?: ModalidadeCatequese[];
  ativo: boolean;
}

export interface Turma {
  id: string;
  paroquiaId: string;
  comunidadeId: string;
  modalidade: ModalidadeCatequese;
  anoPastoral: number; // Ano de Conclusão da turma
  nome: string; // Ex: Turma A - Sábado Manhã
  horario: string; // Ex: 08:30 - 10:00
  diaSemana: 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira' | 'Sábado' | 'Domingo';
  sala: string;
  catequistaId?: string;
  catequistaNome?: string;
  catequistaSecundarioId?: string;
  catequistaSecundarioNome?: string;
  vagasMaximas: number;
  vagasOcupadas: number;
  listaEsperaCount: number;
  ativa: boolean;
}

export interface UsuarioSistema {
  uid: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  cargo?: string;
  paroquiaId?: string;
  comunidadeId?: string;
  turmasAtribuidas?: string[]; // IDs das turmas se perfil for Catequista
  ativo: boolean;
}

export interface ConfigSistema {
  anoPastoralAtual: number;
  dataReferencia: string; // Default 2028-03-31
  faixasEtarias: {
    PRE: { min: number; max: number };
    EUC: { min: number; max: number };
    PER: { min: number; max: number };
    CRI: { min: number; max: number };
    ADU: { min: number; max: number };
  };
  documentosObrigatorios: string[];
  vagasPadraoTurma: number;
  mensagens: {
    confirmacaoInscricao: string;
    documentosPendentes: string;
    aprovacaoMatricula: string;
  };
  termoLGPDTexto: string;
}
