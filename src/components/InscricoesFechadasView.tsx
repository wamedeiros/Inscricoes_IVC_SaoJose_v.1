import React from 'react';
import { Church, Lock, ArrowLeft } from 'lucide-react';

interface InscricoesFechadasViewProps {
  onVoltar?: () => void;
  onOpenLogin?: () => void;
}

export const InscricoesFechadasView: React.FC<InscricoesFechadasViewProps> = ({
  onVoltar,
  onOpenLogin
}) => {
  const handleVoltar = () => {
    if (onVoltar) {
      onVoltar();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 sm:my-12 px-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-[#E5E1DA] shadow-xl overflow-hidden">
        {/* Cabeçalho de Identidade Visual da Catequese */}
        <div className="bg-[#2D2A26] text-[#E5E1DA] p-6 sm:p-8 text-center space-y-3">
          <div className="w-16 h-16 bg-[#8C7851]/30 border-2 border-[#C4A976] rounded-2xl flex items-center justify-center mx-auto text-[#C4A976] shadow-inner">
            <Church className="w-9 h-9" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#C4A976] bg-[#8C7851]/20 px-3 py-1 rounded-full border border-[#8C7851]/40">
              Iniciação à Vida Cristã (IVC)
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2.5">
              Igreja São José — Lar de Misericórdia
            </h2>
            <p className="text-xs text-[#A69F95] mt-1 font-medium">
              Arquidiocese de Teresina
            </p>
          </div>
        </div>

        {/* Mensagem Informativa de Inscrições Fechadas */}
        <div className="p-6 sm:p-8 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-full text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
            <span>🔴 INSCRIÇÕES TEMPORARIAMENTE FECHADAS</span>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-[#2D2A26] tracking-tight">
              Inscrições temporariamente fechadas
            </h3>

            <div className="text-xs sm:text-sm text-[#5D574F] leading-relaxed space-y-3.5 max-w-lg mx-auto bg-[#FAF9F7] p-5 sm:p-6 rounded-2xl border border-[#E5E1DA] text-left">
              <p className="font-medium text-[#2D2A26]">
                As inscrições para a Catequese 2026 estão temporariamente fechadas neste momento.
              </p>
              <p>
                As inscrições são realizadas antes e após as missas dos finais de semana durante todo o mês de agosto. O sistema será reaberto nesses períodos.
              </p>
              <p className="italic text-[#8C7851] font-semibold pt-1 border-t border-[#E5E1DA]/80">
                Agradecemos sua compreensão e esperamos você em um dos próximos horários de inscrição.
              </p>
            </div>
          </div>

          {/* Botão de Ação: Voltar à página inicial */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleVoltar}
              className="w-full sm:w-auto px-6 py-3 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#8C7851]/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar à página inicial</span>
            </button>

            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-[#5D574F] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#E5E1DA]"
              >
                <Lock className="w-4 h-4 text-[#8C7851]" />
                <span>Área do Coordenador</span>
              </button>
            )}
          </div>
        </div>

        {/* Rodapé Informativo */}
        <div className="bg-[#FAF9F7] px-6 py-3 border-t border-[#E5E1DA] text-[11px] text-[#A69F95] text-center">
          <span>Dúvidas ou informações sobre horários de missa: procure a Secretaria Paroquial.</span>
        </div>
      </div>
    </div>
  );
};
