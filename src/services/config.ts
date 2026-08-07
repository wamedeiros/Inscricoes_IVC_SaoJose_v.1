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
  const idadeAteSet2026 = calcularIdade(dataNascimentoStr, '2026-09-01');

  if (idadeAteSet2026 < 2) {
    return {
      elegivel: false,
      idadeCalculada: idade,
      mensagem: `Atenção: Para realizar a inscrição na Pré-Catequese, a criança deverá ter 2 anos completos até 01/09/2026.`
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

/**
 * Padroniza a exibição da hora no formato: hora + "h" + minuto com 2 dígitos (Ex: 8h30, 16h00, 19h00)
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

  if (cleaned === '8h30' || cleaned === '08h30' || cleaned === '8:30' || cleaned === '08:30') return '8h30';
  if (cleaned === '10h00' || cleaned === '10:00' || cleaned === '10h') return '10h00';
  if (cleaned === '16h00' || cleaned === '16:00' || cleaned === '16h' || cleaned === '15:30' || cleaned === '15h30') return '16h00';
  if (cleaned === '19h00' || cleaned === '19:00' || cleaned === '19h') return '19h00';

  // Fallback regex para converter "H:MM" ou "HH:MM" -> "HhMM" / "HHhMM"
  const match = cleaned.match(/(\d{1,2})[:h](\d{2})/i);
  if (match) {
    const hora = parseInt(match[1], 10);
    const minuto = match[2];
    return `${hora}h${minuto}`;
  }

  const matchHora = cleaned.match(/(\d{1,2})h?/i);
  if (matchHora) {
    const hora = parseInt(matchHora[1], 10);
    return `${hora}h00`;
  }

  return cleaned;
}

/**
 * Padroniza opções de horários no formato: Dia da semana (hora)
 * Ex: Domingo (8h30), Sábado (16h00), Segunda-feira (19h00)
 */
export function formatarOpcaoHorario(opcaoStr?: string): string {
  if (!opcaoStr) return '';
  const str = opcaoStr.trim();

  if (str.includes('Domingo') && (str.includes('10') || str.includes('10:00') || str.includes('10h00'))) {
    return 'Domingo (10h00)';
  }
  if (str.includes('Domingo') && (str.includes('8') || str.includes('8h30') || str.includes('08:30'))) {
    return 'Domingo (8h30)';
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

