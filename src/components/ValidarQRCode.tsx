import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { PublicComprovanteDTO } from '../types';
import { validarComprovantePublico, validarComprovantePublicoAsync } from '../services/storage';
import { formatarDataBR } from '../services/config';

export const ValidarQRCode: React.FC = () => {
  const [protocolo, setProtocolo] = useState('');
  const [dadosValidos, setDadosValidos] = useState<PublicComprovanteDTO | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Ler query param se vier por URL (#validar?protocolo=2028-EUC-000001)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('protocolo=')) {
      const match = hash.match(/protocolo=([^&]+)/);
      if (match && match[1]) {
        const prot = decodeURIComponent(match[1]);
        setProtocolo(prot);
        validar(prot);
      }
    }
  }, []);

  const validar = async (protKey: string) => {
    setCarregando(true);
    setVerificado(true);
    const syncDto = validarComprovantePublico(protKey);
    if (syncDto) {
      setDadosValidos(syncDto);
      setCarregando(false);
      return;
    }
    const asyncDto = await validarComprovantePublicoAsync(protKey);
    setDadosValidos(asyncDto);
    setCarregando(false);
  };

  const handleValidarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (protocolo.trim()) {
      validar(protocolo.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-[#E5E1DA] space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-[#F3F1ED] text-[#8C7851] rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner border border-[#E5E1DA]">
          <QrCode className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#2D2A26]">Validar Comprovante de Inscrição</h2>
        <p className="text-xs text-[#5D574F] max-w-md mx-auto leading-relaxed">
          Informe o código do protocolo impresso no comprovante para verificar a autenticidade e consultar a situação atual da inscrição.
        </p>
      </div>

      <form onSubmit={handleValidarSubmit} className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          required
          placeholder="Ex: 2028-EUC-000001"
          value={protocolo}
          onChange={(e) => setProtocolo(e.target.value)}
          className="flex-1 px-4 py-2.5 text-xs font-mono font-bold uppercase border border-[#E5E1DA] rounded-xl focus:ring-2 focus:ring-[#8C7851]/30 focus:border-[#8C7851] focus:outline-none"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#8C7851]/20 transition-all cursor-pointer"
        >
          <span>Validar Código</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {verificado && (
        dadosValidos ? (
          <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-800 font-extrabold text-base border-b border-emerald-200 pb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>Comprovante Autêntico & Válido</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs text-[#4A443F]">
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-100">
                <span className="text-[#A69F95] font-semibold text-[11px] block">Nome do Catequizando</span>
                <p className="font-extrabold text-[#2D2A26] text-sm mt-0.5">{dadosValidos.nome}</p>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-emerald-100">
                <span className="text-[#A69F95] font-semibold text-[11px] block">Número do Protocolo</span>
                <p className="font-mono font-bold text-[#8C7851] text-sm mt-0.5">{dadosValidos.protocolo}</p>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-emerald-100">
                <span className="text-[#A69F95] font-semibold text-[11px] block">Situação da Inscrição</span>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {dadosValidos.status}
                </span>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-emerald-100">
                <span className="text-[#A69F95] font-semibold text-[11px] block">Data da Inscrição</span>
                <p className="font-bold text-[#2D2A26] text-sm mt-0.5">{formatarDataBR(dadosValidos.dataInscricao)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-[#FAF9F7] border-2 border-[#E5E1DA] rounded-2xl text-center space-y-2">
            <ShieldAlert className="w-10 h-10 text-amber-700 mx-auto" />
            <h3 className="font-bold text-[#2D2A26] text-base">Comprovante Não Localizado</h3>
            <p className="text-xs text-[#5D574F]">
              O número de protocolo <span className="font-mono font-bold text-[#2D2A26]">{protocolo}</span> não pertence a nenhum comprovante ativo cadastrado no sistema.
            </p>
          </div>
        )
      )}
    </div>
  );
};
