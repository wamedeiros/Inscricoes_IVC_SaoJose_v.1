import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { Inscrito, Turma, MODALIDADE_NAMES } from '../types';
import { formatarDataBR, formatarTelefone, formatarCPF } from './config';

/**
 * Gera Data URL da Imagem-Símbolo / Brasão da Arquidiocese de Teresina
 */
function gerarBrasaoArquidioceseDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, 480, 600);
  ctx.save();
  ctx.scale(2, 2);

  // 1. Mitra Episcopal
  ctx.fillStyle = '#D4AF37';
  ctx.beginPath();
  ctx.moveTo(120, 12);
  ctx.bezierCurveTo(80, 40, 75, 75, 75, 105);
  ctx.lineTo(165, 105);
  ctx.bezierCurveTo(165, 75, 160, 40, 120, 12);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#8C7851';
  ctx.stroke();

  // Infulas (Faixas vermelhas caindo da mitra)
  ctx.fillStyle = '#A00000';
  ctx.beginPath();
  ctx.moveTo(85, 105);
  ctx.lineTo(65, 165);
  ctx.lineTo(80, 165);
  ctx.lineTo(95, 105);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(155, 105);
  ctx.lineTo(175, 165);
  ctx.lineTo(160, 165);
  ctx.lineTo(145, 105);
  ctx.closePath();
  ctx.fill();

  // Listra vermelha central da mitra
  ctx.fillStyle = '#A00000';
  ctx.fillRect(113, 18, 14, 87);

  // Cruz sobre a Mitra
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(116, 2, 8, 18);
  ctx.fillRect(110, 6, 20, 8);

  // Báculo e Cruz Processional Cruzados
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(30, 200);
  ctx.lineTo(210, 50);
  ctx.moveTo(210, 200);
  ctx.lineTo(30, 50);
  ctx.stroke();

  // Cruz Processional (topo esquerdo)
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(20, 42, 22, 6);
  ctx.fillRect(28, 34, 6, 22);

  // Báculo (topo direito - voluta)
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(210, 45, 12, 0, Math.PI * 1.5, false);
  ctx.stroke();

  // Escudo Dourado
  ctx.fillStyle = '#F4E4BA';
  ctx.beginPath();
  ctx.moveTo(60, 95);
  ctx.lineTo(180, 95);
  ctx.lineTo(180, 175);
  ctx.bezierCurveTo(180, 230, 120, 252, 120, 252);
  ctx.bezierCurveTo(120, 252, 60, 230, 60, 175);
  ctx.closePath();
  ctx.fill();

  // Borda do Escudo
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#8B0000';
  ctx.stroke();

  // Sagrado Coração de Jesus
  ctx.fillStyle = '#B22222';
  ctx.beginPath();
  ctx.moveTo(120, 192);
  ctx.bezierCurveTo(120, 186, 92, 158, 92, 142);
  ctx.bezierCurveTo(92, 128, 106, 120, 120, 134);
  ctx.bezierCurveTo(134, 120, 148, 128, 148, 142);
  ctx.bezierCurveTo(148, 158, 120, 186, 120, 192);
  ctx.closePath();
  ctx.fill();

  // Chamas do Sagrado Coração
  ctx.fillStyle = '#FF8C00';
  ctx.beginPath();
  ctx.moveTo(120, 124);
  ctx.lineTo(110, 112);
  ctx.lineTo(118, 106);
  ctx.lineTo(120, 96);
  ctx.lineTo(122, 106);
  ctx.lineTo(130, 112);
  ctx.closePath();
  ctx.fill();

  // Coroa de Espinhos em volta do Coração
  ctx.strokeStyle = '#2E8B57';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(120, 148, 22, 0, Math.PI * 2);
  ctx.stroke();

  // Espada Atravessando o Coração
  ctx.strokeStyle = '#4682B4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(96, 128);
  ctx.lineTo(144, 172);
  ctx.stroke();

  // Listel / Fita na Parte Inferior ("ARCHIDIOCESE DE TERESINA")
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#8C7851';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(12, 255);
  ctx.lineTo(228, 255);
  ctx.lineTo(212, 282);
  ctx.lineTo(28, 282);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Texto no Listel
  ctx.fillStyle = '#1A1A1A';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ARCHIDIOCESE DE TERESINA', 120, 273);

  ctx.restore();
  return canvas.toDataURL('image/png');
}

