export function FormatNumber(data: number) {
  return data.toString().replace(/\d(?=(\d{3})+\.)/g, "$&,");
}
export function FormatNumberWithFixed(data: number, digit?: number) {
  digit = digit ?? 2;

  if (data?.toFixed)
    return data?.toFixed(digit).replace(/\d(?=(\d{3})+\.)/g, "$&,");
}
