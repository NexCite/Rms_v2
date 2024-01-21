"use client";
import { MenuItem } from "@mui/material";
import { $Enums, Prisma } from "@prisma/client";
import Authorized from "@rms/components/other/authorized";
import { useToast } from "@rms/hooks/toast-hook";
import TableStateModel from "@rms/models/TableStateModel";

import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";
import { FormatNumberWithFixed, exportToExcel } from "@rms/lib/global";
import { findChartOfAccounts } from "@rms/service/chart-of-account-service";
import dayjs from "dayjs";
import {
  MRT_ColumnFiltersState,
  MRT_ExpandedState,
  MRT_GroupingState,
  MRT_PaginationState,
  MRT_SortingState,
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { AiFillFileExcel } from "react-icons/ai";
import { MdSearch } from "react-icons/md";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ChartOfAccountSearchSchema } from "../../schema/chart-of-account";

type Props = {
  node: $Enums.AccountType;
  parents: Prisma.ChartOfAccountGetPayload<{}>[];
  currencies: Prisma.CurrencyGetPayload<{}>[];
};

type ChartOfAccounts = Prisma.ChartOfAccountGetPayload<{
  include: {
    currency: true;
    voucher_items: {
      include: {
        voucher: { include: { currency: true } };

        currency: true;
      };
    };
    reffrence_voucher_items: {
      include: {
        voucher: { include: { currency: true } };

        currency: true;
      };
    };
  };
}> & { total?: number };
export default function ChartOfAccountAccountsTable(props: Props) {
  const toast = useToast();
  const [isPadding, setTransition] = useTransition();
  const [data, setData] = useState<ChartOfAccounts[]>([]);
  const filter = useFilter();
  const pathName = usePathname();
  const form = useForm<ChartOfAccountSearchSchema>({
    resolver: zodResolver(ChartOfAccountSearchSchema),
    defaultValues: {
      include_reffrence: false,
      from: dayjs(filter.fromDate).startOf("d").toDate(),
      to: dayjs(filter.toDate).endOf("d").toDate(),
      id: undefined,
      type: props.node,
    },
  });

  const columns = useMemo(
    () => [
      columnGroupedDataHelper.accessor("id", {
        header: "ID",
        filterVariant: "autocomplete",

        enableColumnActions: true,
      }),
      columnGroupedDataHelper.accessor("business_id", {
        header: "Business ID",
        filterVariant: "autocomplete",

        enableColumnActions: true,
      }),
      columnGroupedDataHelper.accessor("name", {
        header: "Name",
        filterVariant: "autocomplete",
      }),
      columnGroupedDataHelper.accessor((row) => row.currency?.name, {
        id: "currency.name",
        filterVariant: "multi-select",

        filterSelectOptions: props.currencies.map((res) => res.name),

        header: "Currency",
      }),

      columnGroupedDataHelper.accessor("class", {
        filterVariant: "multi-select",
        filterSelectOptions: Array.from({ length: 9 }).map((res, i) => i + ""),

        header: "Class",
      }),
      columnGroupedDataHelper.accessor(
        (row) => row.chart_of_account_type?.replaceAll("_", " "),
        {
          id: "chart_of_account_type",
          header: "Account Type",
          filterVariant: "multi-select",

          filterSelectOptions: Object.keys($Enums.ChartOfAccountType),
          GroupedCell: ({ row, cell }) => {
            return cell.getValue();
          },
        }
      ),
      columnGroupedDataHelper.accessor(
        (row) => row.debit_credit?.replaceAll("_", "/"),
        {
          id: "debit_credit",
          filterVariant: "multi-select",

          header: "D/C",
        }
      ),
      columnGroupedDataHelper.accessor(
        (row) => {
          var total = 0;

          row.voucher_items.map((res) => {
            if (res.debit_credit === "Debit") {
              total += res.amount / res.rate;
            } else {
              total -= res.amount / res.rate;
            }
          });
          row.reffrence_voucher_items?.map((res) => {
            if (res.debit_credit === "Debit") {
              total += res.amount / res.rate;
            } else {
              total -= res.amount / res.rate;
            }
          });

          return total * (row.currency?.rate ?? 1);
        },
        {
          id: "total",
          header: "Total",
          filterVariant: "range",
          filterFn: (row, name, range: string[]) => {
            const total = row.getAllCells()[9].getValue() as string;
            //

            const minNumber = range[0];
            const maxNumber = range[1];
            // console.log(name);

            if (minNumber && maxNumber) {
              console.log(minNumber);

              return total >= minNumber && total <= maxNumber;
            } else if (minNumber) {
              console.log(1);

              return total >= minNumber;
            } else if (maxNumber) {
              console.log(maxNumber);

              return total <= maxNumber;
            }

            // const minNumber=parseFloat(min)
            return true;
          },
          Cell({
            row: {
              getAllCells,
              original: { currency },
            },
          }) {
            const total = parseFloat(getAllCells()[9].getValue() as string);

            return (
              <span
                className={`${
                  total >= 0 ? "bg-green-400" : "bg-red-400"
                }  rounded-lg px-3 text-white`}
              >
                {currency?.symbol ?? "$"}
                {FormatNumberWithFixed(total, 2)}
              </span>
            );
          },
        }
      ),
    ],
    [props.currencies]
  );
  const table = useMaterialReactTable({
    columns,
    data,
    muiTableHeadCellProps: {
      align: "left",
    },

    muiTableProps: { id: "chart-of-account-table-" + props.node },
    enableRowSelection: false,
    enableStickyHeader: true,
    enableClickToCopy: true,
    enableGlobalFilter: false,
    enableGrouping: false,
    // onGlobalFilterChange: filter.setGlobalFilter,
    enableSelectAll: false,
    enableSubRowSelection: false,
    enableStickyFooter: true,
    // onGroupingChange: filter.setGroups,
    // onColumnFiltersChange: filter.setColumnsFilter,
    // onSortingChange: filter.setSorting,
    enableExpanding: true,
    enableRowActions: true,
    enableExpandAll: true,
    renderDetailPanel({ row: { original } }) {
      return (
        <Table align="center">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Phone Number</th>
              <th>Create Date</th>
              <th>Parent</th>
              <th>Email</th>
              <th>Country</th>
              <th>Address</th>
            </tr>
            <tr>
              <td>
                {original.first_name} {original.last_name}
              </td>
              <td>{original.phone_number}</td>
              <td>{original.create_date.toLocaleDateString()}</td>
              <td>
                ({original.id}){" "}
                {
                  props.parents.find((res) => res.id === original.parent_id)
                    ?.name
                }
              </td>

              <td> {original.email}</td>
              <td> {original.country}</td>
              <td> {original.address}</td>
            </tr>
          </thead>
        </Table>
      );
    },

    renderRowActionMenuItems({
      row: {
        original: { name, id },
      },
    }) {
      return [
        <Authorized permission="Update_Chart_Of_Account" key={1}>
          <Link href={pathName + "/form?id=" + id}>
            <MenuItem className="cursor-pointer" disabled={isPadding}>
              Edit
            </MenuItem>
          </Link>
        </Authorized>,
        <Authorized permission="View_Chart_Of_Account" key={2}>
          <MenuItem disabled={isPadding} className="cursor-pointer">
            <Link href={pathName + "/" + id}>View</Link>
          </MenuItem>
        </Authorized>,
        <Authorized permission="Delete_Chart_Of_Account" key={3}>
          <MenuItem
            disabled={isPadding}
            className="cursor-pointer"
            onClick={() => {
              const isConfirm = confirm(
                `Do You sure you want to delete ${name} id:${id} `
              );
              if (isConfirm) {
                setTransition(async () => {
                  // const result = await deleteChart(id);
                  // toast.OpenAlert(result);
                });
              }
            }}
          >
            {isPadding ? <> deleting...</> : "Delete"}
          </MenuItem>
        </Authorized>,
      ];
    },

    muiTableBodyCellProps: {
      align: "left",
    },

    // onExpandedChange: filter.setExpanded,
    enablePagination: true,
    // initialState: { showColumnFilters: filter.filterColumns?.length > 0 },

    filterFromLeafRows: true,
    // onPaginationChange: filter.setPagination,
    // onShowColumnFiltersChange: filter.setShowColumnFilters,
    state: {
      // pagination: filter.pagination,
      // expanded: filter.expanded,
      // grouping: filter.groups,
      // showColumnFilters: filter.showColumnFilters,

      showLoadingOverlay: isPadding,
      // sorting: filter.sorting,
      // globalFilter: filter.globalFilter,
      // columnFilters: filter.filterColumns,
    },
  });
  useEffect(() => {
    setTransition(() => {
      findChartOfAccounts(form.formState.defaultValues).then((res) => {
        setData(res.result);
      });
    });
  }, [form.formState.defaultValues]);

  const handleSubimt = useCallback((values: ChartOfAccountSearchSchema) => {
    setTransition(() => {
      findChartOfAccounts({
        from: values.from,
        to: values.to,
        id: values.id,
        include_reffrence: values.include_reffrence,
        type: values.type,
      }).then((res) => {
        setData(res.result);
      });
    });
  }, []);
  return (
    <Card>
      <Card className="mb-5">
        <CardContent>
          <Typography className="text-2xl capitalize">
            Total {props.node.replaceAll("_", " ")}s
          </Typography>
          <Typography className="text-end text-3xl">
            {FormatNumberWithFixed(data.length, 0)}
          </Typography>
        </CardContent>
      </Card>
      <form
        className=" p-5  gap-2 flex flex-col "
        onSubmit={form.handleSubmit(handleSubimt)}
      >
        <div className="flex-col md:flex-row flex justify-between items-center gap-5">
          <Button
            className="nexcite-btn sm:w-full md:w-fit"
            startDecorator={<AiFillFileExcel />}
            onClick={(e) => {
              setTransition(() => {
                exportToExcel({
                  to: form.getValues("to"),
                  from: form.getValues("from"),
                  sheet: "chart of account " + props.node,
                  id: "chart-of-account-table-" + props.node,
                });
              });
            }}
          >
            Export Excel
          </Button>
          <Button
            loading={isPadding}
            className="nexcite-btn sm:w-full md:w-fit"
            startDecorator={<MdSearch />}
            type="submit"
          >
            Search
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 gap-5">
          <Controller
            name="from"
            control={form.control}
            render={({ field, fieldState, formState }) => (
              <FormControl>
                <FormLabel>From</FormLabel>
                <Input
                  fullWidth
                  type="date"
                  onChange={(e) => {
                    const date = dayjs(e.target.valueAsDate)
                      .startOf("D")
                      .toDate();

                    filter.setFromDate(date);
                    field.onChange(date);
                  }}
                  value={dayjs(filter?.fromDate).format("YYYY-MM-DD")}
                />
              </FormControl>
            )}
          />
          <Controller
            name="to"
            control={form.control}
            render={({ field, fieldState, formState }) => (
              <FormControl>
                <FormLabel>To</FormLabel>
                <Input
                  fullWidth
                  type="date"
                  onChange={(e) => {
                    const date = dayjs(e.target.valueAsDate)
                      .endOf("D")
                      .toDate();

                    filter.setToDate(date);
                    field.onChange(date);
                  }}
                  value={dayjs(filter?.toDate).format("YYYY-MM-DD")}
                />
              </FormControl>
            )}
          />
        </div>
      </form>

      <MaterialReactTable table={table} />
    </Card>
  );
}
const columnGroupedDataHelper = createMRTColumnHelper<ChartOfAccounts>();

