import { ConfigSistema, ModalidadeCatequese, MODALIDADE_NAMES } from '../types';

export const DEFAULT_CONFIG: ConfigSistema = {
  inscricoesAbertas: true,
  anoPastoralAtual: 2028,
  dataReferencia: '2028-04-30',
  faixasEtarias: {
    PRE: { min: 2, max: 6 },
    EUC: { min: 7, max: 13 },
    PER: { min: 7, max: 13 },
    CRI: { min: 14, max: 18 },
    ADU: { min: 19, max: 120 }
  },
  documentosObrigatorios: [
    'Certidão de Nascimento',
    'Comprovante de Residência',
    'Certificado de Batismo (se houver)'
  ],
  vagasPadraoTurma: 25,
  mensagens: {
    confirmacaoInscricao: 'Sua inscrição para a Catequese da Igreja São José – Lar de Misericórdia foi enviada com sucesso!',
    documentosPendentes: 'Inscrição aguardando definição de turma.',
    aprovacaoMatricula: 'Parabéns! Sua matrícula foi confirmada e sua turma foi atribuída.'
  },
  termoLGPDTexto: `Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), autorizo a Igreja São José - Lar de Misericórdia a coletar, armazenar e processar os dados pessoais e sensíveis fornecidos nesta ficha exclusivamente para fins de inscrição, organização de turmas, formação religiosa e comunicação pastoral relacionadas à Iniciação à Vida Cristã (IVC). Comprometemo-nos a não compartilhar os dados com terceiros não autorizados.`
};

/**
 * Calcula a idade em anos em relação à data de referência (padrão: 31/03/2028 ou configurável).
 */
export function calcularIdade(dataNascimentoStr: string, dataRefStr: string = DEFAULT_CONFIG.dataReferencia): number {
  if (!dataNascimentoStr) return 0;
  
  const nasc = new Date(dataNascimentoStr + 'T00:00:00');
  const ref = new Date(dataRefStr + 'T00:00:00');

  if (isNaN(nasc.getTime()) || isNaN(ref.getTime())) return 0;

  let idade = ref.getFullYear() - nasc.getFullYear();
  const m = ref.getMonth() - nasc.getMonth();

  if (m < 0 || (m === 0 && ref.getDate() < nasc.getDate())) {
    idade--;
  }

  return idade < 0 ? 0 : idade;
}

export interface ResultadoModalidade {
  elegivel: boolean;
  modalidade?: ModalidadeCatequese;
  idadeCalculada: number;
  mensagem: string;
}

/**
 * Determina automaticamente a modalidade com base na data de nascimento, sacramentos e faixas etárias configuradas.
 */
export function determinarModalidade(
  dataNascimentoStr: string,
  eucaristia: boolean = false,
  config: ConfigSistema = DEFAULT_CONFIG
): ResultadoModalidade {
  if (!dataNascimentoStr) {
    return {
      elegivel: false,
      idadeCalculada: 0,
      mensagem: 'Por favor, informe a data de nascimento.'
    };
  }

  const idade = calcularIdade(dataNascimentoStr, config.dataReferencia);
  const idadeEm2027 = calcularIdade(dataNascimentoStr, '2027-01-01');

  if (idadeEm2027 < 2) {
    return {
      elegivel: false,
      idadeCalculada: idade,
      mensagem: `Inscrição não permitida: Não se aceitam inscrições de crianças com menos de 2 anos até 01/01/2027.`
    };
  }

  if (idade < config.faixasEtarias.PRE.min) {
    return {
      elegivel: false,
      idadeCalculada: idade,
      mensagem: `Inscrição não permitida: A criança possui ${idade} ano(s) na data de referência (${formatarDataBR(config.dataReferencia)}). É necessário ter no mínimo 2 anos completos até 30/04/2028.`
    };
  }

  let mod: ModalidadeCatequese | undefined;

  if (idade >= config.faixasEtarias.PRE.min && idade <= config.faixasEtarias.PRE.max) {
    mod = 'PRE';
  } else if (idade >= config.faixasEtarias.EUC.min && idade <= config.faixasEtarias.EUC.max) {
    // Para idades de 8 a 14 anos:
    // Se possui Primeira Eucaristia => Perseverança (PER)
    // Se não possui => Eucaristia (EUC)
    if (eucaristia) {
      mod = 'PER';
    } else {
      mod = 'EUC';
    }
  } else if (idade >= config.faixasEtarias.CRI.min && idade <= config.faixasEtarias.CRI.max) {
    mod = 'CRI';
  } else if (idade >= config.faixasEtarias.ADU.min) {
    mod = 'ADU';
  }

  if (!mod) {
    return {
      elegivel: false,
      idadeCalculada: idade,
      mensagem: `Idade (${idade} anos) fora das faixas etárias permitidas para inscrição.`
    };
  }

  return {
    elegivel: true,
    modalidade: mod,
    idadeCalculada: idade,
    mensagem: `Idade calculada: ${idade} ano(s) em ${formatarDataBR(config.dataReferencia)}. Modalidade atribuída: ${MODALIDADE_NAMES[mod]}.`
  };
}

/**
 * Formata data no padrão brasileiro (DD/MM/AAAA)
 */
export function formatarDataBR(dataStr?: string): string {
  if (!dataStr) return '-';
  const parts = dataStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dataStr;
}

/**
 * Formata CPF com máscara 000.000.000-00
 */
export function formatarCPF(cpf?: string): string {
  if (!cpf) return '';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata Telefone / WhatsApp com máscara
 */
export function formatarTelefone(tel?: string): string {
  if (!tel) return '';
  const clean = tel.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return tel;
}
