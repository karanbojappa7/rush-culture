export class ResponseVm<T = unknown> {
  status_code: number;
  message: string;
  data?: T;

  constructor(status_code: number, message: string, data?: T) {
    this.status_code = status_code;
    this.message = message;
    this.data = data;
  }
}
