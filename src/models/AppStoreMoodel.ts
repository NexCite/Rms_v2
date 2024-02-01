import { MRT_TableState } from "material-react-table";

export default interface AppStoreModel {
  table?: MRT_TableState<any>;

  date?:
    | {
        from?: Date;
        to?: Date;
      }
    | Date;
  id?: number;
}
export interface VocuherStoreModel {
  table?: MRT_TableState<any>;

  date?: Date;
  id?: number;
}
