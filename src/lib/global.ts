export function FormatNumber(data: number) {
  return data.toString().replace(/\d(?=(\d{3})+\.)/g, "$&,");
}
export function FormatNumberWithFixed(data: number) {
  return data.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
}
