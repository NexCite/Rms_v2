import { ValidationError } from "class-validator";

export function ValidErrorsMessage(valid: ValidationError[]) {
  return valid.map((error) => {
    const { property, constraints } = error;
    const field = property;
    const message = Object.values(constraints)[0];
    return { field, message };
  });
}

export function FormatNumber(data: number) {
  return data.toString().replace(/\d(?=(\d{3})+\.)/g, "$&,");
}
export function FormatNumberWithFixed(data: number) {
  return data.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
}
