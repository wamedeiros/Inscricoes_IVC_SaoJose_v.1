import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  FileText,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Printer,
  Sparkles,
  ShieldCheck,
  Search,
  Upload,
  BookOpen,
  Clock
} from 'lucide-react';
import {
  Inscrito,
  Responsavel,
  ModalidadeCatequese,
  MODALIDADE_NAMES,
  Paroquia,
  Comunidade,
  DocumentoAnexo
} from '../types';
import {
  determinarModalidade,
  formatarDataBR,
  formatarCPF,
  formatarTelefone
} from '../services/config';
import {
  getConfig,
  getParoquias,
  getComunidades,
  getResponsavelPorCPF,
  saveResponsavel,
  salvarInscrito
} from '../services/storage';
import { gerarComprovanteInscricaoPDF } from '../services/pdfGenerator';

interface FormularioInscricaoProps {
  onSucessoInscricao?: (inscrito: Inscrito) => void;
}

export const FormularioInscricao: React.FC<FormularioInscricaoProps> = ({ onSucessoInscricao }) => {
  const config = getConfig();
  const paroquias = getParoquias();
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [ondeNasceu, setOndeNasceu] = useState('Teresina - PI');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('Centro');
  const [cidade, setCidade] = useState('Teresina');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  // Paróquia / Comunidade selecionada
  const [paroquiaId, setParoquiaId] = useState(paroquias[0]?.id || '');
  const [comunidadeId, setComunidadeId] = useState('');

  // Cálculo de Modalidade
  const [resultadoCalculo, setResultadoCalculo] = useState(() => determinarModalidade(''));

  // Sacramentos
  const [batizado, setBatizado] = useState(false);
  const [localBatismo, setLocalBatismo] = useState('');
  const [dataBatismo, setDataBatismo] = useState('');

  const [eucaristia, setEucaristia] = useState(false);
  const [localEucaristia, setLocalEucaristia] = useState('');
  const [dataEucaristia, setDataEucaristia] = useState('');

  const [crisma, setCrisma] = useState(false);

  // Campos específicos de Adulto
  const [estadoCivil, setEstadoCivil] = useState<'Solteiro(a)' | 'Casado(a) no Civil' | 'Celebrou Matrimônio Religioso' | 'Outro'>('Solteiro(a)');
  const [motivacao, setMotivacao] = useState('');

  // Necessidades especiais & Pastoral
  const [necessidadeEspecial, setNecessidadeEspecial] = useState(false);
  const [qualNecessidade, setQualNecessidade] = useState('');

  const [familiaPastoral, setFamiliaPastoral] = useState(false);
  const [qualPastoral, setQualPastoral] = useState('');

  const [observacoes, setObservacoes] = useState('');

  // Dados dos Pais / Sacramentos dos Pais
  const [nomePai, setNomePai] = useState('');
  const [telefonePai, setTelefonePai] = useState('');
  const [emailPai, setEmailPai] = useState('');
  const [nomeMae, setNomeMae] = useState('');
  const [telefoneMae, setTelefoneMae] = useState('');
  const [emailMae, setEmailMae] = useState('');
  const [paiBatizado, setPaiBatizado] = useState(false);
  const [paiEucaristia, setPaiEucaristia] = useState(false);
  const [paiCrisma, setPaiCrisma] = useState(false);

  const [maeBatizada, setMaeBatizada] = useState(false);
  const [maeEucaristia, setMaeEucaristia] = useState(false);
  const [maeCrisma, setMaeCrisma] = useState(false);

  const [paisMatrimonio, setPaisMatrimonio] = useState(false);
  const [ondeMatrimonioPais, setOndeMatrimonioPais] = useState('');
  const [paisDivorciados, setPaisDivorciados] = useState(false);
  const [guardaDivorcio, setGuardaDivorcio] = useState('');
  const [autorizaFotos, setAutorizaFotos] = useState(true);

  // Responsável Legal (Opcional)
  const [respNome, setRespNome] = useState('');
  const [respCpf, setRespCpf] = useState('');
  const [respRg, setRespRg] = useState('');
  const [respTelefone, setRespTelefone] = useState('');
  const [respWhatsapp, setRespWhatsapp] = useState('');
  const [respEmail, setRespEmail] = useState('');
  const [respEndereco, setRespEndereco] = useState('');

  // Documentos Anexados (Simulação/Firebase Storage)
  const [documentos, setDocumentos] = useState<DocumentoAnexo[]>([]);

  // LGPD
  const [aceitoLGPD, setAceitoLGPD] = useState(false);

  // Estado de Sucesso / Conclusão
  const [preferenciasHorario, setPreferenciasHorario] = useState<string[]>([]);
  const [inscritoConcluido, setInscritoConcluido] = useState<Inscrito | null>(null);
  const [erroMsg, setErroMsg] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Atualizar comunidades ao mudar de paróquia
  useEffect(() => {
    if (paroquiaId) {
      const coms = getComunidades(paroquiaId);
      setComunidades(coms);
      if (coms.length > 0) {
        setComunidadeId(coms[0].id);
      }
    }
  }, [paroquiaId]);

  // Recalcular modalidade ao alterar data de nascimento ou o status de Eucaristia
  useEffect(() => {
    if (dataNascimento) {
      const res = determinarModalidade(dataNascimento, eucaristia, config);
      setResultadoCalculo(res);
    }
  }, [dataNascimento, eucaristia]);

  // Upload simulado de documento
  const handleSimularUploadDoc = (e: React.ChangeEvent<HTMLInputElement>, tipo: DocumentoAnexo['tipo']) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const novoDoc: DocumentoAnexo = {
        id: `doc-${Date.now()}`,
        tipo,
        nomeArquivo: file.name,
        url: '#',
        dataEnvio: new Date().toISOString().split('T')[0],
        status: 'Pendente'
      };
      setDocumentos(prev => [...prev.filter(d => d.tipo !== tipo), novoDoc]);
    }
  };

  // Submeter Inscrição
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErroMsg('');

    if (!dataNascimento) {
      setErroMsg('Por favor, informe a data de nascimento do catequizando.');
      return;
    }

    if (!resultadoCalculo.elegivel) {
      setErroMsg(`Não é possível prosseguir: ${resultadoCalculo.mensagem}`);
      return;
    }

    if (!aceitoLGPD) {
      setErroMsg('É obrigatório aceitar os termos de consentimento da LGPD para enviar a inscrição.');
      return;
    }

    const modalidade = resultadoCalculo.modalidade!;
    const isMenor = modalidade === 'PRE' || modalidade === 'EUC' || modalidade === 'PER' || modalidade === 'CRI';

    let responsavelIdFinal: string | undefined = undefined;

    // Para menores de idade, Nome e Telefone do Pai e da Mãe são obrigatórios
    if (isMenor) {
      if (!nomePai.trim() || !telefonePai.trim() || !nomeMae.trim() || !telefoneMae.trim()) {
        setErroMsg('Dados incompletos: Para crianças e adolescentes, é necessário preencher o Nome do Pai, Telefone do Pai (*), Nome da Mãe e Telefone da Mãe (*) para prosseguir.');
        return;
      }

      // Se informou o Responsável Legal (opcional)
      if (respNome.trim()) {
        try {
          const respSalvo = saveResponsavel({
            id: '',
            nome: respNome,
            cpf: respCpf,
            rg: respRg,
            telefone: respTelefone || telefonePai || telefoneMae,
            whatsapp: respWhatsapp || respTelefone || telefonePai || telefoneMae,
            email: respEmail || email,
            endereco: respEndereco || endereco,
            bairro,
            cidade,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          responsavelIdFinal = respSalvo.id;
        } catch (err: any) {
          setErroMsg(err.message || 'Erro ao cadastrar responsável.');
          return;
        }
      }
    }

    setCarregando(true);

    try {
      const statusInicial = documentos.length > 0 ? 'Em análise' : 'Documentos pendentes';

      const novoInscrito = salvarInscrito({
        nome,
        dataNascimento,
        idadeCalculada: resultadoCalculo.idadeCalculada,
        modalidade,
        ondeNasceu,
        endereco,
        bairro,
        cidade,
        telefone,
        email,
        batizado,
        localBatismo,
        dataBatismo,
        eucaristia,
        localEucaristia,
        dataEucaristia,
        crisma,
        estadoCivil: modalidade === 'ADU' ? estadoCivil : undefined,
        motivacao: modalidade === 'ADU' ? motivacao : undefined,
        responsavelId: responsavelIdFinal,
        nomePai,
        telefonePai,
        emailPai,
        nomeMae,
        telefoneMae,
        emailMae,
        paiSacramentos: { batismo: paiBatizado, eucaristia: paiEucaristia, crisma: paiCrisma },
        maeSacramentos: { batismo: maeBatizada, eucaristia: maeEucaristia, crisma: maeCrisma },
        paisMatrimonio,
        ondeMatrimonioPais,
        paisDivorciados,
        guardaDivorcio,
        familiaPastoral,
        qualPastoral,
        necessidadeEspecial,
        qualNecessidade,
        autorizaFotos,
        observacoes,
        preferenciasHorario,
        paroquiaId,
        comunidadeId,
        documentos,
        status: statusInicial,
        termoAceite: {
          aceito: true,
          dataHora: new Date().toLocaleString('pt-BR'),
          ip: '189.40.10.22',
          versaoTermo: '1.0 - IVC Teresina'
        }
      });

      setInscritoConcluido(novoInscrito);
      if (onSucessoInscricao) onSucessoInscricao(novoInscrito);
    } catch (err: any) {
      setErroMsg(err.message || 'Erro ao processar inscrição.');
    } finally {
      setCarregando(false);
    }
  };

  // Se já concluiu a inscrição com sucesso
  if (inscritoConcluido) {
    return (
      <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-xl border border-[#E5E1DA] text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8C7851] bg-[#F3F1ED] px-3 py-1 rounded-full border border-[#E5E1DA]">
            Inscrição Enviada com Sucesso
          </span>
          <h2 className="text-2xl font-extrabold text-[#2D2A26] mt-2">
            Protocolo Gerado: <span className="text-[#8C7851]">{inscritoConcluido.protocolo}</span>
          </h2>
          <p className="text-sm text-[#5D574F] mt-1">
            Guarde este número para consultar o status ou apresentar na Secretaria da Paróquia.
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-950 rounded-xl text-xs sm:text-sm font-medium text-left leading-relaxed shadow-sm">
          Sua inscrição para a Catequese da Igreja São José – Lar de Misericórdia foi enviada com sucesso! Agora, imprima a ficha de inscrição, assine-a e entregue-a à equipe da Catequese até o dia 30 de agosto de 2026. A inscrição somente será confirmada após a entrega da ficha assinada dentro do prazo.
        </div>

        <div className="bg-[#FAF9F7] p-4 rounded-xl text-left border border-[#E5E1DA] grid sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[#A69F95] font-medium">Nome do Catequizando:</span>
            <p className="font-bold text-[#2D2A26]">{inscritoConcluido.nome}</p>
          </div>
          <div>
            <span className="text-[#A69F95] font-medium">Modalidade Atribuída:</span>
            <p className="font-bold text-[#8C7851]">{MODALIDADE_NAMES[inscritoConcluido.modalidade]}</p>
          </div>
          <div>
            <span className="text-[#A69F95] font-medium">Data de Nascimento / Idade:</span>
            <p className="font-bold text-[#2D2A26]">{formatarDataBR(inscritoConcluido.dataNascimento)} ({inscritoConcluido.idadeCalculada} anos)</p>
          </div>
          <div>
            <span className="text-[#A69F95] font-medium">Status do Cadastro:</span>
            <span className="inline-block px-2 py-0.5 rounded font-semibold text-[11px] bg-[#F3F1ED] text-[#8C7851] border border-[#E5E1DA]">
              {inscritoConcluido.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => gerarComprovanteInscricaoPDF(inscritoConcluido)}
            className="px-5 py-2.5 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Baixar Ficha / Comprovante PDF
          </button>

          <button
            onClick={() => {
              setInscritoConcluido(null);
              setNome('');
              setDataNascimento('');
              setResultadoCalculo(determinarModalidade(''));
              setAceitoLGPD(false);
            }}
            className="px-5 py-2.5 bg-[#F3F1ED] hover:bg-[#E5E1DA] text-[#4A443F] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Realizar Nova Inscrição
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 bg-white rounded-2xl shadow-xl border border-[#E5E1DA] overflow-hidden">
      {/* Banner de Título */}
      <div className="bg-[#2D2A26] text-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4A443F] rounded-xl text-[#C4A976] border border-[#5D574F]">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C4A976]">
              Iniciação à Vida Cristã (IVC)
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Ficha Única de Inscrição da Catequese</h2>
            <p className="text-xs text-[#E5E1DA] mt-0.5">
              Igreja São José - Lar de Misericórdia &bull; Preencha os dados e o sistema identificará automaticamente a modalidade correta.
            </p>
          </div>
        </div>
      </div>

      {erroMsg && (
        <div className="m-6 p-4 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Atenção ao preencher:</strong>
            {erroMsg}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8 text-[#4A443F]">

        {/* PASSO 1: DATA DE NASCIMENTO & DADOS BÁSICOS */}
        <section className="space-y-4">
          <div className="border-b border-[#E5E1DA] pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#8C7851] text-white text-xs font-bold flex items-center justify-center">1</span>
            <h3 className="text-base font-bold text-[#2D2A26]">Identificação & Modalidade Automática</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">
                Data de Nascimento do Catequizando *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E5E1DA] rounded-xl focus:ring-2 focus:ring-[#8C7851]/30 focus:border-[#8C7851] focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-[#A69F95] mt-1">Data de referência para cálculo: {formatarDataBR(config.dataReferencia)}</p>
            </div>

            {/* Painel do Resultado Automático da Modalidade */}
            <div className={`p-3.5 rounded-xl border flex flex-col justify-center transition-all ${
              dataNascimento && !resultadoCalculo.elegivel
                ? 'bg-red-50 border-red-300 text-red-900'
                : 'bg-[#FAF9F7] border-[#E5E1DA]'
            }`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                dataNascimento && !resultadoCalculo.elegivel ? 'text-red-700' : 'text-[#A69F95]'
              }`}>
                Cálculo Automático de Modalidade:
              </span>
              {dataNascimento ? (
                resultadoCalculo.elegivel ? (
                  <div className="mt-1">
                    <span className="text-sm font-extrabold text-[#8C7851] block">
                      {MODALIDADE_NAMES[resultadoCalculo.modalidade!]}
                    </span>
                    <span className="text-[11px] text-[#5D574F]">
                      {resultadoCalculo.mensagem}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 text-red-800 font-bold text-xs flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p>{resultadoCalculo.mensagem}</p>
                      <p className="text-[11px] font-normal text-red-700 mt-1">
                        Crianças menores de 5 anos completos até 31/03/2028 não possuem idade suficiente para o ciclo de Pré-Catequese.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-xs text-[#A69F95] italic mt-1">Informe a data de nascimento para calcular a faixa etária e a modalidade.</p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">Nome Completo do Catequizando *</label>
              <input
                type="text"
                required
                placeholder="Ex: Gabriel Silva da Costa"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5E1DA] rounded-xl focus:ring-2 focus:ring-[#8C7851]/30 focus:border-[#8C7851] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">Naturalidade (Onde Nasceu) *</label>
              <input
                type="text"
                required
                placeholder="Ex: Teresina - PI"
                value={ondeNasceu}
                onChange={(e) => setOndeNasceu(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5E1DA] rounded-xl focus:ring-2 focus:ring-[#8C7851]/30 focus:border-[#8C7851] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">Endereço Residencial *</label>
              <input
                type="text"
                required
                placeholder="Rua / Avenida, Número, Complemento"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5E1DA] rounded-xl focus:ring-2 focus:ring-[#8C7851]/30 focus:border-[#8C7851] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">Bairro *</label>
              <input
                type="text"
                required
                placeholder="Ex: Centro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5E1DA] rounded-xl focus:ring-2 focus:ring-[#8C7851]/30 focus:border-[#8C7851] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">Telefone / WhatsApp para Contato *</label>
              <input
                type="tel"
                required
                placeholder="(86) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5E1DA] rounded-xl focus:ring-2 focus:ring-[#8C7851]/30 focus:border-[#8C7851] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2A26] mb-1">E-mail</label>
              <input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5E1DA] rounded-xl focus:ring-2 focus:ring-[#8C7851]/30 focus:border-[#8C7851] focus:outline-none"
              />
            </div>
          </div>

          {/* Unidade Catequética Única */}
          <div className="pt-2">
            <div className="p-3 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#8C7851] uppercase tracking-wider block">Unidade de Catequese</span>
                <span className="text-xs font-extrabold text-[#2D2A26]">Igreja São José - Lar de Misericórdia</span>
              </div>
              <span className="text-[11px] font-semibold text-[#8C7851] bg-[#F3F1ED] px-2.5 py-1 rounded-md border border-[#E5E1DA]">
                Teresina - PI
              </span>
            </div>
          </div>
        </section>

        {/* PASSO 2: SACRAMENTOS & INFORMAÇÕES RELIGIOSAS (Condicionais Inteligentes) */}
        <section className="space-y-4">
          <div className="border-b border-[#E5E1DA] pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#8C7851] text-white text-xs font-bold flex items-center justify-center">2</span>
            <h3 className="text-base font-bold text-[#2D2A26]">Vida Sacramental do Catequizando</h3>
          </div>

          {/* Batismo */}
          <div className="p-4 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[#2D2A26]">Já recebeu o Sacramento do Batismo?</label>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="batizado"
                    checked={batizado === true}
                    onChange={() => setBatizado(true)}
                    className="accent-[#8C7851]"
                  />
                  <span>Sim</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="batizado"
                    checked={batizado === false}
                    onChange={() => setBatizado(false)}
                    className="accent-[#8C7851]"
                  />
                  <span>Não</span>
                </label>
              </div>
            </div>

            {/* Campos condicionais de Batismo */}
            {batizado && (
              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5E1DA]">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A443F] mb-1">Onde foi realizado o Batismo? (Paróquia / Cidade)</label>
                  <input
                    type="text"
                    placeholder="Ex: Paróquia N. Sra. das Dores - Teresina"
                    value={localBatismo}
                    onChange={(e) => setLocalBatismo(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-lg focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A443F] mb-1">Data do Batismo (se souber)</label>
                  <input
                    type="date"
                    value={dataBatismo}
                    onChange={(e) => setDataBatismo(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-lg focus:outline-none bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Primeira Eucaristia e Crisma (Exibido para idades a partir de 8 anos) */}
          {(resultadoCalculo.idadeCalculada >= 8 || resultadoCalculo.modalidade === 'EUC' || resultadoCalculo.modalidade === 'PER' || resultadoCalculo.modalidade === 'CRI' || resultadoCalculo.modalidade === 'ADU') && (
            <div className="p-4 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl space-y-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">Já fez a Primeira Eucaristia?</label>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="eucaristia"
                        checked={eucaristia === true}
                        onChange={() => setEucaristia(true)}
                        className="accent-[#8C7851]"
                      />
                      <span>Sim</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="eucaristia"
                        checked={eucaristia === false}
                        onChange={() => setEucaristia(false)}
                        className="accent-[#8C7851]"
                      />
                      <span>Não</span>
                    </label>
                  </div>
                  {resultadoCalculo.idadeCalculada >= 8 && resultadoCalculo.idadeCalculada <= 14 && (
                    <p className="text-[10px] text-[#8C7851] font-semibold mt-1">
                      * Crianças de 8 a 14 anos que JÁ possuem a Eucaristia serão direcionadas para a <strong>Perseverança</strong>.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">Já recebeu a Crisma?</label>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="crisma"
                        checked={crisma === true}
                        onChange={() => setCrisma(true)}
                        className="accent-[#8C7851]"
                      />
                      <span>Sim</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="crisma"
                        checked={crisma === false}
                        onChange={() => setCrisma(false)}
                        className="accent-[#8C7851]"
                      />
                      <span>Não</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campos Específicos para Catecumenato Adulto */}
          {resultadoCalculo.modalidade === 'ADU' && (
            <div className="p-4 bg-[#F3F1ED] border border-[#E5E1DA] rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-[#8C7851] uppercase tracking-wider">Informações Específicas para Adultos</h4>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">Estado Civil</label>
                  <select
                    value={estadoCivil}
                    onChange={(e: any) => setEstadoCivil(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E5E1DA] rounded-xl bg-white cursor-pointer"
                  >
                    <option value="Solteiro(a)">Solteiro(a)</option>
                    <option value="Casado(a) no Civil">Casado(a) no Civil</option>
                    <option value="Celebrou Matrimônio Religioso">Celebrou Matrimônio Religioso</option>
                    <option value="Viúvo(a)">Viúvo(a)</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">O que o motivou a fazer a inscrição na Catequese?</label>
                  <textarea
                    rows={2}
                    placeholder="Compartilhe brevemente sua motivação religiosa ou busca pelos sacramentos..."
                    value={motivacao}
                    onChange={(e) => setMotivacao(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E5E1DA] rounded-xl focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Necessidades Especiais & Pastoral */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl">
              <label className="text-xs font-bold text-[#2D2A26] block mb-1">Possui alguma necessidade especial?</label>
              <div className="flex items-center gap-4 text-xs mb-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" checked={necessidadeEspecial} onChange={() => setNecessidadeEspecial(true)} className="accent-[#8C7851]" />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" checked={!necessidadeEspecial} onChange={() => setNecessidadeEspecial(false)} className="accent-[#8C7851]" />
                  <span>Não</span>
                </label>
              </div>
              {necessidadeEspecial && (
                <input
                  type="text"
                  placeholder="Especifique a necessidade especial..."
                  value={qualNecessidade}
                  onChange={(e) => setQualNecessidade(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-[#E5E1DA] rounded-lg bg-white"
                />
              )}
            </div>

            <div className="p-3 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl">
              <label className="text-xs font-bold text-[#2D2A26] block mb-1">Participa ou a família participa de alguma Pastoral?</label>
              <div className="flex items-center gap-4 text-xs mb-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" checked={familiaPastoral} onChange={() => setFamiliaPastoral(true)} className="accent-[#8C7851]" />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" checked={!familiaPastoral} onChange={() => setFamiliaPastoral(false)} className="accent-[#8C7851]" />
                  <span>Não</span>
                </label>
              </div>
              {familiaPastoral && (
                <input
                  type="text"
                  placeholder="Qual pastoral ou grupo paroquial?"
                  value={qualPastoral}
                  onChange={(e) => setQualPastoral(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-[#E5E1DA] rounded-lg bg-white"
                />
              )}
            </div>
          </div>
        </section>

        {/* PASSO 3: DADOS DOS PAIS E RESPONSÁVEL LEGAL */}
        {(resultadoCalculo.modalidade === 'PRE' || resultadoCalculo.modalidade === 'EUC' || resultadoCalculo.modalidade === 'PER' || resultadoCalculo.modalidade === 'CRI' || !resultadoCalculo.modalidade) && (
          <section className="space-y-4">
            <div className="border-b border-[#E5E1DA] pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#8C7851] text-white text-xs font-bold flex items-center justify-center">3</span>
              <h3 className="text-base font-bold text-[#2D2A26]">Filiação (Pai e Mãe) & Responsável Legal</h3>
            </div>

            {/* INFORMACÕES DOS PAIS (OBRIGATÓRIAS) */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* DADOS DO PAI */}
              <div className="p-4 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] space-y-3">
                <span className="text-xs font-bold text-[#2D2A26] block border-b border-[#E5E1DA] pb-1">
                  Dados do Pai (Obrigatorio) *
                </span>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">Nome Completo do Pai *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo do Pai"
                    value={nomePai}
                    onChange={(e) => setNomePai(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-xl bg-white"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#2D2A26] mb-1">Telefone do Pai *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(86) 99999-9999"
                      value={telefonePai}
                      onChange={(e) => setTelefonePai(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2D2A26] mb-1">E-mail do Pai</label>
                    <input
                      type="email"
                      placeholder="pai@email.com"
                      value={emailPai}
                      onChange={(e) => setEmailPai(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="pt-1 text-[11px] space-y-1">
                  <span className="font-semibold text-[#5D574F] block">O Pai já recebeu os Sacramentos de Iniciação Cristã?</span>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={paiBatizado} onChange={(e) => setPaiBatizado(e.target.checked)} className="accent-[#8C7851]" /> Batismo</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={paiEucaristia} onChange={(e) => setPaiEucaristia(e.target.checked)} className="accent-[#8C7851]" /> Eucaristia</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={paiCrisma} onChange={(e) => setPaiCrisma(e.target.checked)} className="accent-[#8C7851]" /> Crisma</label>
                  </div>
                </div>
              </div>

              {/* DADOS DA MÃE */}
              <div className="p-4 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] space-y-3">
                <span className="text-xs font-bold text-[#2D2A26] block border-b border-[#E5E1DA] pb-1">
                  Dados da Mãe (Obrigatório) *
                </span>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">Nome Completo da Mãe *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo da Mãe"
                    value={nomeMae}
                    onChange={(e) => setNomeMae(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-xl bg-white"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#2D2A26] mb-1">Telefone da Mãe *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(86) 99999-9999"
                      value={telefoneMae}
                      onChange={(e) => setTelefoneMae(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2D2A26] mb-1">E-mail da Mãe</label>
                    <input
                      type="email"
                      placeholder="mae@email.com"
                      value={emailMae}
                      onChange={(e) => setEmailMae(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="pt-1 text-[11px] space-y-1">
                  <span className="font-semibold text-[#5D574F] block">A Mãe já recebeu os Sacramentos de Iniciação Cristã?</span>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={maeBatizada} onChange={(e) => setMaeBatizada(e.target.checked)} className="accent-[#8C7851]" /> Batismo</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={maeEucaristia} onChange={(e) => setMaeEucaristia(e.target.checked)} className="accent-[#8C7851]" /> Eucaristia</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={maeCrisma} onChange={(e) => setMaeCrisma(e.target.checked)} className="accent-[#8C7851]" /> Crisma</label>
                  </div>
                </div>
              </div>
            </div>

            {/* SITUAÇÃO MATRIMONIAL E FAMILIAR */}
            <div className="p-4 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] space-y-3 text-xs">
              <span className="font-bold text-[#2D2A26] block border-b border-[#E5E1DA] pb-1">Situação Matrimonial dos Pais</span>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">Os pais realizaram o Sacramento do Matrimônio?</label>
                  <div className="flex items-center gap-4 text-xs mb-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="paisMatrimonio" checked={paisMatrimonio} onChange={() => setPaisMatrimonio(true)} className="accent-[#8C7851]" />
                      <span>Sim</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="paisMatrimonio" checked={!paisMatrimonio} onChange={() => setPaisMatrimonio(false)} className="accent-[#8C7851]" />
                      <span>Não</span>
                    </label>
                  </div>
                  {paisMatrimonio && (
                    <input
                      type="text"
                      placeholder="Onde realizaram o Matrimônio? (Paróquia / Cidade)"
                      value={ondeMatrimonioPais}
                      onChange={(e) => setOndeMatrimonioPais(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-lg bg-white"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">Os pais são divorciados?</label>
                  <div className="flex items-center gap-4 text-xs mb-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="paisDivorciados" checked={paisDivorciados} onChange={() => setPaisDivorciados(true)} className="accent-[#8C7851]" />
                      <span>Sim</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="paisDivorciados" checked={!paisDivorciados} onChange={() => setPaisDivorciados(false)} className="accent-[#8C7851]" />
                      <span>Não</span>
                    </label>
                  </div>
                  {paisDivorciados && (
                    <input
                      type="text"
                      placeholder="De quem é a guarda do catequizando?"
                      value={guardaDivorcio}
                      onChange={(e) => setGuardaDivorcio(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-lg bg-white"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* DADOS DO RESPONSÁVEL LEGAL (OPCIONAL) */}
            <div className="p-4 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] space-y-3">
              <div className="border-b border-[#E5E1DA] pb-1.5">
                <span className="text-xs font-bold text-[#2D2A26]">
                  Responsável Legal (Opcional)
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">Nome do Responsável Legal (se houver)</label>
                  <input
                    type="text"
                    placeholder="Nome Completo do Responsável Legal"
                    value={respNome}
                    onChange={(e) => setRespNome(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">CPF do Responsável (Opcional)</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={respCpf}
                    onChange={(e) => setRespCpf(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">Telefone Principal / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="(86) 99999-9999"
                    value={respTelefone}
                    onChange={(e) => setRespTelefone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2A26] mb-1">E-mail do Responsável</label>
                  <input
                    type="email"
                    placeholder="email@responsavel.com"
                    value={respEmail}
                    onChange={(e) => setRespEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#E5E1DA] rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>

            {/* AUTORIZAÇÃO DE FOTOS E IMAGENS */}
            <div className="p-3.5 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] space-y-1.5 text-xs">
              <label className="font-bold text-[#2D2A26] block">
                Autorização de Publicação de Imagens e Fotos:
              </label>
              <p className="text-[11px] text-[#5D574F]">
                Autoriza a publicação de fotos/imagens de atividades da catequese nas redes sociais e mídias da Paróquia/Arquidiocese?
              </p>
              <div className="flex items-center gap-4 text-xs pt-1">
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-[#2D2A26]">
                  <input type="radio" name="autorizaFotos" checked={autorizaFotos} onChange={() => setAutorizaFotos(true)} className="accent-[#8C7851]" />
                  <span>Sim, autorizo</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-[#2D2A26]">
                  <input type="radio" name="autorizaFotos" checked={!autorizaFotos} onChange={() => setAutorizaFotos(false)} className="accent-[#8C7851]" />
                  <span>Não autorizo</span>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* PASSO 4: PREFERÊNCIA DE HORÁRIOS / CONSULTA DE DISPONIBILIDADE */}
        <section className="space-y-4">
          <div className="border-b border-[#E5E1DA] pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#8C7851] text-white text-xs font-bold flex items-center justify-center">4</span>
              <h3 className="text-base font-bold text-[#2D2A26]">Preferência de Horários para as Turmas</h3>
            </div>
            <span className="text-[11px] font-medium text-[#8C7851]">Selecione uma ou mais opções</span>
          </div>

          {/* Banner de Aviso de Consulta Prévia */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-900">Aviso Importante — Consulta Prévia de Disponibilidade:</p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Trata-se de uma <strong>consulta prévia de disponibilidade</strong>. As turmas só serão formadas após o encerramento do prazo de inscrições, respeitando o <strong>número máximo de 25 pessoas por turma</strong> e a <strong>ordem de inscrição</strong>. Você pode marcar mais de uma disponibilidade de horário.
              </p>
            </div>
          </div>

          {/* Opções de Horários por Modalidade */}
          {(() => {
            const isAdulto = resultadoCalculo.modalidade === 'ADU';
            const opcoes = isAdulto
              ? [
                  'Domingo (8h30)',
                  'Segunda-feira (19h00)',
                  'Terça-feira (19h00)',
                  'Quarta-feira (19h00)',
                  'Quinta-feira (19h00)',
                  'Sexta-feira (19h00)',
                  'Sábado (15h30)'
                ]
              : [
                  'Sábado (15h30)',
                  'Domingo (8h30)'
                ];

            return (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {opcoes.map(horario => {
                  const selected = preferenciasHorario.includes(horario);
                  return (
                    <label
                      key={horario}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        selected
                          ? 'bg-[#F3F1ED] border-[#8C7851] text-[#2D2A26] font-bold shadow-sm'
                          : 'bg-white border-[#E5E1DA] text-[#5D574F] hover:bg-[#FAF9F7]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {
                          if (selected) {
                            setPreferenciasHorario(prev => prev.filter(h => h !== horario));
                          } else {
                            setPreferenciasHorario(prev => [...prev, horario]);
                          }
                        }}
                        className="w-4 h-4 rounded accent-[#8C7851]"
                      />
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="w-3.5 h-3.5 text-[#8C7851]" />
                        <span>{horario}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            );
          })()}
        </section>

        {/* PASSO 5: UPLOAD DE DOCUMENTOS (Opcional/Pendentes) */}
        <section className="space-y-4">
          <div className="border-b border-[#E5E1DA] pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#8C7851] text-white text-xs font-bold flex items-center justify-center">5</span>
              <h3 className="text-base font-bold text-[#2D2A26]">Documentos Anexos (PDF ou Imagem)</h3>
            </div>
            <span className="text-[11px] font-medium text-[#A69F95]">Podem ser enviados agora ou entregues na Secretaria</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Certidão de Nascimento',
              'Certificado de Batismo',
              'Comprovante de Residência',
              'RG / CPF'
            ].map((tipoDoc: any) => {
              const docAnexado = documentos.find(d => d.tipo === tipoDoc);
              return (
                <div key={tipoDoc} className="p-3 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#2D2A26] block">{tipoDoc}</span>
                    {docAnexado ? (
                      <span className="text-[10px] text-emerald-700 font-medium">✓ Anexado: {docAnexado.nomeArquivo}</span>
                    ) : (
                      <span className="text-[10px] text-[#A69F95]">Pendente</span>
                    )}
                  </div>

                  <label className="px-3 py-1.5 bg-[#F3F1ED] hover:bg-[#E5E1DA] text-[#8C7851] rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Anexar</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => handleSimularUploadDoc(e, tipoDoc)}
                      className="hidden"
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        {/* TERMO DE CONSENTIMENTO LGPD */}
        <section className="p-4 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] space-y-3 text-xs">
          <div className="flex items-center gap-2 text-[#8C7851] font-bold">
            <ShieldCheck className="w-5 h-5 text-[#C4A976]" />
            <span>Termo de Consentimento - Proteção de Dados (LGPD)</span>
          </div>

          <p className="text-[#5D574F] text-[11px] leading-relaxed max-h-24 overflow-y-auto pr-1">
            {config.termoLGPDTexto}
          </p>

          <label className="flex items-start gap-2.5 font-bold text-[#2D2A26] cursor-pointer pt-1">
            <input
              type="checkbox"
              required
              checked={aceitoLGPD}
              onChange={(e) => setAceitoLGPD(e.target.checked)}
              className="mt-0.5 rounded accent-[#8C7851]"
            />
            <span>Declaro que li e concordo expressamente com os termos de consentimento e política de privacidade.</span>
          </label>
        </section>

        {/* BOTÃO SUBMETER */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={carregando || (dataNascimento !== '' && !resultadoCalculo.elegivel)}
            className="w-full py-3.5 bg-[#8C7851] hover:bg-[#7A6946] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#8C7851]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {carregando ? (
              <span>Processando Inscrição...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#C4A976]" />
                <span>Enviar Inscrição Online e Gerar Protocolo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
