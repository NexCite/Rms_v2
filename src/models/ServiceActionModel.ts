import { FormErrors } from "@mantine/form";
import HttpStatusCode from "@rms/models/HttpStatusCode";

export default interface ServiceActionModel<I> {
  status: HttpStatusCode;
  errors?: FormErrors;
  message?: string;
  result?: I;
}
