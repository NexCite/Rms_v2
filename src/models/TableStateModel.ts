import {
  MRT_ColumnFiltersState,
  MRT_ExpandedState,
  MRT_GroupingState,
  MRT_PaginationState,
  MRT_SortingState,
} from "material-react-table";
type StateSetter<T> = (newValue: T | ((prevValue: T) => T)) => void;
export default interface TableStateModel {
  fromDate?: Date;
  toDate?: Date;
  filterColumns?: MRT_ColumnFiltersState;
  groups?: MRT_GroupingState;
  pagination?: MRT_PaginationState;
  sorting?: MRT_SortingState;
  expanded?: MRT_ExpandedState;
  setColumnsFilter?: StateSetter<MRT_ColumnFiltersState>;
  setGlobalFilter?: StateSetter<any>;
  globalFilter?: any;
  setGroups?: StateSetter<MRT_GroupingState>;
  setPagination?: StateSetter<MRT_PaginationState>;
  setSorting?: StateSetter<MRT_SortingState>;
  setExpanded?: StateSetter<MRT_ExpandedState>;
  setFromDate?: StateSetter<Date>;
  setToDate?: StateSetter<Date>;
}
