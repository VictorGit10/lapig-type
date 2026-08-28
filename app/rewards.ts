import type { Language } from './i18n';

export type CosmeticSlot = 'avatar' | 'border' | 'letter' | 'effect';
export type EquippedCosmetics = Record<CosmeticSlot, string>;
export type CosmeticItem = {
  key: string;
  slot: CosmeticSlot;
  achievement: string | null;
  name: Record<Language, string>;
  description: Record<Language, string>;
};

export const COSMETIC_SLOTS: CosmeticSlot[] = ['avatar', 'border', 'letter', 'effect'];
export const DEFAULT_COSMETICS: EquippedCosmetics = { avatar: 'topographic', border: 'forest', letter: 'ink', effect: 'none' };

export const COSMETICS: CosmeticItem[] = [
  { key: 'topographic', slot: 'avatar', achievement: null, name: { pt: 'Topografia', en: 'Topography', es: 'Topografía' }, description: { pt: 'Curvas de nível em alto contraste.', en: 'High-contrast contour lines.', es: 'Curvas de nivel de alto contraste.' } },
  { key: 'parcels', slot: 'avatar', achievement: 'first_verified', name: { pt: 'Parcelas', en: 'Parcels', es: 'Parcelas' }, description: { pt: 'Talhões vistos do alto.', en: 'Field parcels seen from above.', es: 'Parcelas vistas desde arriba.' } },
  { key: 'cerrado', slot: 'avatar', achievement: 'speed_50', name: { pt: 'Cerrado', en: 'Cerrado', es: 'Cerrado' }, description: { pt: 'Horizonte, sol e vegetação.', en: 'Horizon, sun, and vegetation.', es: 'Horizonte, sol y vegetación.' } },
  { key: 'radar', slot: 'avatar', achievement: 'top_3', name: { pt: 'Radar', en: 'Radar', es: 'Radar' }, description: { pt: 'Anéis de sensoriamento remoto.', en: 'Remote-sensing rings.', es: 'Anillos de teledetección.' } },
  { key: 'atlas', slot: 'avatar', achievement: 'all_passages_completed', name: { pt: 'Atlas', en: 'Atlas', es: 'Atlas' }, description: { pt: 'Uma grade global completa.', en: 'A complete global grid.', es: 'Una cuadrícula global completa.' } },

  { key: 'forest', slot: 'border', achievement: null, name: { pt: 'Mata', en: 'Forest', es: 'Bosque' }, description: { pt: 'Verde profundo.', en: 'Deep green.', es: 'Verde profundo.' } },
  { key: 'lime', slot: 'border', achievement: null, name: { pt: 'Lima', en: 'Lime', es: 'Lima' }, description: { pt: 'Verde luminoso.', en: 'Bright green.', es: 'Verde luminoso.' } },
  { key: 'clay', slot: 'border', achievement: null, name: { pt: 'Argila', en: 'Clay', es: 'Arcilla' }, description: { pt: 'Terra avermelhada.', en: 'Red earth.', es: 'Tierra rojiza.' } },
  { key: 'sun', slot: 'border', achievement: 'speed_75', name: { pt: 'Sol', en: 'Sun', es: 'Sol' }, description: { pt: 'Amarelo de campo.', en: 'Field yellow.', es: 'Amarillo de campo.' } },
  { key: 'ink', slot: 'border', achievement: 'top_3', name: { pt: 'Tinta', en: 'Ink', es: 'Tinta' }, description: { pt: 'Contorno escuro preciso.', en: 'Precise dark outline.', es: 'Contorno oscuro preciso.' } },

  { key: 'ink', slot: 'letter', achievement: null, name: { pt: 'Tinta', en: 'Ink', es: 'Tinta' }, description: { pt: 'Verde quase preto.', en: 'Near-black green.', es: 'Verde casi negro.' } },
  { key: 'forest', slot: 'letter', achievement: null, name: { pt: 'Mata', en: 'Forest', es: 'Bosque' }, description: { pt: 'Verde institucional.', en: 'Institutional green.', es: 'Verde institucional.' } },
  { key: 'paper', slot: 'letter', achievement: null, name: { pt: 'Papel', en: 'Paper', es: 'Papel' }, description: { pt: 'Branco quente com contorno.', en: 'Warm white with an outline.', es: 'Blanco cálido con contorno.' } },
  { key: 'clay', slot: 'letter', achievement: 'precision_100', name: { pt: 'Argila', en: 'Clay', es: 'Arcilla' }, description: { pt: 'Vermelho terroso.', en: 'Earthy red.', es: 'Rojo terroso.' } },
  { key: 'sun', slot: 'letter', achievement: 'top_1', name: { pt: 'Sol', en: 'Sun', es: 'Sol' }, description: { pt: 'Amarelo reservado a líderes.', en: 'Yellow reserved for leaders.', es: 'Amarillo reservado para líderes.' } },

  { key: 'none', slot: 'effect', achievement: null, name: { pt: 'Sem efeito', en: 'No effect', es: 'Sin efecto' }, description: { pt: 'Avatar estático.', en: 'Static avatar.', es: 'Avatar estático.' } },
  { key: 'contours', slot: 'effect', achievement: 'first_verified', name: { pt: 'Órbita', en: 'Orbit', es: 'Órbita' }, description: { pt: 'Um traço gira lentamente.', en: 'A line rotates slowly.', es: 'Una línea gira lentamente.' } },
  { key: 'scan', slot: 'effect', achievement: 'speed_100', name: { pt: 'Varredura', en: 'Scan', es: 'Barrido' }, description: { pt: 'Pulso de leitura vertical.', en: 'A vertical reading pulse.', es: 'Un pulso de lectura vertical.' } },
  { key: 'solar-pulse', slot: 'effect', achievement: 'top_1', name: { pt: 'Pulso solar', en: 'Solar pulse', es: 'Pulso solar' }, description: { pt: 'Brilho raro e contido.', en: 'A rare, restrained glow.', es: 'Un brillo raro y contenido.' } },
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
  pt: { button: 'Personalizar avatar', eyebrow: 'IDENTIDADE', title: 'Personalizar avatar', description: 'Escolha um padrão, as cores e um efeito. Itens especiais informam a conquista necessária.', patterns: 'Fundo', borderColors: 'Cor da borda', letterColors: 'Cor da inicial', effects: 'Efeito', selected: 'Selecionado', save: 'Salvar avatar', saving: 'Salvando…', saved: 'Avatar salvo', undo: 'Desfazer', signIn: 'Entre para salvar o avatar e desbloquear recompensas.', close: 'Fechar personalizador', unlockWith: 'Desbloqueie esta opção:', initialPreview: 'PRÉVIA', achievements: 'Conquistas', progress: 'Progresso', unlocked: 'Desbloqueado' },
  en: { button: 'Customize avatar', eyebrow: 'IDENTITY', title: 'Customize avatar', description: 'Choose a pattern, colors, and an effect. Special items show the achievement they require.', patterns: 'Background', borderColors: 'Border color', letterColors: 'Initial color', effects: 'Effect', selected: 'Selected', save: 'Save avatar', saving: 'Saving…', saved: 'Avatar saved', undo: 'Undo', signIn: 'Sign in to save your avatar and unlock rewards.', close: 'Close customizer', unlockWith: 'Unlock this option:', initialPreview: 'PREVIEW', achievements: 'Achievements', progress: 'Progress', unlocked: 'Unlocked' },
  es: { button: 'Personalizar avatar', eyebrow: 'IDENTIDAD', title: 'Personalizar avatar', description: 'Elige un patrón, los colores y un efecto. Los objetos especiales muestran el logro necesario.', patterns: 'Fondo', borderColors: 'Color del borde', letterColors: 'Color de la inicial', effects: 'Efecto', selected: 'Seleccionado', save: 'Guardar avatar', saving: 'Guardando…', saved: 'Avatar guardado', undo: 'Deshacer', signIn: 'Entra para guardar tu avatar y desbloquear recompensas.', close: 'Cerrar personalizador', unlockWith: 'Desbloquea esta opción:', initialPreview: 'VISTA PREVIA', achievements: 'Logros', progress: 'Progreso', unlocked: 'Desbloqueado' },
} as const;

export function cosmeticsFor(slot: CosmeticSlot) { return COSMETICS.filter((item) => item.slot === slot); }
export function isCosmeticUnlocked(item: CosmeticItem, achievements: Set<string>) { return item.achievement === null || achievements.has(item.achievement); }
