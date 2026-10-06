import { Turma } from '../types';

/**
 * Remove acentos e converte para minúsculas para comparações robustas
 */
function normalizarTexto(str: string = ''): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Retorna o índice de rank da turma para ordenação pedagógica e cronológica:
 * 
 * 1. 2 a 3 anos — domingo
 * 2. 4 a 6 anos — domingo
 * 3. 4 a 6 anos — sábado
 * 4. Eucaristia A — domingo
 * 5. Eucaristia B — domingo
 * 6. Eucaristia C — domingo
 * 7. Eucaristia D — sábado
 * 8. Eucaristia E — sábado
 * 9. Eucaristia F — sábado
 * 10. Eucaristia G — sábado
 * 11. Perseverança — domingo
 * 12. Crisma Jovem — domingo
 * 13. Crisma Jovem — sábado
 * 14. Adultos A — domingo
 * 15. Adultos B — domingo
 * 16. Adultos — terça
 * 17. Adultos — quarta
 * 18. Adultos — quinta
 * 19. Adultos — sábado
 * 20. Adultos — especial
 */
export function getTurmaOrdemRank(turma: Turma): number {
  const nomeNorm = normalizarTexto(turma.nome || '');
  const diaNorm = normalizarTexto(turma.diaSemana || '');
  const textoCompleto = `${nomeNorm} ${diaNorm}`;
  const mod = turma.modalidade;

  const isDomingo = textoCompleto.includes('domingo');
  const isSabado = textoCompleto.includes('sabado');
  const isTerca = textoCompleto.includes('terca');
  const isQuarta = textoCompleto.includes('quarta');
  const isQuinta = textoCompleto.includes('quinta');
  const isSegunda = textoCompleto.includes('segunda');
  const isSexta = textoCompleto.includes('sexta');
  const isEspecial = textoCompleto.includes('especial');

  // 1. 2 a 3 anos — domingo
  const is2a3 =
    textoCompleto.includes('2 a 3') ||
    textoCompleto.includes('2-3') ||
    textoCompleto.includes('2 aos 3') ||
    textoCompleto.includes('2 e 3') ||
    textoCompleto.includes('2 a 4');

  if (is2a3) {
    if (isDomingo) return 1;
    if (isSabado) return 1.5;
    return 1.8;
  }

  // 2. 4 a 6 anos — domingo
  // 3. 4 a 6 anos — sábado
  const is4a6 =
    textoCompleto.includes('4 a 6') ||
    textoCompleto.includes('4-6') ||
    textoCompleto.includes('4 aos 6') ||
    textoCompleto.includes('4 e 6') ||
    textoCompleto.includes('3 a 6') ||
    textoCompleto.includes('4 a 7');

  if (is4a6) {
    if (isDomingo) return 2;
    if (isSabado) return 3;
    return 3.2;
  }

  // Pré-Catequese genérica (caso não tenha faixa no nome)
  if (mod === 'PRE' || textoCompleto.includes('pre-catequese') || textoCompleto.includes('pre catequese') || textoCompleto.includes('pre')) {
    if (isDomingo) return 2.5;
    if (isSabado) return 3.5;
    return 3.8;
  }

  // 4 a 10: Eucaristia (A a G)
  const isEuc = mod === 'EUC' || textoCompleto.includes('eucarist');
  if (isEuc) {
    // Detecta letra da turma (A, B, C, D, E, F, G)
    // Procura por "eucaristia A", "turma A", " - A", " A "
    let letra: string | null = null;
    const matchComPalavra = nomeNorm.match(/(?:eucaristia|turma)\s+([a-g])\b/);
    if (matchComPalavra) {
      letra = matchComPalavra[1];
    } else {
      const matchSeparador = nomeNorm.match(/[-–—]\s*([a-g])\b/);
      if (matchSeparador) {
        letra = matchSeparador[1];
      } else {
        const matchIsolado = nomeNorm.match(/\b([a-g])\b/);
        if (matchIsolado) {
          letra = matchIsolado[1];
        }
      }
    }

    if (letra === 'a' && isDomingo) return 4;
    if (letra === 'b' && isDomingo) return 5;
    if (letra === 'c' && isDomingo) return 6;
    if (letra === 'd' && isSabado) return 7;
    if (letra === 'e' && isSabado) return 8;
    if (letra === 'f' && isSabado) return 9;
    if (letra === 'g' && isSabado) return 10;

    // Se tiver letra mas o dia for omitido no texto do nome:
    if (letra === 'a') return 4;
    if (letra === 'b') return 5;
    if (letra === 'c') return 6;
    if (letra === 'd') return 7;
    if (letra === 'e') return 8;
    if (letra === 'f') return 9;
    if (letra === 'g') return 10;

    // Eucaristia sem letra específica
    if (isDomingo) return 6.5;
    if (isSabado) return 10.5;
    return 10.8;
  }

  // 11. Perseverança — domingo
  if (mod === 'PER' || textoCompleto.includes('perseveran')) {
    if (isDomingo) return 11;
    if (isSabado) return 11.4;
    return 11.8;
  }

  // 12. Crisma Jovem — domingo
  // 13. Crisma Jovem — sábado
  if (mod === 'CRI' || textoCompleto.includes('crisma')) {
    if (isDomingo) return 12;
    if (isSabado) return 13;
    return 13.5;
  }

  // 14 a 20: Adultos
  if (mod === 'ADU' || textoCompleto.includes('adult') || textoCompleto.includes('catecumenato')) {
    if (isEspecial) return 20;

    // Detecta Adultos A ou Adultos B
    let letraAdulto: string | null = null;
    const matchAdultoLetra = nomeNorm.match(/(?:adultos?|catecumenato|turma)\s+([a-b])\b/) || nomeNorm.match(/\b([a-b])\b/);
    if (matchAdultoLetra) {
      letraAdulto = matchAdultoLetra[1];
    }

    // 14. Adultos A — domingo
    // 15. Adultos B — domingo
    if (letraAdulto === 'a' && isDomingo) return 14;
    if (letraAdulto === 'b' && isDomingo) return 15;
    if (letraAdulto === 'a') return 14;
    if (letraAdulto === 'b') return 15;

    // Se for domingo sem letra especificada
    if (isDomingo) return 15.5;

    // 16. Adultos — terça
    if (isTerca) return 16;
    // 17. Adultos — quarta
    if (isQuarta) return 17;
    // 18. Adultos — quinta
    if (isQuinta) return 18;
    // 19. Adultos — sábado
    if (isSabado) return 19;

    // Outros dias de adultos caso existam no banco
    if (isSegunda) return 20.1;
    if (isSexta) return 20.2;
    return 20.5;
  }

  // Fallback geral
  return 100;
}

/**
 * Função de comparação para ordenar turmas de acordo com a sequência pedagógica e cronológica paroquial
 */
export function compararTurmasPedagogica(a: Turma, b: Turma): number {
  const rankA = getTurmaOrdemRank(a);
  const rankB = getTurmaOrdemRank(b);

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  // Desempate estável por nome alfabético em português
  return (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' });
}

/**
 * Retorna uma nova lista de turmas ordenada pela sequência pedagógica e cronológica
 */
export function ordenarTurmasPedagogica(turmas: Turma[]): Turma[] {
  return [...turmas].sort(compararTurmasPedagogica);
}
