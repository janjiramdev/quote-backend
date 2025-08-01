export interface ContextRequest {
  method: string;
  url: string;
  params?: { [key: string]: unknown };
  query?: { [key: string]: unknown };
  body?: unknown;
}

export interface ContextResponse {
  statusCode: number;
}
