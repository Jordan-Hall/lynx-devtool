/**
 * 当一个request对应多个Response的时候，可以使用该类作为返回
 */
export class MultiResponse {
  private _data: any[] = [];

  put(response: any) {
    this._data.push(response);
  }

  getData() {
    return this._data;
  }
}
abstract class BaseHandler {
  abstract getName(): string;
  abstract handle(params?: any): Promise<any>;
}

export default BaseHandler;