const useFilter = create<TableStateModel>()(
  persist(
    (set, get) => ({
      filterColumns: [],
      fromDate: dayjs().startOf("D").toDate(),
      toDate: dayjs().endOf("D").toDate(),
      showColumnFilters: false,
      groups: [],
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },

      expanded: {},
      globalFilter: "",
      setExpanded(newValue) {
        if (typeof newValue === "function") {
          get().expanded = (
            newValue as (prevValue: MRT_ExpandedState) => MRT_ExpandedState
          )(get().expanded);
        } else {
          get().expanded = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },

      setShowColumnFilters(newValue) {
        if (typeof newValue === "function") {
          get().showColumnFilters = (
            newValue as (prevValue: boolean) => boolean
          )(get().showColumnFilters);
        } else {
          get().showColumnFilters = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setGlobalFilter(newValue) {
        if (typeof newValue === "function") {
          get().globalFilter = (
            newValue as (
              prevValue: MRT_ColumnFiltersState
            ) => MRT_ColumnFiltersState
          )(get().globalFilter);
        } else {
          get().globalFilter = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setColumnsFilter(newValue) {
        if (typeof newValue === "function") {
          get().filterColumns = (
            newValue as (
              prevValue: MRT_ColumnFiltersState
            ) => MRT_ColumnFiltersState
          )(get().filterColumns);
        } else {
          get().filterColumns = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setGroups(newValue) {
        if (typeof newValue === "function") {
          get().groups = (
            newValue as (prevValue: MRT_GroupingState) => MRT_GroupingState
          )(get().groups);
        } else {
          get().groups = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setFromDate(newValue) {
        if (typeof newValue === "function") {
          get().fromDate = dayjs(
            (newValue as (prevValue: Date) => Date)(get().fromDate)
          )
            .endOf("D")
            .toDate();
        } else {
          get().fromDate = dayjs(newValue).endOf("D").toDate();
        }
        set({ fromDate: get().fromDate });
      },
      setToDate(newValue) {
        if (typeof newValue === "function") {
          get().toDate = dayjs(
            (newValue as (prevValue: Date) => Date)(get().toDate)
          )
            .endOf("D")
            .toDate();
        } else {
          get().toDate = dayjs(newValue).endOf("D").toDate();
        }
        set({ toDate: get().toDate });
      },
      sorting: [],
      setSorting(newValue) {
        if (typeof newValue === "function") {
          get().sorting = (
            newValue as (prevValue: MRT_SortingState) => MRT_SortingState
          )(get().sorting);
        } else {
          get().sorting = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setPagination(newValue) {
        if (typeof newValue === "function") {
          get().pagination = (
            newValue as (prevValue: MRT_PaginationState) => MRT_PaginationState
          )(get().pagination);
        } else {
          get().pagination = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
    }),
    {
      name: "chart-of-account-table-account",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
{
  /* <tbody>
{original.voucher_items
  .concat(original.reffrence_voucher_items)
  .map((res) => (
    <tr>
      <td>
        {/* <Link
          href={`/admin/accounting/journal_voucher/form?id=${res.voucher_id}`}
        > */
}
//   {res.voucher.id}
//   {/* </Link> */}
// </td>

//   <td>{res.voucher.title}</td>
//   <td>{res.voucher.description}</td>
//   <td>{res.voucher.to_date.toLocaleDateString()}</td>
//   <td>{res.debit_credit}</td>

//   <td>
//     {res.currency?.symbol ?? res.voucher.currency.symbol}
//     {FormatNumberWithFixed(res.amount, 2)}
//   </td>
//   <td>
//     {FormatNumberWithFixed(
//       res.currency?.rate ?? res.voucher.currency.rate,
//       2
//     )}
//   </td>
// </tr>
// ))}
// </tbody> */}
