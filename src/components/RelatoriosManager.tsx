import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  FileCheck2,
} from 'lucide-react';
import { getInscritos, getTurmas, getComunidades, getCatequistas, subscribeStorage } from '../services/storage';
import {
  gerarListaPresencaPDF,
  gerarRelatorioAniversariantesPDF,
  gerarRelatorioDocPendentesPDF,
  AniversarianteItem
} from '../services/pdfGenerator';
import { exportarInscritosExcel } from '../services/excelGenerator';
import { MODALIDADE_NAMES } from '../types';

export const RelatoriosManager: React.FC = () => {
  const [inscritos, setInscritos] = useState(getInscritos());
  const [turmas, setTurmas] = useState(getTurmas());
  const [comunidades, setComunidades] = useState(getComunidades());
  const [catequistas, setCatequistas] = useState(getCatequistas());

  const [mesAniversario, setMesAniversario] = useState('01');
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState(turmas[0]?.id || '');

  useEffect(() => {
    const unsub = subscribeStorage(() => {
      setInscritos(getInscritos());
      setTurmas(getTurmas());
      setComunidades(getComunidades());
      setCatequistas(getCatequistas());
    });
    return () => unsub();
  }, []);

  const NORM_MESES: Record<string, string> = {
    '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
    '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
    '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
  };

  const handleGerarAniversariantes = () => {
    const listaAniversariantes: AniversarianteItem[] = [];

    // 1. Catequizando (Inscritos)
    inscritos.forEach(i => {
      if (!i.dataNascimento) return;
      const m = i.dataNascimento.split('-')[1];
      if (m === mesAniversario) {
        listaAniversariantes.push({
          tipo: 'Catequizando',
          nome: i.nome,
          dataNascimento: i.dataNascimento,
          detalheOuModalidade: MODALIDADE_NAMES[i.modalidade] || i.modalidade,
          telefone: i.telefone || (i.responsavel ? i.responsavel.telefone : ''),
          email: i.email || ''
        });
      }
    });

    // 2. Catequistas
    catequistas.forEach(c => {
      if (!c.dataNascimento) return;
      const m = c.dataNascimento.split('-')[1];
      if (m === mesAniversario) {
        listaAniversariantes.push({
          tipo: 'Catequista',
          nome: c.nome,
          dataNascimento: c.dataNascimento,
          detalheOuModalidade: c.formacao ? `Catequista (${c.formacao})` : 'Catequista da Paróquia',
          telefone: c.telefone || '',
          email: c.email || ''
        });
      }
    });

    gerarRelatorioAniversariantesPDF(listaAniversariantes, NORM_MESES[mesAniversario] || 'Mês');
  };

  const handleGerarDocPendentes = () => {
    const pendentes = inscritos.filter(i => i.status === 'Documentos pendentes' || i.documentos.length === 0);
    gerarRelatorioDocPendentesPDF(pendentes);
  };

  const handleGerarPresenca = () => {
    const t = turmas.find(x => x.id === turmaSelecionadaId);
    if (!t) return;
    const alunos = inscritos.filter(i => i.turmaId === t.id);
    gerarListaPresencaPDF(t, alunos);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8C7851] bg-[#F3F1ED] px-2.5 py-1 rounded-md border border-[#E5E1DA]">
          Central de Relatórios & Impressão
        </span>
        <h2 className="text-2xl font-black text-[#2D2A26] mt-1">Emissão de Listas, Documentos e Planilhas</h2>
        <p className="text-xs text-[#5D574F]">
          Gere diários oficiais em PDF ou exporte planilhas completas em Excel para acompanhamento da catequese.
        </p>
      </div>

      {/* Grid de Cards de Relatórios */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Relatório 1: Diário de Presença por Turma */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-[#F3F1ED] text-[#8C7851] rounded-xl flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#2D2A26] text-sm">Diário / Lista de Presença da Turma</h3>
            <p className="text-xs text-[#5D574F]">
              Gera a folha oficial de presença para os encontros semanais da turma com caixas para visto e chamada.
            </p>
            <div className="pt-2">
              <select
                value={turmaSelecionadaId}
                onChange={(e) => setTurmaSelecionadaId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5E1DA] rounded-xl bg-white focus:outline-none focus:border-[#8C7851]"
              >
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGerarPresenca}
            className="w-full py-2.5 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            Gerar Diário PDF (A4 Paisagem)
          </button>
        </div>

        {/* Relatório 2: Aniversariantes do Mês */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-[#F3F1ED] text-[#8C7851] rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#2D2A26] text-sm">Aniversariantes do Mês</h3>
            <p className="text-xs text-[#5D574F]">
              Lista dos catequizandos que fazem aniversário no mês selecionado para celebrações comunitárias.
            </p>
            <div className="pt-2">
              <select
                value={mesAniversario}
                onChange={(e) => setMesAniversario(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5E1DA] rounded-xl bg-white focus:outline-none focus:border-[#8C7851]"
              >
                {Object.keys(NORM_MESES).map(key => (
                  <option key={key} value={key}>{NORM_MESES[key]}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGerarAniversariantes}
            className="w-full py-2.5 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            Gerar Relatório PDF
          </button>
        </div>

        {/* Relatório 3: Documentos Pendentes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-[#F3F1ED] text-[#8C7851] rounded-xl flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#2D2A26] text-sm">Relatório de Pendências Documentais</h3>
            <p className="text-xs text-[#5D574F]">
              Lista de catequizandos com certidões de batismo ou residência pendentes para regularização na Secretaria.
            </p>
          </div>

          <button
            onClick={handleGerarDocPendentes}
            className="w-full py-2.5 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            Gerar PDF de Pendências
          </button>
        </div>

        {/* Relatório 4: Exportação Geral Excel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#2D2A26] text-sm">Banco de Dados Geral (Excel .xlsx)</h3>
            <p className="text-xs text-[#5D574F]">
              Exporta todas as fichas de inscrições, sacramentos e dados dos responsáveis para planilha Excel formatada.
            </p>
          </div>

          <button
            onClick={() => exportarInscritosExcel(inscritos)}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Baixar Planilha Excel Completa
          </button>
        </div>

      </div>
    </div>
  );
};
