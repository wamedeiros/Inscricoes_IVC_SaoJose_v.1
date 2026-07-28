import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { Inscrito, Turma, MODALIDADE_NAMES } from '../types';
import { formatarDataBR, formatarTelefone, formatarCPF } from './config';
import { getTurmas } from './storage';

/**
 * Gera o Comprovante Oficial de Inscrição em PDF com QR Code no Canto Superior Esquerdo
 * Contém TODOS os dados digitados na inscrição.
 */
export async function gerarComprovanteInscricaoPDF(inscrito: Inscrito, modo: 'download' | 'print' = 'download'): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const mod = inscrito.modalidade;

  let tituloMod = 'PRÉ-CATEQUESE';
  let faixaEtaria = 'CRIANÇAS DE 2 A 6 ANOS';

  if (mod === 'EUC') {
    tituloMod = 'EUCARISTIA';
    faixaEtaria = 'CRIANÇAS DE 7 A 13 ANOS';
  } else if (mod === 'PER') {
    tituloMod = 'PERSEVERANÇA';
    faixaEtaria = 'CRIANÇAS DE 7 A 13 ANOS';
  } else if (mod === 'CRI') {
    tituloMod = 'CATECUMENATO CRISMAL';
    faixaEtaria = 'ADOLESCENTES DE 14 A 18 ANOS';
  } else if (mod === 'ADU') {
    tituloMod = 'CATECUMENATO COM ADULTOS';
    faixaEtaria = 'ADULTOS A PARTIR DE 19 ANOS';
  }

  // 1. QR Code de confirmação posicionado no espaço superior esquerdo (substituindo a antiga imagem/logotipo)
  const qrData = `${window.location.origin}/#validar?protocolo=${inscrito.protocolo}`;
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 300, margin: 0 });
    // Desenha o QR Code dimensionado (26x26 mm) no canto superior esquerdo
    doc.addImage(qrCodeDataUrl, 'PNG', 12, 6, 26, 26);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 100, 60);
    doc.text('VALIDAÇÃO / QR CODE', 25, 34, { align: 'center' });
  } catch (err) {
    console.error('Erro ao gerar QR Code:', err);
  }

  // Cabeçalho e Título da Paróquia (Alinhados à direita / centro)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(140, 120, 81);
  doc.text('IGREJA SÃO JOSÉ – LAR DE MISERICÓRDIA', 200, 10, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('INICIAÇÃO À VIDA CRISTÃ (IVC)', 200, 14, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(`FICHA DE INSCRIÇÃO – ${tituloMod}`, 115, 22, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(faixaEtaria, 115, 26, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(140, 120, 81);
  doc.text(`PROTOCOLO: ${inscrito.protocolo}`, 200, 31, { align: 'right' });

  // Linha horizontal divisória
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(0.4);
  doc.line(10, 37, 200, 37);

  // --- CORPO DA FICHA (Estilo Formulário Impresso) ---
  let y = 43;
  const lineGap = 5.5;

  const drawSectionTitle = (title: string, yPos: number) => {
    doc.setFillColor(243, 241, 237);
    doc.rect(10, yPos - 3.5, 190, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(140, 120, 81);
    doc.text(title.toUpperCase(), 12, yPos);
    return yPos + lineGap;
  };

  const drawFieldLine = (label: string, value: string, yPos: number, xStart = 10) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(label, xStart, yPos);
    const labelWidth = doc.getTextWidth(label) + 1.5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    const valText = value || '________________________________________________________';
    doc.text(valText, xStart + labelWidth, yPos);
  };

  const drawCheckbox = (label: string, isChecked: boolean, xPos: number, yPos: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    const box = isChecked ? '( X )' : '(   )';
    doc.text(`${box} ${label}`, xPos, yPos);
  };

  // 1. DADOS PESSOAIS DO CATEQUIZANDO
  y = drawSectionTitle('1. Dados Pessoais do Catequizando', y);

  drawFieldLine('NOME COMPLETO:', inscrito.nome, y);
  y += lineGap;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('DATA DE NASCIMENTO:', 10, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatarDataBR(inscrito.dataNascimento)} (${inscrito.idadeCalculada} anos)`, 46, y);

  doc.setFont('helvetica', 'bold');
  doc.text('NATURALIDADE:', 115, y);
  doc.setFont('helvetica', 'normal');
  doc.text(inscrito.ondeNasceu || 'Teresina - PI', 142, y);
  y += lineGap;

  const endFull = `${inscrito.endereco || ''} ${inscrito.bairro ? '- ' + inscrito.bairro : ''} ${inscrito.cidade ? '- ' + inscrito.cidade : ''}`.trim();
  drawFieldLine('ENDEREÇO RESIDENCIAL:', endFull, y);
  y += lineGap;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TELEFONE / WHATSAPP:', 10, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatarTelefone(inscrito.telefone) || '__________________', 48, y);

  doc.setFont('helvetica', 'bold');
  doc.text('E-MAIL:', 115, y);
  doc.setFont('helvetica', 'normal');
  doc.text(inscrito.email || '___________________________', 130, y);
  y += lineGap;

  if (mod === 'ADU' && inscrito.estadoCivil) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('ESTADO CIVIL:', 10, y);
    const est = inscrito.estadoCivil;
    drawCheckbox('SOLTEIRO(A)', est === 'Solteiro(a)', 35, y);
    drawCheckbox('CASADO(A) CIVIL', est === 'Casado(a) no Civil', 65, y);
    drawCheckbox('MATRIMÔNIO RELIGIOSO', est === 'Celebrou Matrimônio Religioso', 105, y);
    drawCheckbox('OUTRO', est === 'Outro', 155, y);
    y += lineGap;
  }

  // 2. SACRAMENTOS RECEBIDOS
  y = drawSectionTitle('2. Sacramentos da Iniciação Cristã do Catequizando', y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SACRAMENTO DO BATISMO:', 10, y);
  drawCheckbox('SIM', inscrito.batizado, 58, y);
  drawCheckbox('NÃO', !inscrito.batizado, 72, y);

  if (inscrito.batizado) {
    const locBat = `${inscrito.localBatismo || ''} ${inscrito.dataBatismo ? '(' + formatarDataBR(inscrito.dataBatismo) + ')' : ''}`.trim();
    doc.setFont('helvetica', 'normal');
    doc.text(`Local/Data: ${locBat}`, 88, y);
  }
  y += lineGap;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PRIMEIRA EUCARISTIA:', 10, y);
  drawCheckbox('SIM', inscrito.eucaristia, 58, y);
  drawCheckbox('NÃO', !inscrito.eucaristia, 72, y);

  if (inscrito.eucaristia) {
    const locEuc = `${inscrito.localEucaristia || ''} ${inscrito.dataEucaristia ? '(' + formatarDataBR(inscrito.dataEucaristia) + ')' : ''}`.trim();
    doc.setFont('helvetica', 'normal');
    doc.text(`Local/Data: ${locEuc}`, 88, y);
  }
  y += lineGap;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SACRAMENTO DA CRISMA:', 10, y);
  drawCheckbox('SIM', inscrito.crisma, 58, y);
  drawCheckbox('NÃO', !inscrito.crisma, 72, y);
  y += lineGap;

  // 3. DADOS DOS PAIS E RESPONSÁVEIS (Para menores ou se preenchido)
  if (mod !== 'ADU' || inscrito.nomePai || inscrito.nomeMae || inscrito.responsavel) {
    y = drawSectionTitle('3. Dados da Família / Pais e Responsável Legal', y);

    drawFieldLine('NOME DO PAI:', inscrito.nomePai || '', y);
    y += lineGap;

    const telPaiVal = formatarTelefone(inscrito.telefonePai) || '';
    const emailPaiVal = inscrito.emailPai || '';
    doc.setFont('helvetica', 'bold');
    doc.text('TELEFONE PAI:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(telPaiVal || '__________________', 35, y);

    doc.setFont('helvetica', 'bold');
    doc.text('E-MAIL PAI:', 105, y);
    doc.setFont('helvetica', 'normal');
    doc.text(emailPaiVal || '___________________________', 125, y);
    y += lineGap;

    doc.setFont('helvetica', 'bold');
    doc.text('SACRAMENTOS DO PAI:', 10, y);
    drawCheckbox('BATISMO', !!inscrito.paiSacramentos?.batismo, 50, y);
    drawCheckbox('EUCARISTIA', !!inscrito.paiSacramentos?.eucaristia, 85, y);
    drawCheckbox('CRISMA', !!inscrito.paiSacramentos?.crisma, 120, y);
    y += lineGap;

    drawFieldLine('NOME DA MÃE:', inscrito.nomeMae || '', y);
    y += lineGap;

    const telMaeVal = formatarTelefone(inscrito.telefoneMae) || '';
    const emailMaeVal = inscrito.emailMae || '';
    doc.setFont('helvetica', 'bold');
    doc.text('TELEFONE MÃE:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(telMaeVal || '__________________', 36, y);

    doc.setFont('helvetica', 'bold');
    doc.text('E-MAIL MÃE:', 105, y);
    doc.setFont('helvetica', 'normal');
    doc.text(emailMaeVal || '___________________________', 127, y);
    y += lineGap;

    doc.setFont('helvetica', 'bold');
    doc.text('SACRAMENTOS DA MÃE:', 10, y);
    drawCheckbox('BATISMO', !!inscrito.maeSacramentos?.batismo, 50, y);
    drawCheckbox('EUCARISTIA', !!inscrito.maeSacramentos?.eucaristia, 85, y);
    drawCheckbox('CRISMA', !!inscrito.maeSacramentos?.crisma, 120, y);
    y += lineGap;

    doc.setFont('helvetica', 'bold');
    doc.text('MATRIMÔNIO RELIGIOSO DOS PAIS?', 10, y);
    drawCheckbox('SIM', !!inscrito.paisMatrimonio, 68, y);
    drawCheckbox('NÃO', !inscrito.paisMatrimonio, 82, y);
    if (inscrito.paisMatrimonio && inscrito.ondeMatrimonioPais) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Local: ${inscrito.ondeMatrimonioPais}`, 98, y);
    }
    y += lineGap;

    if (inscrito.paisDivorciados) {
      doc.setFont('helvetica', 'bold');
      doc.text('DIVORCIADOS? SIM', 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`Guarda: ${inscrito.guardaDivorcio || 'Mãe/Pai'}`, 48, y);
      y += lineGap;
    }

    if (inscrito.responsavel) {
      const resp = inscrito.responsavel;
      drawFieldLine('RESPONSÁVEL LEGAL:', `${resp.nome} (CPF: ${formatarCPF(resp.cpf) || '-'}) - Tel: ${formatarTelefone(resp.telefone)}`, y);
      y += lineGap;
    }
  }

  // 4. PREFERÊNCIAS, TURMA E PASTORAL
  y = drawSectionTitle('4. Opções, Turma e Outras Informações', y);

  if (inscrito.motivacao && mod === 'ADU') {
    drawFieldLine('MOTIVAÇÃO:', inscrito.motivacao, y);
    y += lineGap;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('PARTICIPA DE PASTORAL/GRUPO?', 10, y);
  drawCheckbox('SIM', !!inscrito.familiaPastoral, 65, y);
  drawCheckbox('NÃO', !inscrito.familiaPastoral, 80, y);
  if (inscrito.familiaPastoral && inscrito.qualPastoral) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Qual: ${inscrito.qualPastoral}`, 96, y);
  }
  y += lineGap;

  doc.setFont('helvetica', 'bold');
  doc.text('NECESSIDADE ESPECIAL?', 10, y);
  drawCheckbox('SIM', !!inscrito.necessidadeEspecial, 55, y);
  drawCheckbox('NÃO', !inscrito.necessidadeEspecial, 70, y);
  if (inscrito.necessidadeEspecial && inscrito.qualNecessidade) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Qual: ${inscrito.qualNecessidade}`, 86, y);
  }
  y += lineGap;

  doc.setFont('helvetica', 'bold');
  doc.text('AUTORIZA FOTOS NAS REDES SOCIAIS?', 10, y);
  drawCheckbox('SIM (AUTORIZA)', inscrito.autorizaFotos !== false, 72, y);
  drawCheckbox('NÃO AUTORIZA', inscrito.autorizaFotos === false, 110, y);
  y += lineGap;

  if (inscrito.preferenciasHorario && inscrito.preferenciasHorario.length > 0) {
    drawFieldLine('HORÁRIO(S) PRETENDIDO(S):', inscrito.preferenciasHorario.join(', '), y);
    y += lineGap;
  }

  // Turma alocada se houver
  let nomeTurmaAlocada = 'A definir / Em alocação';
  if (inscrito.turmaId) {
    const turmas = getTurmas();
    const tObj = turmas.find(t => t.id === inscrito.turmaId);
    if (tObj) {
      nomeTurmaAlocada = `${tObj.nome} (${tObj.diaSemana} - ${tObj.horario})`;
    }
  }
  drawFieldLine('TURMA ALOCADA:', nomeTurmaAlocada, y);
  y += lineGap;

  drawFieldLine('STATUS DA INSCRIÇÃO:', inscrito.status, y);
  y += lineGap;

  if (inscrito.observacoes) {
    drawFieldLine('OBSERVAÇÕES:', inscrito.observacoes, y);
    y += lineGap;
  }

  // DATA DA INSCRIÇÃO & ASSINATURA
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DATA DA INSCRIÇÃO:', 10, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatarDataBR(inscrito.dataInscricao)} - ${inscrito.horaInscricao || ''}`, 48, y);
  y += 7;

  const rotuloAssinatura = (mod === 'ADU' || mod === 'CRI') ? 'ASSINATURA DO CATEQUIZANDO:' : 'ASSINATURA DO PAI / MÃE OU RESPONSÁVEL LEGAL:';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(rotuloAssinatura, 10, y);
  doc.setFont('helvetica', 'normal');
  doc.text('____________________________________________________________________', 82, y);

  // Rodapé fixo
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Paróquia Igreja São José - Lar de Misericórdia | Teresina - PI', 105, 287, { align: 'center' });

  if (modo === 'print') {
    doc.autoPrint();
    const windowPdf = window.open(doc.output('bloburl'), '_blank');
    if (windowPdf) {
      windowPdf.focus();
    }
  } else {
    doc.save(`Ficha_Inscricao_${inscrito.protocolo}.pdf`);
  }
}

