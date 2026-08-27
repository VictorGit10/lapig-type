import type { Language } from './i18n';

export type CosmeticSlot = 'avatar' | 'frame' | 'effect';
export type EquippedCosmetics = { avatar: string; frame: string; effect: string };

export type CosmeticItem = {
  key: string;
  slot: CosmeticSlot;
  achievement: string | null;
  name: Record<Language, string>;
  description: Record<Language, string>;
};

export const DEFAULT_COSMETICS: EquippedCosmetics = {
  avatar: 'topographic',
  frame: 'none',
  effect: 'none',
};

export const COSMETICS: CosmeticItem[] = [
  { key: 'topographic', slot: 'avatar', achievement: null, name: { pt: 'Carta-base', en: 'Base map', es: 'Mapa base' }, description: { pt: 'Seu selo cartográfico original.', en: 'Your original cartographic seal.', es: 'Tu sello cartográfico original.' } },
  { key: 'cerrado', slot: 'avatar', achievement: 'all_passages_attempted', name: { pt: 'Cerrado', en: 'Cerrado', es: 'Cerrado' }, description: { pt: 'Vegetação e horizontes do bioma central.', en: 'Vegetation and horizons of the central biome.', es: 'Vegetación y horizontes del bioma central.' } },
  { key: 'atlas', slot: 'avatar', achievement: 'all_passages_completed', name: { pt: 'Atlas completo', en: 'Complete atlas', es: 'Atlas completo' }, description: { pt: 'O acervo inteiro convertido em território.', en: 'The entire collection turned into territory.', es: 'Todo el acervo convertido en territorio.' } },

  { key: 'none', slot: 'frame', achievement: null, name: { pt: 'Sem moldura', en: 'No frame', es: 'Sin marco' }, description: { pt: 'A forma mais essencial do selo.', en: 'The seal in its most essential form.', es: 'La forma más esencial del sello.' } },
  { key: 'baseline', slot: 'frame', achievement: 'speed_50', name: { pt: 'Linha de base', en: 'Baseline', es: 'Línea base' }, description: { pt: 'Marcas de levantamento em verde-lima.', en: 'Survey marks in lime green.', es: 'Marcas de levantamiento en verde lima.' } },
  { key: 'vector', slot: 'frame', achievement: 'speed_75', name: { pt: 'Vetor', en: 'Vector', es: 'Vector' }, description: { pt: 'Duas direções, um ritmo preciso.', en: 'Two directions, one precise rhythm.', es: 'Dos direcciones, un ritmo preciso.' } },
  { key: 'high-resolution', slot: 'frame', achievement: 'speed_100', name: { pt: 'Alta resolução', en: 'High resolution', es: 'Alta resolución' }, description: { pt: 'Leitura fina para velocidades excepcionais.', en: 'Fine detail for exceptional speeds.', es: 'Detalle fino para velocidades excepcionales.' } },
  { key: 'control-point', slot: 'frame', achievement: 'precision_100', name: { pt: 'Ponto de controle', en: 'Control point', es: 'Punto de control' }, description: { pt: 'Precisão absoluta, marcada no território.', en: 'Absolute precision, marked on the territory.', es: 'Precisión absoluta marcada en el territorio.' } },
  { key: 'reference', slot: 'frame', achievement: 'top_3', name: { pt: 'Referência de campo', en: 'Field reference', es: 'Referencia de campo' }, description: { pt: 'Reservada a quem alcançou o pódio.', en: 'Reserved for those who reached the podium.', es: 'Reservada para quienes llegaron al podio.' } },
  { key: 'zero-mark', slot: 'frame', achievement: 'top_1', name: { pt: 'Marco zero', en: 'Zero mark', es: 'Marco cero' }, description: { pt: 'O ponto de origem de um líder do ranking.', en: 'The origin point of a ranking leader.', es: 'El punto de origen de un líder del ranking.' } },

  { key: 'none', slot: 'effect', achievement: null, name: { pt: 'Sem efeito', en: 'No effect', es: 'Sin efecto' }, description: { pt: 'Identidade estática e silenciosa.', en: 'A quiet, static identity.', es: 'Una identidad estática y silenciosa.' } },
  { key: 'contours', slot: 'effect', achievement: 'first_verified', name: { pt: 'Curvas vivas', en: 'Living contours', es: 'Curvas vivas' }, description: { pt: 'O relevo responde discretamente à presença.', en: 'The relief responds subtly to your presence.', es: 'El relieve responde sutilmente a tu presencia.' } },
  { key: 'scan', slot: 'effect', achievement: 'speed_100', name: { pt: 'Varredura orbital', en: 'Orbital scan', es: 'Barrido orbital' }, description: { pt: 'Uma linha de leitura percorre o selo.', en: 'A reading line travels across the seal.', es: 'Una línea de lectura recorre el sello.' } },
  { key: 'solar-pulse', slot: 'effect', achievement: 'top_1', name: { pt: 'Pulso solar', en: 'Solar pulse', es: 'Pulso solar' }, description: { pt: 'Um brilho fosco para quem já liderou.', en: 'A muted glow for a former leader.', es: 'Un brillo tenue para quien ya lideró.' } },
];

