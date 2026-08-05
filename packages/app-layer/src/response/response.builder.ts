import { ResponseVm } from "./response.vm";

export class ResponseBuilder {
  success<T>(msg: string, data?: T): ResponseVm<T> {
    return new ResponseVm(200, msg, data);
  }

  warning(msg: string): ResponseVm {
    return new ResponseVm(401, msg);
  }

  authError(msg: string): ResponseVm {
    return new ResponseVm(403, msg);
  }

  codeError<T = unknown>(msg: string): ResponseVm<T> {
    return new ResponseVm<T>(1000, msg);
  }
}
