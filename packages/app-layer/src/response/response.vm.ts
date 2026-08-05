export class ResponseVm<T = unknown> {
  status_code: number;
  message: string;
  data?: T;

  constructor(status_code: number, message: string, data?: T) {
    this.status_code = status_code;
    this.message = message;
    this.data = data;
  }

  toJSON() {
    return {
      status_code: this.status_code,
      message: this.message,
      data: this.data,
    };
  }

  get ok() {
    return this.status_code === 200;
  }
}