async function obterBrasaoArquidioceseDataUrl(): Promise<string> {
  if (typeof window === 'undefined') return '';
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = img.naturalWidth || img.width || 300;
        cv.height = img.naturalHeight || img.height || 380;
        const ctx = cv.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(cv.toDataURL('image/png'));
          return;
        }
      } catch (e) {
        // fallback
      }
      resolve(gerarBrasaoArquidioceseDataUrl());
    };
    img.onerror = () => {
      resolve(gerarBrasaoArquidioceseDataUrl());
    };
    img.src = '/arquidiocese.png';
  });
}

/**
 * Gera o Comprovante Oficial de Inscrição em PDF com QR Code
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

  // Imagem-Símbolo (Brasão da Arquidiocese de Teresina no Canto Superior Esquerdo)
  try {
    const brasaoDataUrl = await obterBrasaoArquidioceseDataUrl();
    if (brasaoDataUrl) {
      doc.addImage(brasaoDataUrl, 'PNG', 10, 4, 24, 30);
    }
  } catch (e) {
    // ignore canvas error
  }

  // Desenhar barras decorativas do topo (Arquidiocese style: Vermelho e Amarelo/Dourado)
  doc.setFillColor(180, 20, 30); // Vermelho/Bordô
  doc.triangle(150, 0, 210, 0, 210, 18, 'F');
  doc.setFillColor(240, 180, 20); // Amarelo/Dourado
  doc.triangle(165, 0, 210, 0, 210, 12, 'F');

  // Cabeçalho da Arquidiocese (Canto superior direito)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('ARQUIDIOCESE DE TERESINA', 200, 10, { align: 'right' });
  doc.setFontSize(9);
  doc.text('COMISSÃO DE PASTORAL - IVC', 200, 15, { align: 'right' });

  // Título da Paróquia e Ficha (Centralizado)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text('IGREJA SÃO JOSÉ – INICIAÇÃO À VIDA CRISTÃ', 105, 27, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`FICHA DE INSCRIÇÃO – ${tituloMod}`, 105, 33, { align: 'center' });
  doc.setFontSize(10);
  doc.text(faixaEtaria, 105, 38, { align: 'center' });

  // QR Code de autenticidade no canto inferior/lateral
  const qrData = `${window.location.origin}/#validar?protocolo=${inscrito.protocolo}`;
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 100, margin: 0 });
    doc.addImage(qrCodeDataUrl, 'PNG', 180, 25, 18, 18);
  } catch (err) {
    // ignore qr error
  }

  // Linha horizontal divisória
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(10, 42, 200, 42);

  // --- CORPO DA FICHA (Estilo Formulário Impresso) ---
  let y = 48;
  const lineGap = 6.2;

  const drawFieldLine = (label: string, value: string, yPos: number, xStart = 10, maxLength = 190) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
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
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    const box = isChecked ? '( X )' : '(   )';
    doc.text(`${box} ${label}`, xPos, yPos);
  };

  // NOME
  drawFieldLine('NOME:', inscrito.nome, y);
  y += lineGap;

  // DATA DE NASCIMENTO & ONDE NASCEU
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text('DATA DE NASCIMENTO:', 10, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatarDataBR(inscrito.dataNascimento)} (${inscrito.idadeCalculada} anos em 30/04/2028)`, 48, y);

  doc.setFont('helvetica', 'bold');
  doc.text('ONDE NASCEU?', 115, y);
  doc.setFont('helvetica', 'normal');
  doc.text(inscrito.ondeNasceu || '________________________', 142, y);
  y += lineGap;

  // ENDEREÇO
  const endFull = `${inscrito.endereco || ''} ${inscrito.bairro ? '- ' + inscrito.bairro : ''} ${inscrito.cidade ? '- ' + inscrito.cidade : ''}`.trim();
  drawFieldLine('ENDEREÇO:', endFull, y);
  y += lineGap;

  // TELEFONE & EMAIL (Para Crismal Jovem & Adultos)
  if (mod === 'CRI' || mod === 'ADU') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('TELEFONE:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatarTelefone(inscrito.telefone) || '__________________', 28, y);

    doc.setFont('helvetica', 'bold');
    doc.text('E-MAIL:', 105, y);
    doc.setFont('helvetica', 'normal');
    doc.text(inscrito.email || '___________________________', 120, y);
    y += lineGap;
  }

  // ESTADO CIVIL (Para Adultos)
  if (mod === 'ADU') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('ESTADO CIVIL:', 10, y);
    const est = inscrito.estadoCivil || '';
    drawCheckbox('SOLTEIRO (A)', est === 'Solteiro(a)', 35, y);
    drawCheckbox('CASADO (A) NO CIVIL', est === 'Casado(a) no Civil', 68, y);
    drawCheckbox('CELEBROU O MATRIMÔNIO', est === 'Celebrou Matrimônio Religioso', 110, y);
    y += lineGap - 1;
    drawCheckbox('VIÚVO (A)', est === 'Viúvo(a)', 35, y);
    drawCheckbox('OUTRO', est === 'Outro', 68, y);
    y += lineGap;
  }

  // BATISMO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(mod === 'ADU' ? 'JÁ CELEBROU O SACRAMENTO DO BATISMO?' : 'JÁ RECEBEU O SACRAMENTO DO BATISMO?', 10, y);
  y += lineGap - 1.5;
  drawCheckbox('SIM - ONDE E QUANDO?', inscrito.batizado, 10, y);
  if (inscrito.batizado) {
    doc.setFont('helvetica', 'normal');
    const local = `${inscrito.localBatismo || ''} ${inscrito.dataBatismo ? '(' + formatarDataBR(inscrito.dataBatismo) + ')' : ''}`.trim();
    doc.text(local, 55, y);
  }
  y += lineGap - 1.5;
  drawCheckbox('NÃO', !inscrito.batizado, 10, y);
  y += lineGap;

  // EUCARISTIA / CRISMA (Para Crismal Jovem & Adultos)
  if (mod === 'CRI' || mod === 'ADU') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('EUCARISTIA?', 10, y);
    drawCheckbox('SIM', inscrito.eucaristia, 35, y);
    drawCheckbox('NÃO', !inscrito.eucaristia, 52, y);

    if (mod === 'ADU') {
      doc.setFont('helvetica', 'bold');
      doc.text('CRISMA?', 80, y);
      drawCheckbox('SIM', inscrito.crisma, 100, y);
      drawCheckbox('NÃO', !inscrito.crisma, 117, y);
    }
    y += lineGap;
  }

  // PAIS (Para PRE, EUC, PER, CRI)
  if (mod !== 'ADU') {
    // DADOS DO PAI
    drawFieldLine('NOME DO PAI:', inscrito.nomePai || '', y);
    y += lineGap;

    const telPaiVal = formatarTelefone(inscrito.telefonePai) || (inscrito.responsavel?.telefone ? formatarTelefone(inscrito.responsavel.telefone) : '');
    const emailPaiVal = inscrito.emailPai || (inscrito.responsavel?.email || '');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('TELEFONE PAI:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(telPaiVal || '__________________', 38, y);

    doc.setFont('helvetica', 'bold');
    doc.text('E-MAIL PAI:', 105, y);
    doc.setFont('helvetica', 'normal');
    doc.text(emailPaiVal || '___________________________', 126, y);
    y += lineGap;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('O PAI JÁ RECEBEU OS SACRAMENTOS DE INICIAÇÃO À VIDA CRISTÃ?', 10, y);
    y += lineGap - 1.5;
    doc.setFont('helvetica', 'bold');
    doc.text('BATISMO', 10, y);
    drawCheckbox('SIM', !!inscrito.paiSacramentos?.batismo, 30, y);
    drawCheckbox('NÃO', !inscrito.paiSacramentos?.batismo, 45, y);

    doc.setFont('helvetica', 'bold');
    doc.text('EUCARISTIA', 70, y);
    drawCheckbox('SIM', !!inscrito.paiSacramentos?.eucaristia, 92, y);
    drawCheckbox('NÃO', !inscrito.paiSacramentos?.eucaristia, 107, y);

    doc.setFont('helvetica', 'bold');
    doc.text('CRISMA', 130, y);
    drawCheckbox('SIM', !!inscrito.paiSacramentos?.crisma, 148, y);
    drawCheckbox('NÃO', !inscrito.paiSacramentos?.crisma, 163, y);
    y += lineGap;

    // DADOS DA MÃE
    drawFieldLine('NOME DA MÃE:', inscrito.nomeMae || '', y);
    y += lineGap;

    const telMaeVal = formatarTelefone(inscrito.telefoneMae) || (inscrito.responsavel?.telefone ? formatarTelefone(inscrito.responsavel.telefone) : '');
    const emailMaeVal = inscrito.emailMae || (inscrito.responsavel?.email || '');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('TELEFONE MÃE:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(telMaeVal || '__________________', 38, y);

    doc.setFont('helvetica', 'bold');
    doc.text('E-MAIL MÃE:', 105, y);
    doc.setFont('helvetica', 'normal');
    doc.text(emailMaeVal || '___________________________', 128, y);
    y += lineGap;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('A MÃE JÁ RECEBEU OS SACRAMENTOS DE INICIAÇÃO À VIDA CRISTÃ?', 10, y);
    y += lineGap - 1.5;
    doc.setFont('helvetica', 'bold');
    doc.text('BATISMO', 10, y);
    drawCheckbox('SIM', !!inscrito.maeSacramentos?.batismo, 30, y);
    drawCheckbox('NÃO', !inscrito.maeSacramentos?.batismo, 45, y);

    doc.setFont('helvetica', 'bold');
    doc.text('EUCARISTIA', 70, y);
    drawCheckbox('SIM', !!inscrito.maeSacramentos?.eucaristia, 92, y);
    drawCheckbox('NÃO', !inscrito.maeSacramentos?.eucaristia, 107, y);

    doc.setFont('helvetica', 'bold');
    doc.text('CRISMA', 130, y);
    drawCheckbox('SIM', !!inscrito.maeSacramentos?.crisma, 148, y);
    drawCheckbox('NÃO', !inscrito.maeSacramentos?.crisma, 163, y);
    y += lineGap;

    // MATRIMÔNIO DOS PAIS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('OS PAIS REALIZARAM O SACRAMENTO DO MATRIMÔNIO?', 10, y);
    y += lineGap - 1.5;
    drawCheckbox('SIM - ONDE?', !!inscrito.paisMatrimonio, 10, y);
    if (inscrito.paisMatrimonio) {
      doc.setFont('helvetica', 'normal');
      doc.text(inscrito.ondeMatrimonioPais || '________________________________________', 38, y);
    }
    y += lineGap - 1.5;
    drawCheckbox('NÃO', !inscrito.paisMatrimonio, 10, y);
    y += lineGap;

    // DIVÓRCIO (Para PRE, EUC, PER)
    if (mod === 'PRE' || mod === 'EUC' || mod === 'PER') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('OS PAIS SÃO DIVORCIADOS?', 10, y);
      y += lineGap - 1.5;
      drawCheckbox('SIM – DE QUEM É A GUARDA?', !!inscrito.paisDivorciados, 10, y);
      if (inscrito.paisDivorciados) {
        doc.setFont('helvetica', 'normal');
        doc.text(inscrito.guardaDivorcio || '__________________________________', 62, y);
      }
      y += lineGap - 1.5;
      drawCheckbox('NÃO', !inscrito.paisDivorciados, 10, y);
      y += lineGap;
    }
  }

  // PARTICIPAÇÃO EM PASTORAL
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(mod === 'ADU' ? 'PARTICIPA DE ALGUMA PASTORAL OU GRUPO NA IGREJA?' : 'OS PAIS/FAMÍLIA PARTICIPAM DE ALGUMA PASTORAL OU GRUPO NA IGREJA?', 10, y);
  y += lineGap - 1.5;
  drawCheckbox('SIM - QUAL?', inscrito.familiaPastoral, 10, y);
  if (inscrito.familiaPastoral) {
    doc.setFont('helvetica', 'normal');
    doc.text(inscrito.qualPastoral || '________________________________________', 34, y);
  }
  y += lineGap - 1.5;
  drawCheckbox('NÃO', !inscrito.familiaPastoral, 10, y);
  y += lineGap;

  // MOTIVAÇÃO (Para Adultos)
  if (mod === 'ADU') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('O QUE O MOTIVOU A FAZER A INSCRIÇÃO NA CATEQUESE?', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(inscrito.motivacao || '________________________________________________________', 92, y);
    y += lineGap;
  }

  // NECESSIDADE ESPECIAL
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('TEM ALGUMA NECESSIDADE ESPECIAL?', 10, y);
  y += lineGap - 1.5;
  drawCheckbox('SIM - QUAL(IS)?', inscrito.necessidadeEspecial, 10, y);
  if (inscrito.necessidadeEspecial) {
    doc.setFont('helvetica', 'normal');
    doc.text(inscrito.qualNecessidade || '________________________________________', 38, y);
  }
  y += lineGap - 1.5;
  drawCheckbox('NÃO', !inscrito.necessidadeEspecial, 10, y);
  y += lineGap;

  // AUTORIZAÇÃO DE FOTOS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('AUTORIZA PUBLICAÇÃO DE FOTOS/IMAGENS DE ATIVIDADES DA CATEQUESE NAS REDES SOCIAIS DA', 10, y);
  y += lineGap - 2.5;
  doc.text('ARQUIDIOCESE/IGREJA?', 10, y);
  y += lineGap - 1.5;
  drawCheckbox('SIM', inscrito.autorizaFotos !== false, 10, y);
  y += lineGap - 1.5;
  drawCheckbox('NÃO', inscrito.autorizaFotos === false, 10, y);
  y += lineGap;

  // OBSERVAÇÕES
  drawFieldLine('OBSERVAÇÕES:', inscrito.observacoes || '', y);
  y += lineGap + 2;

  // DATA DA INSCRIÇÃO & ASSINATURA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DATA DA INSCRIÇÃO:', 10, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatarDataBR(inscrito.dataInscricao) || '______/ ______/ ___________', 45, y);
  y += lineGap + 4;

  const rotuloAssinatura = (mod === 'ADU' || mod === 'CRI') ? 'ASSINATURA DO INTERESSADO:' : 'ASSINATURA DOS PAIS OU RESPONSÁVEL:';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(rotuloAssinatura, 10, y);
  doc.setFont('helvetica', 'normal');
  doc.text('____________________________________________________________________', 70, y);

  // Rodapé fixo (Exatamente igual ao anexo)
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('www.arquidiocesedeteresina.org.br', 50, 288);
  doc.text('@igsaojose', 160, 288);

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

  doc.setFillColor(128, 0, 32);
  doc.rect(0, 0, 297, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('IGREJA SÃO JOSÉ - LAR DE MISERICÓRDIA - LISTA DE PRESENÇA', 148, 8, { align: 'center' });

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(13);
  doc.text(`TURMA: ${turma.nome} (${MODALIDADE_NAMES[turma.modalidade]})`, 15, 20);

  const catTexto = turma.catequistaSecundarioNome
    ? `${turma.catequistaNome || 'A definir'} e ${turma.catequistaSecundarioNome}`
    : (turma.catequistaNome || 'A definir');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Catequista(s): ${catTexto} | Horário: ${turma.horario} (${turma.diaSemana}) | Sala: ${turma.sala}`, 15, 25);
  doc.text(`Ano de Conclusão: ${turma.anoPastoral || 2028} | Total de Alunos: ${inscritos.length}`, 15, 30);

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

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(140, 120, 81);
  doc.text(`IGREJA SÃO JOSÉ - LAR DE MISERICÓRDIA — CATEQUESE IVC`, 105, 14, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(45, 42, 38);
  doc.text(`RELATÓRIO DE ANIVERSARIANTES DO MÊS DE ${mesNome.toUpperCase()}`, 105, 20, { align: 'center' });

  // Ordenar por dia de nascimento
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

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(128, 0, 32);
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
    head: [['Protocolo', 'Inscrito', 'Modalidade', 'Contato', 'Documentos Pendentes']],
    body,
    margin: { left: 15, right: 15 }
  });

  doc.save('Relatorio_Documentos_Pendentes.pdf');
}
