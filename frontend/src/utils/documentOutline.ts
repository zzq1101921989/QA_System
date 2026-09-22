import type { Document } from '../types/chat';

export interface OutlineTreeNode {
  title: string;
  children: OutlineTreeNode[];
  startPage?: number;
  endPage?: number;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function tryParseJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function getStringField(record: UnknownRecord, key: string): string | null {
  const value = record[key];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getNumberField(record: UnknownRecord, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' ? value : undefined;
}

function getArrayField(record: UnknownRecord, key: string): unknown[] | null {
  const value = record[key];
  return Array.isArray(value) ? value : null;
}

function normalizeDirectoryChunk(value: unknown): OutlineTreeNode | null {
  if (!isRecord(value)) return null;
  const record: UnknownRecord = value;
  const title = getStringField(record, 'title');
  if (typeof title !== 'string' || title.trim().length === 0) return null;

  const childrenRaw = getArrayField(record, 'chunks');
  const children = childrenRaw ? childrenRaw.map(normalizeDirectoryChunk).filter((n): n is OutlineTreeNode => n !== null) : [];

  const startPage = getNumberField(record, 'startPage');
  const endPage = getNumberField(record, 'endPage');

  return {
    title,
    children,
    startPage,
    endPage,
  };
}

function normalizeDirectoryRequest(value: unknown): OutlineTreeNode | null {
  if (!isRecord(value)) return null;
  const record: UnknownRecord = value;
  const title = getStringField(record, 'title');
  if (!title) return null;

  const childrenRaw = getArrayField(record, 'chunks');
  const children = childrenRaw ? childrenRaw.map(normalizeDirectoryChunk).filter((n): n is OutlineTreeNode => n !== null) : [];

  const startPage = getNumberField(record, 'documentStartPage');
  const endPage = getNumberField(record, 'documentEndPage');

  return {
    title,
    children,
    startPage,
    endPage,
  };
}

function normalizeToc(value: unknown): OutlineTreeNode[] {
  const raw = tryParseJson(value);
  if (!Array.isArray(raw)) return [];

  return raw.map(normalizeDirectoryRequest).filter((n): n is OutlineTreeNode => n !== null);
}

function normalizeOutlineNode(value: unknown): OutlineTreeNode | null {
  if (!isRecord(value)) return null;
  const record: UnknownRecord = value;

  const titleFromTitle = getStringField(record, 'title');
  const label = record.label;
  const titleFromLabel = isRecord(label) ? getStringField(label as UnknownRecord, 'title') : null;

  const title = titleFromTitle ?? titleFromLabel;
  if (!title) return null;

  const childrenRaw = getArrayField(record, 'children');
  const children = childrenRaw ? childrenRaw.map(normalizeOutlineNode).filter((n): n is OutlineTreeNode => n !== null) : [];

  return { title, children };
}

function normalizeOutline(value: unknown): OutlineTreeNode[] {
  const raw = tryParseJson(value);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeOutlineNode).filter((n): n is OutlineTreeNode => n !== null);
}

export function getPreferredDocumentOutline(document: Pick<Document, 'toc' | 'outline'>): OutlineTreeNode[] {
  const toc = normalizeToc(document.toc.chunks);
  if (toc.length > 0) return toc;

  return normalizeOutline(document.outline);
}

export function hasPreferredDocumentOutline(document: Pick<Document, 'toc' | 'outline'>): boolean {
  return getPreferredDocumentOutline(document).length > 0;
}
