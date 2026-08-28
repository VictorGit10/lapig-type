import type { Language } from './i18n';

export const PIXEL_GRID_SIZE = 16;
export const TRANSPARENT_PIXEL = -1;

export type AvatarLoadout = { pixels: number[]; effect: string };
export type EffectItem = {
  key: string;
  achievement: string | null;
  name: Record<Language, string>;
  description: Record<Language, string>;
};

export const PIXEL_PALETTE = [
  { key: 'ink', color: '#132a22' }, { key: 'black', color: '#07120e' },
  { key: 'forest-dark', color: '#17483a' }, { key: 'forest', color: '#176b45' },
  { key: 'leaf', color: '#3f8b5b' }, { key: 'moss', color: '#8aa45c' },
  { key: 'lime', color: '#c9e65c' }, { key: 'paper', color: '#fbfaf4' },
  { key: 'white', color: '#ffffff' }, { key: 'silver', color: '#c8cdc8' },
  { key: 'slate', color: '#63716c' }, { key: 'brown', color: '#6f4934' },
  { key: 'tan', color: '#b8865b' }, { key: 'sand', color: '#e2bd83' },
  { key: 'cream', color: '#f7d8b5' }, { key: 'peach', color: '#f3b390' },
  { key: 'clay', color: '#b95835' }, { key: 'rust', color: '#d66a3c' },
  { key: 'orange', color: '#f08a3c' }, { key: 'sun', color: '#f4bd48' },
  { key: 'yellow', color: '#ffe36b' }, { key: 'red', color: '#c74343' },
  { key: 'coral', color: '#ee6b5f' }, { key: 'pink', color: '#e78aaa' },
  { key: 'magenta', color: '#c34d83' }, { key: 'purple', color: '#7553a6' },
  { key: 'violet', color: '#9b73d1' }, { key: 'navy', color: '#234a66' },
  { key: 'blue', color: '#3d76b9' }, { key: 'sky', color: '#70b7d4' },
  { key: 'cyan', color: '#55c6c3' }, { key: 'teal', color: '#288b7b' },
] as const;

export const EMPTY_PIXELS = () => Array<number>(PIXEL_GRID_SIZE * PIXEL_GRID_SIZE).fill(TRANSPARENT_PIXEL);
export const DEFAULT_AVATAR: AvatarLoadout = { pixels: EMPTY_PIXELS(), effect: 'none' };

export const EFFECTS: EffectItem[] = [
  { key: 'none', achievement: null, name: { pt: 'Sem efeito', en: 'No effect', es: 'Sin efecto' }, description: { pt: 'Somente a sua pixel art.', en: 'Only your pixel art.', es: 'Solo tu pixel art.' } },
  { key: 'orbit', achievement: 'first_verified', name: { pt: 'Órbita', en: 'Orbit', es: 'Órbita' }, description: { pt: 'Um traço percorre o avatar.', en: 'A line travels around the avatar.', es: 'Una línea recorre el avatar.' } },
  { key: 'signal', achievement: 'speed_50', name: { pt: 'Sinal de campo', en: 'Field signal', es: 'Señal de campo' }, description: { pt: 'Um farol pulsa no seu ritmo.', en: 'A beacon pulses at your pace.', es: 'Un faro pulsa a tu ritmo.' } },
  { key: 'scan', achievement: 'speed_75', name: { pt: 'Varredura', en: 'Scan', es: 'Barrido' }, description: { pt: 'Uma faixa de leitura varre o avatar.', en: 'A reading band sweeps across the avatar.', es: 'Una banda de lectura barre el avatar.' } },
  { key: 'resolution', achievement: 'speed_100', name: { pt: 'Alta resolução', en: 'High resolution', es: 'Alta resolución' }, description: { pt: 'Um anel graduado avança em passos.', en: 'A graduated ring advances in steps.', es: 'Un anillo graduado avanza en pasos.' } },
  { key: 'precision', achievement: 'precision_100', name: { pt: 'Ponto de controle', en: 'Control point', es: 'Punto de control' }, description: { pt: 'Quatro marcas sobre um anel de registro.', en: 'Four marks over a registration ring.', es: 'Cuatro marcas sobre un anillo de registro.' } },
  { key: 'reference', achievement: 'top_3', name: { pt: 'Referência', en: 'Reference', es: 'Referencia' }, description: { pt: 'Um halo duplo reservado ao pódio.', en: 'A double halo reserved for the podium.', es: 'Un halo doble reservado al podio.' } },
  { key: 'solar-pulse', achievement: 'top_1', name: { pt: 'Pulso solar', en: 'Solar pulse', es: 'Pulso solar' }, description: { pt: 'Uma coroa de partículas em órbita.', en: 'A crown of orbiting particles.', es: 'Una corona de partículas en órbita.' } },
  { key: 'catalog', achievement: 'all_passages_attempted', name: { pt: 'Catálogo', en: 'Catalog', es: 'Catálogo' }, description: { pt: 'Um índice graduado gira sobre o acervo.', en: 'A graduated index turns over the collection.', es: 'Un índice graduado gira sobre el acervo.' } },
  { key: 'atlas', achievement: 'all_passages_completed', name: { pt: 'Atlas completo', en: 'Complete atlas', es: 'Atlas completo' }, description: { pt: 'Graticulado, pontos cardeais e halo vivo.', en: 'Graticule, cardinal marks and a living halo.', es: 'Graticulado, puntos cardinales y halo vivo.' } },
];