/**
 * Gera Lista de Presença da Turma em PDF
 */
export function gerarListaPresencaPDF(turma: Turma, inscritos: Inscrito[]): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFillColor(140, 120, 81);
  doc.rect(0, 0, 297, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('IGREJA SÃO JOSÉ - LAR DE MISERICÓRDIA - LISTA DE PRESENÇA', 148, 8, { align: 'center' });

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text(`TURMA: ${turma.nome} (${MODALIDADE_NAMES[turma.modalidade]})`, 15, 20);

  const catTexto = turma.catequistaSecundarioNome
    ? `${turma.catequistaNome || 'A definir'} e ${turma.catequistaSecundarioNome}`
    : (turma.catequistaNome || 'A definir');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Catequista(s): ${catTexto} | Horário: ${turma.horario} (${turma.diaSemana}) | Sala: ${turma.sala}`, 15, 25);
  doc.text(`Ano de Conclusão: ${turma.anoPastoral || 2028} | Total de Alunos Alocados: ${inscritos.length}`, 15, 30);

  const tableBody = inscritos.map((ins, idx) => [
    idx + 1,
    ins.protocolo,
    ins.nome,
    formatarTelefone(ins.telefone || ins.responsavel?.telefone),
    '', '', '', '', '', '', '', '', '', ''
  ]);

  autoTable(doc, {
    startY: 34,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 28 },
      2: { cellWidth: 65, halign: 'left' },
      3: { cellWidth: 30, halign: 'left' }
    },
    head: [['Nº', 'Protocolo', 'Nome do Catequizando', 'Telefone', 'Encontro 1', 'Encontro 2', 'Encontro 3', 'Encontro 4', 'Encontro 5', 'Encontro 6', 'Encontro 7', 'Encontro 8', 'Encontro 9', 'Encontro 10']],
    body: tableBody,
    margin: { left: 15, right: 15 }
  });

  doc.save(`Lista_Presenca_${turma.nome.replace(/\s+/g, '_')}.pdf`);
}

export interface AniversarianteItem {
  tipo: 'Catequizando' | 'Catequista';
  nome: string;
  dataNascimento: string;
  detalheOuModalidade: string;
  telefone: string;
  email: string;
}

/**
 * Gera Relatório de Aniversariantes em PDF
 */
export function gerarRelatorioAniversariantesPDF(lista: AniversarianteItem[], mesNome: string): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(140, 120, 81);
  doc.text(`IGREJA SÃO JOSÉ - LAR DE MISERICÓRDIA — CATEQUESE IVC`, 105, 14, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(45, 42, 38);
  doc.text(`RELATÓRIO DE ANIVERSARIANTES DO MÊS DE ${mesNome.toUpperCase()}`, 105, 20, { align: 'center' });

  const listaOrdenada = [...lista].sort((a, b) => {
    const diaA = parseInt(a.dataNascimento.split('-')[2] || '0', 10);
    const diaB = parseInt(b.dataNascimento.split('-')[2] || '0', 10);
    return diaA - diaB;
  });

  const body = listaOrdenada.map(item => [
    formatarDataBR(item.dataNascimento),
    item.nome,
    item.tipo,
    item.detalheOuModalidade,
    formatarTelefone(item.telefone),
    item.email || '-'
  ]);

  autoTable(doc, {
    startY: 26,
    theme: 'striped',
    headStyles: { fillColor: [140, 120, 81], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Data Nasc.', 'Nome Completo', 'Função / Tipo', 'Modalidade / Função', 'Telefone', 'E-mail']],
    body,
    margin: { left: 12, right: 12 }
  });

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Total de Aniversariantes em ${mesNome}: ${lista.length}`, 12, (doc as any).lastAutoTable.finalY + 10);

  doc.save(`Aniversariantes_${mesNome}.pdf`);
}

/**
 * Gera Relatório de Documentos Pendentes em PDF
 */
export function gerarRelatorioDocPendentesPDF(inscritos: Inscrito[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(140, 120, 81);
  doc.text('IGREJA SÃO JOSÉ - LAR DE MISERICÓRDIA - DOCUMENTOS PENDENTES', 105, 18, { align: 'center' });

  const body = inscritos.map(i => {
    const pendentes = i.documentos.filter(d => d.status === 'Pendente').map(d => d.tipo).join(', ');
    return [
      i.protocolo,
      i.nome,
      MODALIDADE_NAMES[i.modalidade],
      formatarTelefone(i.telefone || i.responsavel?.telefone),
      pendentes || 'Nenhum documento anexado'
    ];
  });

  autoTable(doc, {
    startY: 25,
    theme: 'grid',
    headStyles: { fillColor: [140, 120, 81], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Protocolo', 'Inscrito', 'Modalidade', 'Contato', 'Documentos Pendentes']],
    body,
    margin: { left: 15, right: 15 }
  });

  doc.save('Relatorio_Documentos_Pendentes.pdf');
}
