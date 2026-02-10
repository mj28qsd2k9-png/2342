
export type ColumnType = 'string' | 'number' | 'date' | 'currency' | 'checkbox';
export type AggregationType = 'none' | 'sum' | 'avg' | 'count';

export interface Column {
  key: string;
  label: string;
  type: ColumnType;
  aggregation?: AggregationType;
}

export interface Row {
  id: string;
  [key: string]: any;
}

export interface Table {
  id: string;
  name: string;
  description: string;
  columns: Column[];
  rows: Row[];
  createdAt: string;
  themeColor?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  suggestedTable?: Partial<Table>;
}
