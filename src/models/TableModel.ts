import { MRT_ColumnDef } from "mantine-react-table";
import { CommonKeys, DataModelsType } from "./CommonModel";

export class TableModel {
  enableColumnFilterModes?: boolean;
  enableColumnOrdering?: boolean;
  enableGrouping?: boolean;
  enablePinning?: boolean;
  enableRowSelection?: boolean;
  columns?: MRT_ColumnDef<any>[];
  rowActions?: Array<RowActionsEnum>;

  constructor(props?: TableModel) {
    return {
      enableColumnFilterModes: props?.enableColumnFilterModes || true,
      enableColumnOrdering: props?.enableColumnOrdering || true,
      enableGrouping: props?.enableGrouping || true,
      enablePinning: props?.enablePinning || true,
      enableRowSelection: props?.enableRowSelection || true,
      columns: props?.columns || [],
      rowActions: props?.rowActions || [
        RowActionsEnum.edit,
        RowActionsEnum.delete,
        RowActionsEnum.view,
      ],
    };
  }
}

export enum RowActionsEnum {
  edit,
  view,
  delete,
}
