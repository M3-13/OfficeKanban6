import { apiGet, apiPost, apiPut, apiDelete } from "./client";

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
  try {
    return await apiGet<ColumnData[]>("/columns");
  } catch (error) {
    throw new Error(
      `Failed to get columns: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function createColumn(data: ColumnCreateRequest): Promise<ColumnData> {
  try {
    return await apiPost<ColumnData>("/columns", data);
  } catch (error) {
    throw new Error(
      `Failed to create column: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function updateColumn(
  id: number,
  data: ColumnUpdateRequest,
): Promise<ColumnData> {
  try {
    return await apiPut<ColumnData>(`/columns/${id}`, data);
  } catch (error) {
    throw new Error(
      `Failed to update column: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function deleteColumn(id: number): Promise<void> {
  try {
    await apiDelete(`/columns/${id}`);
  } catch (error) {
    throw new Error(
      `Failed to delete column: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function reorderColumns(orderedIds: number[]): Promise<void> {
  try {
    await apiPut<void>("/columns/reorder", orderedIds);
  } catch (error) {
    throw new Error(
      `Failed to reorder columns: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
