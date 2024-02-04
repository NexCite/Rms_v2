type IResponse<T extends any = any> =
  | (
      | {
          status: 400;
          message: string;
          error: any[];
        }
      | {
          status: 200;
          message?: string;
        }
      | {
          status: 401;
        }
    ) & { body?: T };
export default IResponse;
