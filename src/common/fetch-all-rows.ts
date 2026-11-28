import { throwDatabaseError } from './database-errors';

type RangeQuery<T> = {
  range(from: number, to: number): PromiseLike<{
    data: T[] | null;
    error: { message: string; code?: string } | null;
  }>;
};

export async function fetchAllRows<T>(query: RangeQuery<T>): Promise<T[]> {
  const rows: T[] = [];
  const pageSize = 1000;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await query.range(offset, offset + pageSize - 1);
    if (error) throwDatabaseError(error);
    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}
