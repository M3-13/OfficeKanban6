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
  column_id: number;
}

export async function getCards(): Promise<CardData[]> {
  throw new Error("not implemented");
}

export async function createCard(_data: CardCreateRequest): Promise<CardData> {
  throw new Error("not implemented");
}

export async function updateCard(
  _id: number,
  _data: CardUpdateRequest,
): Promise<CardData> {
  throw new Error("not implemented");
}

export async function deleteCard(_id: number): Promise<void> {
  throw new Error("not implemented");
}

export async function moveCard(_id: number, _data: CardMoveRequest): Promise<void> {
  throw new Error("not implemented");
}