export const ACHIEVEMENTS = [
  { key: 'first_verified', icon: '01', title: { pt: 'Primeiro registro', en: 'First record', es: 'Primer registro' }, criteria: { pt: 'Conclua uma tentativa verificada.', en: 'Finish one verified attempt.', es: 'Termina un intento verificado.' } },
  { key: 'speed_50', icon: '50', title: { pt: 'Linha de base', en: 'Baseline', es: 'Línea base' }, criteria: { pt: 'Alcance 50 PPM.', en: 'Reach 50 WPM.', es: 'Alcanza 50 PPM.' } },
  { key: 'speed_75', icon: '75', title: { pt: 'Ritmo vetorial', en: 'Vector rhythm', es: 'Ritmo vectorial' }, criteria: { pt: 'Alcance 75 PPM.', en: 'Reach 75 WPM.', es: 'Alcanza 75 PPM.' } },
  { key: 'speed_100', icon: '100', title: { pt: 'Alta resolução', en: 'High resolution', es: 'Alta resolución' }, criteria: { pt: 'Alcance 100 PPM.', en: 'Reach 100 WPM.', es: 'Alcanza 100 PPM.' } },
  { key: 'precision_100', icon: '100%', title: { pt: 'Ponto de controle', en: 'Control point', es: 'Punto de control' }, criteria: { pt: 'Obtenha 100% de precisão com ao menos 20 PPM.', en: 'Get 100% accuracy at 20 WPM or more.', es: 'Obtén 100% de precisión con al menos 20 PPM.' } },
  { key: 'top_3', icon: '03', title: { pt: 'Referência de campo', en: 'Field reference', es: 'Referencia de campo' }, criteria: { pt: 'Alcance o Top 3.', en: 'Reach the Top 3.', es: 'Alcanza el Top 3.' } },
  { key: 'top_1', icon: '01', title: { pt: 'Marco zero', en: 'Zero mark', es: 'Marco cero' }, criteria: { pt: 'Alcance o primeiro lugar.', en: 'Reach first place.', es: 'Alcanza el primer lugar.' } },
  { key: 'all_passages_attempted', icon: 'A', title: { pt: 'Explorador do acervo', en: 'Collection explorer', es: 'Explorador del acervo' }, criteria: { pt: 'Registre uma tentativa em cada texto.', en: 'Record an attempt on every text.', es: 'Registra un intento en cada texto.' } },
  { key: 'all_passages_completed', icon: '✓', title: { pt: 'Atlas completo', en: 'Complete atlas', es: 'Atlas completo' }, criteria: { pt: 'Digite integralmente todos os textos.', en: 'Type every text in full.', es: 'Escribe todos los textos por completo.' } },
] as const;

export const REWARD_UI = {
  pt: { button: 'Recompensas', eyebrow: 'IDENTIDADE CARTOGRÁFICA', title: 'Sua coleção', description: 'Conquistas verificadas desbloqueiam novas formas de aparecer no ranking.', preview: 'PRÉVIA EQUIPADA', avatars: 'Selos', frames: 'Molduras', effects: 'Efeitos', achievements: 'Conquistas', equipped: 'Equipado', equip: 'Equipar', locked: 'Bloqueado', unlocked: 'Desbloqueado', signIn: 'Entre para registrar conquistas e equipar itens.', progress: 'Progresso do acervo', passages: 'textos praticados', completed: 'textos completos', close: 'Fechar coleção' },
  en: { button: 'Rewards', eyebrow: 'CARTOGRAPHIC IDENTITY', title: 'Your collection', description: 'Verified achievements unlock new ways to appear in the ranking.', preview: 'EQUIPPED PREVIEW', avatars: 'Seals', frames: 'Frames', effects: 'Effects', achievements: 'Achievements', equipped: 'Equipped', equip: 'Equip', locked: 'Locked', unlocked: 'Unlocked', signIn: 'Sign in to record achievements and equip items.', progress: 'Collection progress', passages: 'texts practiced', completed: 'texts completed', close: 'Close collection' },
  es: { button: 'Recompensas', eyebrow: 'IDENTIDAD CARTOGRÁFICA', title: 'Tu colección', description: 'Los logros verificados desbloquean nuevas formas de aparecer en el ranking.', preview: 'VISTA EQUIPADA', avatars: 'Sellos', frames: 'Marcos', effects: 'Efectos', achievements: 'Logros', equipped: 'Equipado', equip: 'Equipar', locked: 'Bloqueado', unlocked: 'Desbloqueado', signIn: 'Entra para registrar logros y equipar objetos.', progress: 'Progreso del acervo', passages: 'textos practicados', completed: 'textos completos', close: 'Cerrar colección' },
} as const;

export function cosmeticsFor(slot: CosmeticSlot) {
  return COSMETICS.filter((item) => item.slot === slot);
}

export function isCosmeticUnlocked(item: CosmeticItem, achievements: Set<string>) {
  return item.achievement === null || achievements.has(item.achievement);
}
