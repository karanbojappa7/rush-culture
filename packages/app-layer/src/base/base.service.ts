export abstract class BaseService {
  protected readonly context: string;

  constructor(context: string) {
    this.context = context;
  }

  protected log(message: string, payload?: unknown) {
    if (process.env.NODE_ENV === "production") return;
    if (payload === undefined) {
      console.info(`[${this.context}] ${message}`);
      return;
    }
    console.info(`[${this.context}] ${message}`, payload);
  }
}
