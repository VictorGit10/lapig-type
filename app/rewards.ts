import type { Language } from './i18n';

export type CosmeticSlot = 'avatar' | 'mark' | 'palette' | 'frame' | 'effect';
export type EquippedCosmetics = Record<CosmeticSlot, string>;

export type CosmeticItem = {
  key: string;
  slot: CosmeticSlot;
  achievement: string | null;
  name: Record<Language, string>;
  description: Record<Language, string>;
};

export const COSMETIC_SLOTS: CosmeticSlot[] = ['avatar', 'mark', 'palette', 'frame', 'effect'];

export const DEFAULT_COSMETICS: EquippedCosmetics = {
  avatar: 'topographic', mark: 'contours', palette: 'field', frame: 'none', effect: 'none',
};

export const COSMETICS: CosmeticItem[] = [
  { key: 'topographic', slot: 'avatar', achievement: null, name: { pt: 'Relevo', en: 'Relief', es: 'Relieve' }, description: { pt: 'Curvas de nível discretas.', en: 'Subtle contour lines.', es: 'Curvas de nivel discretas.' } },
  { key: 'cerrado', slot: 'avatar', achievement: 'all_passages_attempted', name: { pt: 'Horizonte', en: 'Horizon', es: 'Horizonte' }, description: { pt: 'Uma paisagem reduzida ao essencial.', en: 'A landscape reduced to its essentials.', es: 'Un paisaje reducido a lo esencial.' } },
  { key: 'atlas', slot: 'avatar', achievement: 'all_passages_completed', name: { pt: 'Quadrícula', en: 'Grid', es: 'Cuadrícula' }, description: { pt: 'A malha de um atlas completo.', en: 'The grid of a complete atlas.', es: 'La cuadrícula de un atlas completo.' } },

  { key: 'contours', slot: 'mark', achievement: null, name: { pt: 'Curvas', en: 'Contours', es: 'Curvas' }, description: { pt: 'A assinatura original do território.', en: 'The territory’s original signature.', es: 'La firma original del territorio.' } },
  { key: 'leaf', slot: 'mark', achievement: 'first_verified', name: { pt: 'Folha de campo', en: 'Field leaf', es: 'Hoja de campo' }, description: { pt: 'Primeiro registro científico.', en: 'Your first scientific record.', es: 'Tu primer registro científico.' } },
  { key: 'pin', slot: 'mark', achievement: 'speed_50', name: { pt: 'Marco', en: 'Marker', es: 'Hito' }, description: { pt: 'Um ponto fixado no mapa.', en: 'A point fixed on the map.', es: 'Un punto fijado en el mapa.' } },
  { key: 'orbit', slot: 'mark', achievement: 'speed_75', name: { pt: 'Órbita', en: 'Orbit', es: 'Órbita' }, description: { pt: 'Leitura remota em movimento.', en: 'Remote sensing in motion.', es: 'Lectura remota en movimiento.' } },
  { key: 'keys', slot: 'mark', achievement: 'precision_100', name: { pt: 'Teclas', en: 'Keys', es: 'Teclas' }, description: { pt: 'Precisão convertida em símbolo.', en: 'Accuracy turned into a symbol.', es: 'Precisión convertida en símbolo.' } },
  { key: 'globe', slot: 'mark', achievement: 'top_1', name: { pt: 'Mundo', en: 'World', es: 'Mundo' }, description: { pt: 'Reservado a quem já liderou.', en: 'Reserved for a former leader.', es: 'Reservado para quien ya lideró.' } },

  { key: 'field', slot: 'palette', achievement: null, name: { pt: 'Campo', en: 'Field', es: 'Campo' }, description: { pt: 'Verde, papel e cal.', en: 'Green, paper, and lime.', es: 'Verde, papel y lima.' } },
  { key: 'clay', slot: 'palette', achievement: 'first_verified', name: { pt: 'Terra', en: 'Earth', es: 'Tierra' }, description: { pt: 'Argila quente e mata profunda.', en: 'Warm clay and deep forest.', es: 'Arcilla cálida y bosque profundo.' } },
  { key: 'sun', slot: 'palette', achievement: 'speed_50', name: { pt: 'Luz solar', en: 'Sunlight', es: 'Luz solar' }, description: { pt: 'Amarelo de campo e tinta escura.', en: 'Field yellow and dark ink.', es: 'Amarillo de campo y tinta oscura.' } },
  { key: 'night', slot: 'palette', achievement: 'top_3', name: { pt: 'Carta noturna', en: 'Night map', es: 'Mapa nocturno' }, description: { pt: 'Leitura de alto contraste.', en: 'A high-contrast reading.', es: 'Una lectura de alto contraste.' } },

  { key: 'none', slot: 'frame', achievement: null, name: { pt: 'Essencial', en: 'Essential', es: 'Esencial' }, description: { pt: 'Somente o emblema.', en: 'Only the emblem.', es: 'Solo el emblema.' } },
  { key: 'baseline', slot: 'frame', achievement: 'speed_50', name: { pt: 'Linha de base', en: 'Baseline', es: 'Línea base' }, description: { pt: 'Aro simples em verde-lima.', en: 'A simple lime ring.', es: 'Un aro sencillo verde lima.' } },
  { key: 'vector', slot: 'frame', achievement: 'speed_75', name: { pt: 'Vetor', en: 'Vector', es: 'Vector' }, description: { pt: 'Duas direções, um ritmo.', en: 'Two directions, one rhythm.', es: 'Dos direcciones, un ritmo.' } },
  { key: 'high-resolution', slot: 'frame', achievement: 'speed_100', name: { pt: 'Alta resolução', en: 'High resolution', es: 'Alta resolución' }, description: { pt: 'Detalhe duplo para alta velocidade.', en: 'Double detail for high speed.', es: 'Detalle doble para alta velocidad.' } },
  { key: 'control-point', slot: 'frame', achievement: 'precision_100', name: { pt: 'Ponto de controle', en: 'Control point', es: 'Punto de control' }, description: { pt: 'Quatro marcas de precisão.', en: 'Four precision marks.', es: 'Cuatro marcas de precisión.' } },
  { key: 'reference', slot: 'frame', achievement: 'top_3', name: { pt: 'Referência', en: 'Reference', es: 'Referencia' }, description: { pt: 'Uma borda reservada ao pódio.', en: 'A border reserved for the podium.', es: 'Un borde reservado al podio.' } },
  { key: 'zero-mark', slot: 'frame', achievement: 'top_1', name: { pt: 'Marco zero', en: 'Zero mark', es: 'Marco cero' }, description: { pt: 'A moldura de quem chegou ao topo.', en: 'The frame of someone who reached the top.', es: 'El marco de quien llegó a la cima.' } },

  { key: 'none', slot: 'effect', achievement: null, name: { pt: 'Sem movimento', en: 'Still', es: 'Sin movimiento' }, description: { pt: 'Presença silenciosa.', en: 'A quiet presence.', es: 'Una presencia silenciosa.' } },
  { key: 'contours', slot: 'effect', achievement: 'first_verified', name: { pt: 'Leitura', en: 'Reading', es: 'Lectura' }, description: { pt: 'Um traço percorre o emblema.', en: 'A line travels across the emblem.', es: 'Una línea recorre el emblema.' } },
  { key: 'scan', slot: 'effect', achievement: 'speed_100', name: { pt: 'Varredura', en: 'Scan', es: 'Barrido' }, description: { pt: 'Pulso breve de sensoriamento.', en: 'A brief sensing pulse.', es: 'Un breve pulso de detección.' } },
  { key: 'solar-pulse', slot: 'effect', achievement: 'top_1', name: { pt: 'Pulso solar', en: 'Solar pulse', es: 'Pulso solar' }, description: { pt: 'Um brilho raro e contido.', en: 'A rare, restrained glow.', es: 'Un brillo raro y contenido.' } },
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
  pt: { button: 'Personalizar avatar', eyebrow: 'IDENTIDADE DE CAMPO', title: 'Personalizar avatar', description: 'Combine itens do seu inventário. A prévia só será aplicada ao ranking quando você salvar.', inventory: 'Inventário', discover: 'A descobrir', achievements: 'Conquistas', all: 'Tudo', avatars: 'Base', marks: 'Símbolo', palettes: 'Cor', frames: 'Moldura', effects: 'Efeito', equipped: 'Em uso', select: 'Usar na prévia', locked: 'Bloqueado', unlocked: 'Desbloqueado', save: 'Salvar avatar', saving: 'Salvando…', saved: 'Avatar salvo', undo: 'Desfazer alterações', signIn: 'Entre para desbloquear itens e salvar seu avatar.', progress: 'Seu inventário', items: 'itens disponíveis', passages: 'textos praticados', completed: 'textos completos', close: 'Fechar personalizador', empty: 'Nenhum item nesta categoria.', loadout: 'COMBINAÇÃO ATUAL' },
  en: { button: 'Customize avatar', eyebrow: 'FIELD IDENTITY', title: 'Customize avatar', description: 'Combine items from your inventory. The preview only reaches the ranking after you save.', inventory: 'Inventory', discover: 'To discover', achievements: 'Achievements', all: 'All', avatars: 'Base', marks: 'Symbol', palettes: 'Color', frames: 'Frame', effects: 'Effect', equipped: 'In use', select: 'Use in preview', locked: 'Locked', unlocked: 'Unlocked', save: 'Save avatar', saving: 'Saving…', saved: 'Avatar saved', undo: 'Undo changes', signIn: 'Sign in to unlock items and save your avatar.', progress: 'Your inventory', items: 'items available', passages: 'texts practiced', completed: 'texts completed', close: 'Close customizer', empty: 'No items in this category.', loadout: 'CURRENT COMBINATION' },
  es: { button: 'Personalizar avatar', eyebrow: 'IDENTIDAD DE CAMPO', title: 'Personalizar avatar', description: 'Combina objetos de tu inventario. La vista previa solo llega al ranking cuando guardas.', inventory: 'Inventario', discover: 'Por descubrir', achievements: 'Logros', all: 'Todo', avatars: 'Base', marks: 'Símbolo', palettes: 'Color', frames: 'Marco', effects: 'Efecto', equipped: 'En uso', select: 'Usar en vista previa', locked: 'Bloqueado', unlocked: 'Desbloqueado', save: 'Guardar avatar', saving: 'Guardando…', saved: 'Avatar guardado', undo: 'Deshacer cambios', signIn: 'Entra para desbloquear objetos y guardar tu avatar.', progress: 'Tu inventario', items: 'objetos disponibles', passages: 'textos practicados', completed: 'textos completos', close: 'Cerrar personalizador', empty: 'No hay objetos en esta categoría.', loadout: 'COMBINACIÓN ACTUAL' },
} as const;

export function cosmeticsFor(slot: CosmeticSlot) {
  return COSMETICS.filter((item) => item.slot === slot);
}

export function isCosmeticUnlocked(item: CosmeticItem, achievements: Set<string>) {
  return item.achievement === null || achievements.has(item.achievement);
}
