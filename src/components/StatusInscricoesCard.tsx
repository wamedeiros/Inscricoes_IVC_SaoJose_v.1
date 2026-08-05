import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, CheckCircle2, XCircle, Power } from 'lucide-react';
import { ConfigSistema } from '../types';
import { getConfig, saveConfig, subscribeStorage } from '../services/storage';
import { ConfirmModal } from './ConfirmModal';

export const StatusInscricoesCard: React.FC = () => {
  const [config, setConfig] = useState<ConfigSistema>(() => getConfig());
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [targetState, setTargetState] = useState<boolean>(true);

  useEffect(() => {
    return subscribeStorage(() => {
      setConfig(getConfig());
    });
  }, []);

  const abertas = config.inscricoesAbertas !== false; // Padrão: true (Abertas)

  const handleToggleClick = () => {
    const nextState = !abertas;
    setTargetState(nextState);
    setModalConfirmOpen(true);
  };

  const handleConfirmToggle = () => {
    const updated = {
      ...config,
      inscricoesAbertas: targetState
    };
    saveConfig(updated);
    setConfig(updated);
    setModalConfirmOpen(false);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C7851] bg-[#F3F1ED] px-2.5 py-1 rounded-md border border-[#E5E1DA]">
              Controle de Acesso Público
            </span>
            <h3 className="text-lg font-black text-[#2D2A26] mt-1 flex items-center gap-2">
              <Power className={`w-5 h-5 ${abertas ? 'text-emerald-600' : 'text-rose-600'}`} />
              <span>Status das Inscrições</span>
            </h3>
            <p className="text-xs text-[#5D574F] mt-0.5">
              Alterne o estado das inscrições com apenas um clique. A mudança entra em vigor instantaneamente no sistema.
            </p>
          </div>

          {/* Interruptor (Toggle Switch) */}
          <div className="flex flex-col items-end gap-1.5">
            <button
              type="button"
              onClick={handleToggleClick}
              aria-label="Alterar status das inscrições"
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-md ${
                abertas
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 ring-2 ring-rose-500/30'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                <span>{abertas ? '🟢 INSCRIÇÕES ABERTAS' : '🔴 INSCRIÇÕES FECHADAS'}</span>
              </span>
              {abertas ? (
                <ToggleRight className="w-6 h-6 text-emerald-100 shrink-0" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-rose-100 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Texto de confirmação abaixo do interruptor */}
        <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-bold ${
          abertas
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-rose-50/80 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {abertas ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>
              Status atual: <strong>{abertas ? 'Inscrições Abertas' : 'Inscrições Fechadas'}</strong>
            </span>
          </div>

          <span className="text-[11px] font-normal opacity-85">
            {abertas
              ? 'O formulário de inscrição está disponível para acesso e preenchimento público.'
              : 'O acesso público ao formulário está bloqueado e exibe o aviso prévio.'}
          </span>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={modalConfirmOpen}
        title={targetState ? 'Abrir Inscrições' : 'Fechar Inscrições'}
        message={
          targetState
            ? 'Tem certeza de que deseja abrir as inscrições? O formulário ficará imediatamente disponível para novos inscritos.'
            : 'Tem certeza de que deseja fechar as inscrições? A partir deste momento, nenhum usuário conseguirá acessar o formulário de inscrição até que ele seja reaberto.'
        }
        confirmLabel={targetState ? 'Sim, Abrir Inscrições' : 'Sim, Fechar Inscrições'}
        cancelLabel="Cancelar"
        variant={targetState ? 'info' : 'danger'}
        onConfirm={handleConfirmToggle}
        onClose={() => setModalConfirmOpen(false)}
      />
    </>
  );
};
