'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { Language } from './i18n';
import { EMPTY_PIXELS, isAvatarCell, PIXEL_GRID_SIZE, PIXEL_PALETTE, TRANSPARENT_PIXEL } from './rewards';

type Tool = 'pencil' | 'eraser' | 'fill' | 'picker';
type PixelAvatarEditorProps = {
  language: Language;
  name: string;
  pixels: number[];
  onChange: (pixels: number[]) => void;
};

const COPY = {
  pt: { pencil: 'Lápis', eraser: 'Borracha', fill: 'Preencher', picker: 'Conta-gotas', undo: 'Desfazer', redo: 'Refazer', clear: 'Limpar', initial: 'Usar inicial', mirrorX: 'Espelhar horizontalmente', mirrorY: 'Espelhar verticalmente', palette: 'Paleta de cores', transparent: 'Transparente', cell: 'Linha {row}, coluna {column}' },
  en: { pencil: 'Pencil', eraser: 'Eraser', fill: 'Fill', picker: 'Eyedropper', undo: 'Undo', redo: 'Redo', clear: 'Clear', initial: 'Use initial', mirrorX: 'Mirror horizontally', mirrorY: 'Mirror vertically', palette: 'Color palette', transparent: 'Transparent', cell: 'Row {row}, column {column}' },
  es: { pencil: 'Lápiz', eraser: 'Borrador', fill: 'Rellenar', picker: 'Cuentagotas', undo: 'Deshacer', redo: 'Rehacer', clear: 'Limpiar', initial: 'Usar inicial', mirrorX: 'Reflejar horizontalmente', mirrorY: 'Reflejar verticalmente', palette: 'Paleta de colores', transparent: 'Transparente', cell: 'Fila {row}, columna {column}' },
} as const;

function mirroredIndexes(index: number, mirrorX: boolean, mirrorY: boolean) {
  const row = Math.floor(index / PIXEL_GRID_SIZE);
  const column = index % PIXEL_GRID_SIZE;
  const rows = mirrorY ? [row, PIXEL_GRID_SIZE - 1 - row] : [row];
  const columns = mirrorX ? [column, PIXEL_GRID_SIZE - 1 - column] : [column];
  return [...new Set(rows.flatMap((nextRow) => columns.map((nextColumn) => nextRow * PIXEL_GRID_SIZE + nextColumn)))];
}

function rasterizedInitial(name: string, colorIndex: number) {
  const result = EMPTY_PIXELS();
  const canvas = document.createElement('canvas');
  canvas.width = PIXEL_GRID_SIZE;
  canvas.height = PIXEL_GRID_SIZE;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return result;
  const initial = Array.from(name.trim().normalize('NFD').replace(/\p{M}+/gu, ''))[0]?.toUpperCase() ?? 'L';
  context.clearRect(0, 0, PIXEL_GRID_SIZE, PIXEL_GRID_SIZE);
  context.fillStyle = '#000';
  context.font = '900 13px Arial Black, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(initial, 8, 8.5);
  const data = context.getImageData(0, 0, PIXEL_GRID_SIZE, PIXEL_GRID_SIZE).data;
  for (let index = 0; index < result.length; index += 1) {
    if (isAvatarCell(index) && data[(index * 4) + 3] > 96) result[index] = colorIndex;
  }
  return result;
}

