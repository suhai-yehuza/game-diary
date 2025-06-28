export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
    this.code = code ?? 'API_ERROR';
  }
}
