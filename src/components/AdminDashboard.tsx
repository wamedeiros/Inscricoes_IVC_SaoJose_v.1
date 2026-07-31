import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  CalendarCheck,
  AlertTriangle,
  Clock,
  Building2,
  CheckCircle,
  FileCheck2,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Inscrito, Turma, Comunidade, MODALIDADE_NAMES, ModalidadeCatequese } from '../types';
import { getInscritos, getTurmas, getComunidades, subscribeStorage } from '../services/storage';

const COLORS = ['#8C7851', '#C4A976', '#5D574F', '#2D2A26', '#A69F95', '#D2C7B5'];

export const AdminDashboard: React.FC = () => {
  const [inscritos, setInscritos] = useState<Inscrito[]>(() => getInscritos());
  const [turmas, setTurmas] = useState<Turma[]>(() => getTurmas());
  const [comunidades, setComunidades] = useState<Comunidade[]>(() => getComunidades());

  useEffect(() => {
    const unsub = subscribeStorage(() => {
      setInscritos(getInscritos());
      setTurmas(getTurmas());
      setComunidades(getComunidades());
    });
    return () => unsub();
  }, []);

  // KPIs
  const totalInscritos = inscritos.length;
  const matriculadosCount = inscritos.filter(i => i.status === 'Matriculada' || i.status === 'Turma definida').length;
  const listaEsperaTotal = turmas.reduce((acc, t) => acc + (t.listaEsperaCount || 0), 0);
  const vagasTotais = turmas.reduce((acc, t) => acc + t.vagasMaximas, 0);
  const vagasOcupadasTotais = turmas.reduce((acc, t) => acc + t.vagasOcupadas, 0);
  const vagasDisponiveis = Math.max(0, vagasTotais - vagasOcupadasTotais);

  // Distribuicão por Modalidade
  const porModalidadeData: { name: string; sigla: string; value: number }[] = [
    { name: 'Pré-Catequese', sigla: 'PRE', value: inscritos.filter(i => i.modalidade === 'PRE').length },
    { name: 'Eucaristia', sigla: 'EUC', value: inscritos.filter(i => i.modalidade === 'EUC').length },
    { name: 'Perseverança', sigla: 'PER', value: inscritos.filter(i => i.modalidade === 'PER').length },
    { name: 'Crisma Jovem', sigla: 'CRI', value: inscritos.filter(i => i.modalidade === 'CRI').length },
    { name: 'Catecumenato Adulto', sigla: 'ADU', value: inscritos.filter(i => i.modalidade === 'ADU').length }
  ];

  // Distribuicão por Turma (Ocupação vs Capacidade)
  const turmasChartData = turmas.map(t => ({
    nome: t.nome.length > 18 ? t.nome.substring(0, 18) + '...' : t.nome,
    Ocupadas: t.vagasOcupadas,
    Capacidade: t.vagasMaximas,
    Espera: t.listaEsperaCount
  }));

  // Distribuição por Status
  const statusCounts: Record<string, number> = {};
  inscritos.forEach(i => {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
  });

  const statusPieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  return (
    <div className="space-y-6">
      {/* Header do Painel */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7851] bg-[#F3F1ED] px-2.5 py-1 rounded-md border border-[#E5E1DA]">
            Painel Geral de Indicadores
          </span>
          <h2 className="text-2xl font-black text-[#2D2A26] mt-1">Dashboard da Catequese (IVC)</h2>
          <p className="text-xs text-[#5D574F]">
            Acompanhamento em tempo real das inscrições, turmas e documentos na Igreja São José - Lar de Misericórdia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#5D574F] bg-[#FAF9F7] px-3 py-1.5 rounded-xl border border-[#E5E1DA]">
            Ano Pastoral: <strong className="text-[#8C7851]">2028</strong>
          </span>
        </div>
      </div>

      {/* Grid de Cards de Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5E1DA] flex items-center gap-4">
          <div className="p-3 bg-[#F3F1ED] text-[#8C7851] rounded-xl border border-[#E5E1DA]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#A69F95] uppercase tracking-wider block">Total Inscritos</span>
            <span className="text-2xl font-black text-[#2D2A26]">{totalInscritos}</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">✓ 100% atualizado</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5E1DA] flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            <CalendarCheck className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#A69F95] uppercase tracking-wider block">Vagas Disponíveis</span>
            <span className="text-2xl font-black text-[#2D2A26]">{vagasDisponiveis}</span>
            <span className="text-[10px] text-[#A69F95] block mt-0.5">De {vagasTotais} vagas totais</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5E1DA] flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
            <Clock className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#A69F95] uppercase tracking-wider block">Lista de Espera</span>
            <span className="text-2xl font-black text-amber-800">{listaEsperaTotal}</span>
            <span className="text-[10px] text-[#A69F95] block mt-0.5">Aguardando vaga</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5E1DA] flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            <UserCheck className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#A69F95] uppercase tracking-wider block">Matriculados</span>
            <span className="text-2xl font-black text-emerald-800">{matriculadosCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Matrícula ou turma</span>
          </div>
        </div>
      </div>

      {/* Cards de Inscrições por Modalidade */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {porModalidadeData.map((m, idx) => (
          <div key={m.sigla} className="bg-white p-4 rounded-xl border border-[#E5E1DA] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#A69F95]">{m.sigla}</span>
              <h4 className="text-xs font-bold text-[#2D2A26]">{m.name}</h4>
              <span className="text-xl font-extrabold text-[#8C7851] mt-1 block">{m.value}</span>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border border-[#E5E1DA]" style={{ backgroundColor: `${COLORS[idx]}15`, color: COLORS[idx] }}>
              {Math.round((m.value / (totalInscritos || 1)) * 100)}%
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos em Recharts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Ocupação das Turmas */}
        <div className="lg:col-col-span-2 lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2D2A26] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#8C7851]" />
              <span>Ocupação das Turmas (Matriculados vs Capacidade)</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turmasChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="nome" tick={{ fontSize: 10, fill: '#5D574F' }} />
                <YAxis tick={{ fontSize: 10, fill: '#5D574F' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Ocupadas" fill="#8C7851" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Capacidade" fill="#E5E1DA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Espera" fill="#C4A976" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Status dos Cadastros */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] space-y-4">
          <h3 className="text-sm font-bold text-[#2D2A26] flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#8C7851]" />
            <span>Distribuição de Status</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