export function PixelAvatarEditor({ language, name, pixels, onChange }: PixelAvatarEditorProps) {
  const copy = COPY[language];
  const [tool, setTool] = useState<Tool>('pencil');
  const [colorIndex, setColorIndex] = useState(18);
  const [mirrorX, setMirrorX] = useState(false);
  const [mirrorY, setMirrorY] = useState(false);
  const [undoStack, setUndoStack] = useState<number[][]>([]);
  const [redoStack, setRedoStack] = useState<number[][]>([]);
  const pixelsRef = useRef(pixels);
  const drawingRef = useRef(false);
  const lastIndexRef = useRef<number | null>(null);

  useEffect(() => { pixelsRef.current = pixels; }, [pixels]);
  useEffect(() => {
    const finishStroke = () => { drawingRef.current = false; lastIndexRef.current = null; };
    window.addEventListener('pointerup', finishStroke);
    window.addEventListener('pointercancel', finishStroke);
    return () => {
      window.removeEventListener('pointerup', finishStroke);
      window.removeEventListener('pointercancel', finishStroke);
    };
  }, []);

  const commit = useCallback((next: number[]) => {
    pixelsRef.current = next;
    onChange(next);
  }, [onChange]);

  const remember = useCallback(() => {
    setUndoStack((current) => [...current.slice(-29), pixelsRef.current.slice()]);
    setRedoStack([]);
  }, []);

  const paintAt = useCallback((index: number) => {
    if (!isAvatarCell(index) || index === lastIndexRef.current) return;
    lastIndexRef.current = index;
    if (tool === 'picker') {
      const picked = pixelsRef.current[index];
      if (picked >= 0 && picked < PIXEL_PALETTE.length) setColorIndex(picked);
      setTool('pencil');
      drawingRef.current = false;
      return;
    }
    if (tool === 'fill') {
      const target = pixelsRef.current[index];
      const replacement = colorIndex;
      if (target === replacement) return;
      const next = pixelsRef.current.slice();
      const queue = [index];
      const visited = new Set<number>();
      while (queue.length) {
        const current = queue.pop() as number;
        if (visited.has(current) || !isAvatarCell(current) || next[current] !== target) continue;
        visited.add(current);
        next[current] = replacement;
        const row = Math.floor(current / PIXEL_GRID_SIZE);
        const column = current % PIXEL_GRID_SIZE;
        if (row > 0) queue.push(current - PIXEL_GRID_SIZE);
        if (row < PIXEL_GRID_SIZE - 1) queue.push(current + PIXEL_GRID_SIZE);
        if (column > 0) queue.push(current - 1);
        if (column < PIXEL_GRID_SIZE - 1) queue.push(current + 1);
      }
      commit(next);
      drawingRef.current = false;
      return;
    }
    const replacement = tool === 'eraser' ? TRANSPARENT_PIXEL : colorIndex;
    const next = pixelsRef.current.slice();
    for (const target of mirroredIndexes(index, mirrorX, mirrorY)) {
      if (isAvatarCell(target)) next[target] = replacement;
    }
    commit(next);
  }, [colorIndex, commit, mirrorX, mirrorY, tool]);

  const beginStroke = (index: number) => {
    remember();
    drawingRef.current = true;
    lastIndexRef.current = null;
    paintAt(index);
  };

  const continueStroke = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drawingRef.current || (tool !== 'pencil' && tool !== 'eraser')) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-pixel-index]');
    const index = Number(target?.dataset.pixelIndex);
    if (Number.isInteger(index)) paintAt(index);
  };

  const undo = () => {
    const previous = undoStack.at(-1);
    if (!previous) return;
    setUndoStack((current) => current.slice(0, -1));
    setRedoStack((current) => [...current.slice(-29), pixelsRef.current.slice()]);
    commit(previous);
  };

  const redo = () => {
    const next = redoStack.at(-1);
    if (!next) return;
    setRedoStack((current) => current.slice(0, -1));
    setUndoStack((current) => [...current.slice(-29), pixelsRef.current.slice()]);
    commit(next);
  };

  const replaceDrawing = (next: number[]) => {
    remember();
    commit(next);
  };

  return (
    <div className="pixel-editor">
      <div className="pixel-editor__toolbar" role="toolbar" aria-label={copy.pencil}>
        {([
          ['pencil', '✎', copy.pencil], ['eraser', '◇', copy.eraser], ['fill', '▣', copy.fill], ['picker', '◎', copy.picker],
        ] as const).map(([key, icon, label]) => (
          <button type="button" className={tool === key ? 'is-active' : ''} aria-pressed={tool === key} title={label} onClick={() => setTool(key)} key={key}><b>{icon}</b><span>{label}</span></button>
        ))}
        <i />
        <button type="button" disabled={!undoStack.length} title={copy.undo} onClick={undo}><b>↶</b><span>{copy.undo}</span></button>
        <button type="button" disabled={!redoStack.length} title={copy.redo} onClick={redo}><b>↷</b><span>{copy.redo}</span></button>
      </div>

      <div className="pixel-grid-shell">
        <div className="pixel-grid" role="grid" aria-label="16 × 16" onPointerMove={continueStroke}>
          {pixels.map((paletteIndex, index) => {
            const inside = isAvatarCell(index);
            return (
              <button
                type="button"
                role="gridcell"
                data-pixel-index={index}
                disabled={!inside}
                aria-label={copy.cell.replace('{row}', String(Math.floor(index / PIXEL_GRID_SIZE) + 1)).replace('{column}', String((index % PIXEL_GRID_SIZE) + 1))}
                style={inside && paletteIndex >= 0 ? { backgroundColor: PIXEL_PALETTE[paletteIndex]?.color } : undefined}
                onPointerDown={(event) => { event.preventDefault(); beginStroke(index); }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  remember();
                  lastIndexRef.current = null;
                  paintAt(index);
                }}
                key={index}
              />
            );
          })}
        </div>
      </div>

      <div className="pixel-editor__actions">
        <button type="button" className={mirrorX ? 'is-active' : ''} aria-pressed={mirrorX} onClick={() => setMirrorX((value) => !value)}><b>↔</b>{copy.mirrorX}</button>
        <button type="button" className={mirrorY ? 'is-active' : ''} aria-pressed={mirrorY} onClick={() => setMirrorY((value) => !value)}><b>↕</b>{copy.mirrorY}</button>
        <button type="button" onClick={() => replaceDrawing(rasterizedInitial(name, colorIndex))}><b>A</b>{copy.initial}</button>
        <button type="button" onClick={() => replaceDrawing(EMPTY_PIXELS())}><b>×</b>{copy.clear}</button>
      </div>

      <div className="pixel-palette" aria-label={copy.palette}>
        <button type="button" className={`pixel-swatch pixel-swatch--transparent ${tool === 'eraser' ? 'is-active' : ''}`} title={copy.transparent} aria-label={copy.transparent} aria-pressed={tool === 'eraser'} onClick={() => setTool('eraser')} />
        {PIXEL_PALETTE.map((color, index) => (
          <button
            type="button"
            className={`pixel-swatch ${colorIndex === index && tool !== 'eraser' ? 'is-active' : ''}`}
            style={{ backgroundColor: color.color }}
            title={color.key}
            aria-label={color.key}
            aria-pressed={colorIndex === index && tool !== 'eraser'}
            onClick={() => { setColorIndex(index); setTool('pencil'); }}
            key={color.key}
          />
        ))}
      </div>
    </div>
  );
}
