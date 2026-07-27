export interface ColumnData {
  id: number;
  title: string;
  position: number;
  user_id: number;
}

export interface ColumnCreateRequest {
  title: string;
}

export interface ColumnUpdateRequest {
  title: string;
}

export async function getColumns(): Promise<ColumnData[]> {
  throw new Error("not implemented");
}

export async function createColumn(_data: ColumnCreateRequest): Promise<ColumnData> {
  throw new Error("not implemented");
}

export async function updateColumn(
  _id: number,
  _data: ColumnUpdateRequest,
): Promise<ColumnData> {
  throw new Error("not implemented");
}

export async function deleteColumn(_id: number): Promise<void> {
  throw new Error("not implemented");
}

export async function reorderColumns(_columnIds: number[]): Promise<void> {
  throw new Error("not implemented");
}
