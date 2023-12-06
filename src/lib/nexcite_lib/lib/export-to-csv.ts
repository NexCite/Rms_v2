/**
 * client side
 *
 */
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here
import { MRT_Row } from "material-react-table";

export default class NexCiteExportToCsv {
  private static csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });
  static handleSelectedExportRows<
    T extends { [key: string]: unknown; [key: number]: unknown }
  >(rows: MRT_Row<T>[]) {
    if (rows.length === 0) {
      return;
    }
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(this.csvConfig)(rowData);
    download(this.csvConfig)(csv);
  }
  static handleExportRows<
    T extends { [key: string]: unknown; [key: number]: unknown }
  >(rows: T[]) {
    if (rows.length === 0) {
      return;
    }
    const csv = generateCsv(this.csvConfig)(rows);
    download(this.csvConfig)(csv);
  }
}
