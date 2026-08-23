import { ConfigSistema, ModalidadeCatequese, MODALIDADE_NAMES } from '../types';

export const DATA_REFERENCIA_CATEQUESE = '2028-04-30'; // 30/04/2028
export const DATA_MINIMA_PRE_CATEQUESE = '2026-09-01'; // 01/09/2026 (mínimo de 2 anos completos)

export const DEFAULT_CONFIG: ConfigSistema = {
  inscricoesAbertas: true,
  anoPastoralAtual: 2028,
  dataReferencia: DATA_REFERENCIA_CATEQUESE,
  faixasEtarias: {
    PRE: { min: 0, max: 7 },
    EUC: { min: 8, max: 14 },
    PER: { min: 8, max: 14 },
    CRI: { min: 15, max: 18 },
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
 * Calcula a idade completa em anos na data de referência especificada (padrão: 30/04/2028).
 * Realiza o cálculo estritamente com base no dia, mês e ano de nascimento em relação à data de referência.
 */
export function calcularIdadeNaData(dataNascimentoStr: string, dataRefStr: string = DATA_REFERENCIA_CATEQUESE): number {
  if (!dataNascimentoStr) return 0;
  
  const nascParts = dataNascimentoStr.split('T')[0].split('-');
  if (nascParts.length !== 3) return 0;
  const anoNasc = parseInt(nascParts[0], 10);
  const mesNasc = parseInt(nascParts[1], 10) - 1; // 0 a 11
  const diaNasc = parseInt(nascParts[2], 10);

  const refParts = (dataRefStr || DATA_REFERENCIA_CATEQUESE).split('T')[0].split('-');
  if (refParts.length !== 3) return 0;
  const anoRef = parseInt(refParts[0], 10);
  const mesRef = parseInt(refParts[1], 10) - 1; // 0 a 11 (ex: 3 para abril)
  const diaRef = parseInt(refParts[2], 10);

  if (isNaN(anoNasc) || isNaN(mesNasc) || isNaN(diaNasc) || isNaN(anoRef) || isNaN(mesRef) || isNaN(diaRef)) {
    return 0;
  }

  let idade = anoRef - anoNasc;
  if (mesRef < mesNasc || (mesRef === mesNasc && diaRef < diaNasc)) {
    idade--;
  }

  return idade < 0 ? 0 : idade;
}

/**
 * Alias de compatibilidade para calcularIdade
 */
export function calcularIdade(dataNascimentoStr: string, dataRefStr: string = DEFAULT_CONFIG.dataReferencia): number {
  return calcularIdadeNaData(dataNascimentoStr, dataRefStr);
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

  const dataRef = config.dataReferencia || DATA_REFERENCIA_CATEQUESE;
  const idade = calcularIdadeNaData(dataNascimentoStr, dataRef);
  const idadeEmSetembro2026 = calcularIdadeNaData(dataNascimentoStr, DATA_MINIMA_PRE_CATEQUESE);

  // Limite mínimo: para se inscrever, a criança deve ter no mínimo 2 anos completos até 01/09/2026
  if (idadeEmSetembro2026 < 2) {
    return {
      elegivel: false,
      idadeCalculada: idade,
      mensagem: `Inscrição não permitida: A criança precisa ter no mínimo 2 anos completos até 01/09/2026 para ingressar na Catequese.`
    };
  }

  let mod: ModalidadeCatequese | undefined;

  if (idade <= (config.faixasEtarias?.PRE?.max ?? 7)) {
    mod = 'PRE';
  } else if (idade >= (config.faixasEtarias?.EUC?.min ?? 8) && idade <= (config.faixasEtarias?.EUC?.max ?? 14)) {
    // Para idades de 8 a 14 anos:
    // Se possui Primeira Eucaristia => Perseverança (PER)
    // Se não possui => Eucaristia (EUC)
    if (eucaristia) {
      mod = 'PER';
    } else {
      mod = 'EUC';
    }
  } else if (idade >= (config.faixasEtarias?.CRI?.min ?? 15) && idade <= (config.faixasEtarias?.CRI?.max ?? 18)) {
    mod = 'CRI';
  } else if (idade >= (config.faixasEtarias?.ADU?.min ?? 19)) {
    mod = 'ADU';
  }

  if (!mod) {
    return {
      elegivel: false,
      idadeCalculada: idade,
      mensagem: `Idade (${idade} anos em ${formatarDataBR(dataRef)}) fora das faixas etárias permitidas para inscrição.`
    };
  }

  return {
    elegivel: true,
    modalidade: mod,
    idadeCalculada: idade,
    mensagem: `Idade calculada: ${idade} ano(s) em ${formatarDataBR(dataRef)}. Modalidade atribuída: ${MODALIDADE_NAMES[mod]}.`
  };
}

/**
 * Função centralizada para determinação da turma / modalidade a partir da data de nascimento
 * e da informação sobre recebimento da Primeira Eucaristia, sempre referenciado a 30/04/2028.
 */
export function determinarTurma(
  dataNascimento: string,
  jaRecebeuEucaristia: boolean = false,
  dataReferencia: string = DATA_REFERENCIA_CATEQUESE
): {
  idade: number;
  modalidade: ModalidadeCatequese;
  nomeTurma: string;
} {
  const idade = calcularIdadeNaData(dataNascimento, dataReferencia);
  let modalidade: ModalidadeCatequese = 'PRE';

  if (idade <= 7) {
    modalidade = 'PRE';
  } else if (idade >= 8 && idade <= 14) {
    modalidade = jaRecebeuEucaristia ? 'PER' : 'EUC';
  } else if (idade >= 15 && idade <= 18) {
    modalidade = 'CRI';
  } else {
    modalidade = 'ADU';
  }

  return {
    idade,
    modalidade,
    nomeTurma: MODALIDADE_NAMES[modalidade]
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

/**
 * Padroniza a exibição da hora no formato: hora + "h" + minuto com 2 dígitos (Ex: 08h30, 16h00, 19h00)
 */
export function formatarHoraValida(horaStr?: string): string {
  if (!horaStr) return '';
  let cleaned = horaStr.trim();

  // Remover intervalos como "- 09:30" ou "às 17h"
  if (cleaned.includes('-')) {
    cleaned = cleaned.split('-')[0].trim();
  } else if (cleaned.includes('às')) {
    cleaned = cleaned.split('às')[0].trim();
  }

  if (cleaned === '8h30' || cleaned === '08h30' || cleaned === '8:30' || cleaned === '08:30' || cleaned === '10h00' || cleaned === '10:00' || cleaned === '10h') return '08h30';
  if (cleaned === '16h00' || cleaned === '16:00' || cleaned === '16h' || cleaned === '15:30' || cleaned === '15h30') return '16h00';
  if (cleaned === '19h00' || cleaned === '19:00' || cleaned === '19h') return '19h00';

  // Fallback regex para converter "H:MM" ou "HH:MM" -> "HhMM" / "HHhMM"
  const match = cleaned.match(/(\d{1,2})[:h](\d{2})/i);
  if (match) {
    const hora = parseInt(match[1], 10);
    const minuto = match[2];
    return hora < 10 ? `0${hora}h${minuto}` : `${hora}h${minuto}`;
  }

  const matchHora = cleaned.match(/(\d{1,2})h?/i);
  if (matchHora) {
    const hora = parseInt(matchHora[1], 10);
    return hora < 10 ? `0${hora}h00` : `${hora}h00`;
  }

  return cleaned;
}

/**
 * Padroniza opções de horários no formato: Dia da semana (hora)
 * Ex: Domingo (08h30), Sábado (16h00), Segunda-feira (19h00)
 */
export function formatarOpcaoHorario(opcaoStr?: string): string {
  if (!opcaoStr) return '';
  const str = opcaoStr.trim();

  if (str.includes('Domingo')) {
    return 'Domingo (08h30)';
  }
  if (str.includes('Sábado') || str.includes('Sabado')) {
    return 'Sábado (16h00)';
  }
  if (str.includes('Segunda')) return 'Segunda-feira (19h00)';
  if (str.includes('Terça') || str.includes('Terca')) return 'Terça-feira (19h00)';
  if (str.includes('Quarta')) return 'Quarta-feira (19h00)';
  if (str.includes('Quinta')) return 'Quinta-feira (19h00)';
  if (str.includes('Sexta')) return 'Sexta-feira (19h00)';

  return str;
}

