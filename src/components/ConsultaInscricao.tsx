import React, { useState } from 'react';
import { Search, FileText, Printer, CheckCircle2, AlertCircle, QrCode } from 'lucide-react';
import { Inscrito, MODALIDADE_NAMES } from '../types';
import { getInscritos, getInscritoPorProtocolo } from '../services/storage';
import { formatarDataBR, formatarCPF, formatarTelefone } from '../services/config';
import { gerarComprovanteInscricaoPDF } from '../services/pdfGenerator';

export const ConsultaInscricao: React.FC = () => {
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState<Inscrito[]>([]);
  const [buscou, setBuscou] = useState(false);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termoBusca.trim()) return;

    setBuscou(true);
    const key = termoBusca.trim().toLowerCase();

    // Tentar busca exata por protocolo
    const porProt = getInscritoPorProtocolo(key);
    if (porProt) {
      setResultados([porProt]);
      return;
    }

    // Busca ampla por nome ou telefone
    const todos = getInscritos();
    const filtrados = todos.filter(i =>
      i.nome.toLowerCase().includes(key) ||
      i.protocolo.toLowerCase().includes(key) ||
      (i.responsavel && i.responsavel.nome.toLowerCase().includes(key)) ||
      i.telefone.includes(key)
    );

    setResultados(filtrados);
  };

  return (
    <div className="max-w-4xl mx-auto my-6 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-[#E5E1DA]">
      <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
        <div className="w-12 h-12 bg-[#F3F1ED] text-[#8C7851] rounded-2xl flex items-center justify-center mx-auto text-xl border border-[#E5E1DA]">
          <Search className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#2D2A26]">Consultar Inscrição</h2>
        <p className="text-xs text-[#5D574F]">
          Informe o Número do Protocolo (Ex: <span className="font-mono text-[#8C7851] font-bold">2028-EUC-000001</span>) ou Nome do Catequizando.
        </p>
      </div>

      <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
        <input
          type="text"
          required
          placeholder="Digite o Protocolo ou Nome do Catequizando..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="flex-1 px-4 py-3 text-xs border border-[#E5E1DA] rounded-xl focus:ring-2 focus:ring-[#8C7851]/30 focus:border-[#8C7851] focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#8C7851]/20 cursor-pointer transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Consultar</span>
        </button>
      </form>

      {buscou && resultados.length === 0 && (
        <div className="p-8 text-center bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl text-[#5D574F] text-xs">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <p className="font-bold text-[#2D2A26]">Nenhuma inscrição localizada para "{termoBusca}".</p>
          <p className="text-[#A69F95] mt-1">Verifique se o protocolo ou nome foi digitado corretamente.</p>
        </div>
      )}

      {resultados.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A69F95]">
            {resultados.length} Inscrição(ões) Encontrada(s):
          </h3>

          <div className="grid gap-4">
            {resultados.map(ins => (
              <div key={ins.id} className="p-5 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl space-y-4 hover:border-[#8C7851] transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E1DA] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#8C7851] uppercase tracking-wider block">Protocolo de Matrícula</span>
                    <span className="text-lg font-extrabold text-[#2D2A26] font-mono">{ins.protocolo}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F3F1ED] text-[#8C7851] border border-[#E5E1DA]">
                      {ins.status}
                    </span>
                    <button
                      onClick={() => gerarComprovanteInscricaoPDF(ins, 'print')}
                      className="px-3 py-1.5 bg-[#FAF9F7] hover:bg-[#F3F1ED] text-[#8C7851] border border-[#8C7851] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                      title="Imprimir Ficha de Inscrição"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir Ficha</span>
                    </button>
                    <button
                      onClick={() => gerarComprovanteInscricaoPDF(ins, 'download')}
                      className="px-3 py-1.5 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                      title="Exportar PDF da Ficha de Inscrição"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Exportar PDF</span>
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#A69F95] font-medium block">Nome Completo:</span>
                    <span className="font-bold text-[#2D2A26]">{ins.nome}</span>
                  </div>

                  <div>
                    <span className="text-[#A69F95] font-medium block">Modalidade:</span>
                    <span className="font-semibold text-[#8C7851]">{MODALIDADE_NAMES[ins.modalidade]}</span>
                  </div>

                  <div>
                    <span className="text-[#A69F95] font-medium block">Data Nasc. / Idade:</span>
                    <span className="font-bold text-[#2D2A26]">{formatarDataBR(ins.dataNascimento)} ({ins.idadeCalculada} anos)</span>
                  </div>

                  <div>
                    <span className="text-[#A69F95] font-medium block">Telefone:</span>
                    <span className="text-[#4A443F]">{formatarTelefone(ins.telefone)}</span>
                  </div>

                  <div>
                    <span className="text-[#A69F95] font-medium block">Responsável:</span>
                    <span className="text-[#4A443F]">{ins.responsavel ? ins.responsavel.nome : 'O próprio catequizando'}</span>
                  </div>

                  <div>
                    <span className="text-[#A69F95] font-medium block">Data da Inscrição:</span>
                    <span className="text-[#4A443F]">{formatarDataBR(ins.dataInscricao)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
