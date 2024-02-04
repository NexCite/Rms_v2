type ResponseModel<T extends any = any> =
  | (
      | {
          status: 400;
          message: string;
          error: any[];
        }
      | {
          status: 200;
        }
      | {
          status: 401;
        }
    ) & { body: T };
export default ResponseModel;
