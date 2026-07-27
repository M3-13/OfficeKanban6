import { apiGet, apiPost, apiPut, apiDelete } from "./client";

export interface CardData {
  id: number;
  title: string;
  description: string;
  position: number;
  column_id: number;
  user_id: number;
}

export interface CardCreateRequest {
  title: string;
  description?: string;
  column_id: number;
}

export interface CardUpdateRequest {
  title?: string;
  description?: string;
}

export interface CardMoveRequest {
  card_id: number;
  column_id: number;
  position: number;
}

export async function getCards(columnId: number): Promise<CardData[]> {
  return apiGet<CardData[]>(`/cards?column_id=${encodeURIComponent(columnId)}`);
}

export async function createCard(
  title: string,
  description: string,
  columnId: number,
): Promise<CardData> {
  const body: CardCreateRequest = {
    title,
    description,
    column_id: columnId,
  };
  return apiPost<CardData>("/cards", body);
}

export async function updateCard(
  id: number,
  title: string,
  description: string,
): Promise<CardData> {
  const body: CardUpdateRequest = { title, description };
  return apiPut<CardData>(`/cards/${id}`, body);
}

export async function deleteCard(id: number): Promise<void> {
  return apiDelete(`/cards/${id}`);
}

export async function moveCard(
  cardId: number,
  targetColumnId: number,
  targetPosition: number,
): Promise<void> {
  const body: CardMoveRequest = {
    card_id: cardId,
    column_id: targetColumnId,
    position: targetPosition,
  };
  return apiPut<void>("/cards/move", body);
}
