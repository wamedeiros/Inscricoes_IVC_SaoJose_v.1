import * as XLSX from 'xlsx';
import { Inscrito, Turma, Responsavel, MODALIDADE_NAMES } from '../types';
import { formatarDataBR, formatarTelefone, formatarCPF } from './config';

/**
 * Exporta Lista de Inscritos para planilha Excel (.xlsx)
 */
export function exportarInscritosExcel(inscritos: Inscrito[], nomeArquivo: string = 'Inscritos_Catequese_IVC.xlsx'): void {
  const getTipoFichaDesc = (mod: string) => {
    switch (mod) {
      case 'PRE': return 'Pré-Catequese (2 a 6 anos)';
      case 'EUC': return 'Eucaristia (7 a 13 anos)';
      case 'PER': return 'Perseverança (7 a 13 anos)';
      case 'CRI': return 'Catecumenato Crismal / Crisma Jovem (14 a 18 anos)';
      case 'ADU': return 'Catecumenato Adulto (A partir de 19 anos)';
      default: return mod;
    }
  };

  const data = inscritos.map(i => ({
    'Protocolo': i.protocolo,
    'Tipo de Ficha / Faixa Etária': getTipoFichaDesc(i.modalidade),
    'Modalidade': MODALIDADE_NAMES[i.modalidade] || i.modalidade,
    'Status': i.status,
    'Nome Completo': i.nome,
    'Data Nascimento': formatarDataBR(i.dataNascimento),
    'Idade (em 30/04/2028)': i.idadeCalculada,
    'Naturalidade (Onde Nasceu)': i.ondeNasceu || '',
    'Endereço Residencial': i.endereco || '',
    'Bairro': i.bairro || '',
    'Cidade': i.cidade || '',
    'Telefone Catequizando': formatarTelefone(i.telefone),
    'E-mail Catequizando': i.email || '',
    'Estado Civil (Adulto)': i.estadoCivil || '',
    'Motivação da Inscrição (Adulto)': i.motivacao || '',
    'Batizado?': i.batizado ? 'Sim' : 'Não',
    'Batismo (Onde / Quando)': i.localBatismo ? `${i.localBatismo} ${i.dataBatismo ? '(' + formatarDataBR(i.dataBatismo) + ')' : ''}` : '',
    'Primeira Eucaristia?': i.eucaristia ? 'Sim' : 'Não',
    'Crisma?': i.crisma ? 'Sim' : 'Não',
    'Nome do Pai': i.nomePai || '',
    'Telefone do Pai': i.telefonePai ? formatarTelefone(i.telefonePai) : '',
    'E-mail do Pai': i.emailPai || '',
    'Pai - Batizado?': i.paiSacramentos?.batismo ? 'Sim' : 'Não',
    'Pai - Eucaristia?': i.paiSacramentos?.eucaristia ? 'Sim' : 'Não',
    'Pai - Crisma?': i.paiSacramentos?.crisma ? 'Sim' : 'Não',
    'Nome da Mãe': i.nomeMae || '',
    'Telefone da Mãe': i.telefoneMae ? formatarTelefone(i.telefoneMae) : '',
    'E-mail da Mãe': i.emailMae || '',
    'Mãe - Batizada?': i.maeSacramentos?.batismo ? 'Sim' : 'Não',
    'Mãe - Eucaristia?': i.maeSacramentos?.eucaristia ? 'Sim' : 'Não',
    'Mãe - Crisma?': i.maeSacramentos?.crisma ? 'Sim' : 'Não',
    'Pais Casados na Igreja (Matrimônio)?': i.paisMatrimonio ? 'Sim' : 'Não',
    'Matrimônio dos Pais - Onde': i.ondeMatrimonioPais || '',
    'Pais Divorciados?': i.paisDivorciados ? 'Sim' : 'Não',
    'Divórcio - Guarda do Catequizando': i.guardaDivorcio || '',
    'Participa de Pastoral?': i.familiaPastoral ? 'Sim' : 'Não',
    'Qual Pastoral?': i.qualPastoral || '',
    'Possui Necessidade Especial?': i.necessidadeEspecial ? 'Sim' : 'Não',
    'Qual Necessidade Especial?': i.qualNecessidade || '',
    'Autoriza Publicação de Imagens/Fotos?': i.autorizaFotos === false ? 'Não' : 'Sim',
    'Responsável Legal (Nome)': i.responsavel ? i.responsavel.nome : '',
    'CPF do Responsável': i.responsavel ? formatarCPF(i.responsavel.cpf) : '',
    'Telefone do Responsável': i.responsavel ? formatarTelefone(i.responsavel.telefone) : '',
    'E-mail do Responsável': i.responsavel ? i.responsavel.email : '',
    'Preferência de Horários': i.preferenciasHorario ? i.preferenciasHorario.join(' | ') : '',
    'Observações': i.observacoes || '',
    'Data da Inscrição': `${formatarDataBR(i.dataInscricao)} ${i.horaInscricao || ''}`
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscritos');

  XLSX.writeFile(workbook, nomeArquivo);
}

/**
 * Exporta Lista de Turmas para Excel
 */
export function exportarTurmasExcel(turmas: Turma[], nomeArquivo: string = 'Turmas_Catequese_IVC.xlsx'): void {
  const data = turmas.map(t => ({
    'Turma': t.nome,
    'Modalidade': MODALIDADE_NAMES[t.modalidade],
    'Dia Semana': t.diaSemana,
    'Horário': t.horario,
    'Sala': t.sala,
    '1º Catequista': t.catequistaNome || 'A definir',
    '2º Catequista': t.catequistaSecundarioNome || 'Nenhum',
    'Vagas Máximas': t.vagasMaximas,
    'Vagas Ocupadas': t.vagasOcupadas,
    'Lista de Espera': t.listaEsperaCount,
    'Ano de Conclusão': t.anoPastoral || 2028
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Turmas');

  XLSX.writeFile(workbook, nomeArquivo);
}

/**
 * Exporta Lista de Responsáveis para Excel
 */
export function exportarResponsaveisExcel(responsaveis: Responsavel[], nomeArquivo: string = 'Responsaveis_Catequese_IVC.xlsx'): void {
  const data = responsaveis.map(r => ({
    'Nome Responsável': r.nome,
    'CPF': formatarCPF(r.cpf),
    'RG': r.rg || '',
    'Telefone': formatarTelefone(r.telefone),
    'WhatsApp': formatarTelefone(r.whatsapp),
    'E-mail': r.email,
    'Endereço': r.endereco,
    'Bairro': r.bairro || '',
    'Cidade': r.cidade || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Responsáveis');

  XLSX.writeFile(workbook, nomeArquivo);
}