export const ACHIEVEMENTS = [
  { key: 'first_verified', icon: '01', title: { pt: 'Primeiro registro', en: 'First record', es: 'Primer registro' }, criteria: { pt: 'Conclua uma tentativa verificada.', en: 'Finish one verified attempt.', es: 'Termina un intento verificado.' } },
  { key: 'speed_50', icon: '40', title: { pt: 'Linha de base', en: 'Baseline', es: 'Línea base' }, criteria: { pt: 'Alcance 40 PPM.', en: 'Reach 40 WPM.', es: 'Alcanza 40 PPM.' } },
  { key: 'speed_75', icon: '60', title: { pt: 'Ritmo vetorial', en: 'Vector rhythm', es: 'Ritmo vectorial' }, criteria: { pt: 'Alcance 60 PPM.', en: 'Reach 60 WPM.', es: 'Alcanza 60 PPM.' } },
  { key: 'speed_100', icon: '90', title: { pt: 'Alta resolução', en: 'High resolution', es: 'Alta resolución' }, criteria: { pt: 'Alcance 90 PPM.', en: 'Reach 90 WPM.', es: 'Alcanza 90 PPM.' } },
  { key: 'precision_100', icon: '100%', title: { pt: 'Ponto de controle', en: 'Control point', es: 'Punto de control' }, criteria: { pt: 'Obtenha 100% de precisão com ao menos 20 PPM.', en: 'Get 100% accuracy at 20 WPM or more.', es: 'Obtén 100% de precisión con al menos 20 PPM.' } },
  { key: 'top_3', icon: '03', title: { pt: 'Referência de campo', en: 'Field reference', es: 'Referencia de campo' }, criteria: { pt: 'Alcance o Top 3.', en: 'Reach the Top 3.', es: 'Alcanza el Top 3.' } },
  { key: 'top_1', icon: '01', title: { pt: 'Marco zero', en: 'Zero mark', es: 'Marco cero' }, criteria: { pt: 'Alcance o primeiro lugar.', en: 'Reach first place.', es: 'Alcanza el primer lugar.' } },
  { key: 'all_passages_attempted', icon: 'A', title: { pt: 'Explorador do acervo', en: 'Collection explorer', es: 'Explorador del acervo' }, criteria: { pt: 'Registre uma tentativa em cada texto.', en: 'Record an attempt on every text.', es: 'Registra un intento en cada texto.' } },
  { key: 'all_passages_completed', icon: '✓', title: { pt: 'Atlas completo', en: 'Complete atlas', es: 'Atlas completo' }, criteria: { pt: 'Digite integralmente todos os textos.', en: 'Type every text in full.', es: 'Escribe todos los textos por completo.' } },
] as const;

export const REWARD_UI = {
  pt: { button: 'Criar avatar', eyebrow: 'ATELIÊ PIXEL', title: 'Desenhe seu avatar', description: 'Crie livremente em uma grade de 16 × 16. Pixels vazios são transparentes; apenas os efeitos dependem de conquistas.', editor: 'Desenho', effects: 'Efeitos conquistáveis', save: 'Salvar avatar', saving: 'Salvando…', saved: 'Avatar salvo', undoChanges: 'Desfazer alterações', signIn: 'Entre para salvar o desenho e desbloquear efeitos.', close: 'Fechar editor', unlockWith: 'Conquista necessária:', unlockedWith: 'Conquista que desbloqueou:', preview: 'PRÉVIA', rankingSize: 'TAMANHO NO RANKING', achievements: 'Conquistas', progress: 'Progresso', unlocked: 'Desbloqueado' },
  en: { button: 'Create avatar', eyebrow: 'PIXEL STUDIO', title: 'Draw your avatar', description: 'Create freely on a 16 × 16 grid. Empty pixels are transparent; only effects require achievements.', editor: 'Drawing', effects: 'Unlockable effects', save: 'Save avatar', saving: 'Saving…', saved: 'Avatar saved', undoChanges: 'Undo changes', signIn: 'Sign in to save your drawing and unlock effects.', close: 'Close editor', unlockWith: 'Required achievement:', unlockedWith: 'Achievement that unlocked it:', preview: 'PREVIEW', rankingSize: 'RANKING SIZE', achievements: 'Achievements', progress: 'Progress', unlocked: 'Unlocked' },
  es: { button: 'Crear avatar', eyebrow: 'TALLER PÍXEL', title: 'Dibuja tu avatar', description: 'Crea libremente en una cuadrícula de 16 × 16. Los píxeles vacíos son transparentes; solo los efectos requieren logros.', editor: 'Dibujo', effects: 'Efectos desbloqueables', save: 'Guardar avatar', saving: 'Guardando…', saved: 'Avatar guardado', undoChanges: 'Deshacer cambios', signIn: 'Entra para guardar tu dibujo y desbloquear efectos.', close: 'Cerrar editor', unlockWith: 'Logro necesario:', unlockedWith: 'Logro que lo desbloqueó:', preview: 'VISTA PREVIA', rankingSize: 'TAMAÑO EN EL RANKING', achievements: 'Logros', progress: 'Progreso', unlocked: 'Desbloqueado' },
} as const;

export function isAvatarCell(index: number) {
  const row = Math.floor(index / PIXEL_GRID_SIZE);
  const column = index % PIXEL_GRID_SIZE;
  return ((row - 7.5) ** 2) + ((column - 7.5) ** 2) <= 64;
}

export function isEffectUnlocked(item: EffectItem, achievements: Set<string>) {
  return item.achievement === null || achievements.has(item.achievement);
}
