import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, ShieldAlert, UserCheck, ArrowRight, Printer } from 'lucide-react';
import { Inscrito, MODALIDADE_NAMES } from '../types';
import { getInscritoPorProtocolo } from '../services/storage';
import { formatarDataBR, formatarTelefone } from '../services/config';
import { gerarComprovanteInscricaoPDF } from '../services/pdfGenerator';

export const ValidarQRCode: React.FC = () => {
  const [protocolo, setProtocolo] = useState('');
  const [inscritoValido, setInscritoValido] = useState<Inscrito | null>(null);
  const [verificado, setVerificado] = useState(false);

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

  const validar = (protKey: string) => {
    setVerificado(true);
    const ins = getInscritoPorProtocolo(protKey);
    setInscritoValido(ins || null);
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
        <h2 className="text-2xl font-extrabold text-[#2D2A26]">Validação Autêntica de QR Code</h2>
        <p className="text-xs text-[#5D574F] max-w-md mx-auto">
          Insira o código do protocolo escaneado do comprovante para verificar instantaneamente a autenticidade do cadastro na Arquidiocese de Teresina.
        </p>
      </div>

      <form onSubmit={handleValidarSubmit} className="flex gap-2">
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
        inscritoValido ? (
          <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-800 font-extrabold text-base border-b border-emerald-200 pb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>Inscrição Autêntica & Cadastrada</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs text-[#4A443F]">
              <div>
                <span className="text-[#A69F95] font-medium">Catequizando:</span>
                <p className="font-extrabold text-[#2D2A26]">{inscritoValido.nome}</p>
              </div>

              <div>
                <span className="text-[#A69F95] font-medium">Protocolo / Matrícula:</span>
                <p className="font-mono font-bold text-[#8C7851]">{inscritoValido.protocolo}</p>
              </div>

              <div>
                <span className="text-[#A69F95] font-medium">Modalidade:</span>
                <p className="font-bold text-[#2D2A26]">{MODALIDADE_NAMES[inscritoValido.modalidade]}</p>
              </div>

              <div>
                <span className="text-[#A69F95] font-medium">Status da Matrícula:</span>
                <p className="font-bold text-emerald-800">{inscritoValido.status}</p>
              </div>

              <div>
                <span className="text-[#A69F95] font-medium">Data da Inscrição:</span>
                <p>{formatarDataBR(inscritoValido.dataInscricao)}</p>
              </div>

              <div>
                <span className="text-[#A69F95] font-medium">Contato Responsável:</span>
                <p>{formatarTelefone(inscritoValido.telefone)}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => gerarComprovanteInscricaoPDF(inscritoValido)}
                className="px-4 py-2 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                Imprimir Ficha Oficial
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-[#FAF9F7] border-2 border-[#E5E1DA] rounded-2xl text-center space-y-2">
            <ShieldAlert className="w-10 h-10 text-amber-700 mx-auto" />
            <h3 className="font-bold text-[#2D2A26] text-base">Inscrição Não Localizada</h3>
            <p className="text-xs text-[#5D574F]">
              O código de protocolo <span className="font-mono font-bold">{protocolo}</span> não pertence a nenhum registro ativo no banco de dados oficial.
            </p>
          </div>
        )
      )}
    </div>
  );
};
