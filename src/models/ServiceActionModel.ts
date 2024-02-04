import HttpStatusCode from "@nexcite/models/HttpStatusCode";

export default interface ServiceActionModel<I> {
  status: HttpStatusCode;
  errors?: any;
  message?: string;
  result?: I;
}
