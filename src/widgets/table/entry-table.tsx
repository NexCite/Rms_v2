"use client";
import React, { useCallback, useMemo, useState, useTransition } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import { Button } from "@rms/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@rms/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@rms/components/ui/table";
import { $Enums, Prisma } from "@prisma/client";
import { FormatNumberWithFixed } from "@rms/lib/global";

import { usePathname, useRouter } from "next/navigation";
import styled from "styled-components";

import SearchSelect from "../../components/ui/search-select";
import Link from "next/link";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@rms/components/ui/date-range-pciker";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@rms/components/ui/dropdown-menu";
import { deleteEntry } from "@rms/service/entry-service";
import useAlertHook from "@rms/hooks/alert-hooks";
import { Loader2 } from "lucide-react";
import moment from "moment";
import Authorized from "@rms/components/ui/authorized";

type CommonEntryType = Prisma.EntryGetPayload<{
  include: {
    currency: true;

    sub_entries: {
      include: {
        account_entry: true;
        more_than_four_digit: true;
        reference: true;
        three_digit: true;
        two_digit: true;
      };
    };
  };
}>;
type Props = {
  date?: [Date, Date];
  id?: number;
  two_digit_id?: number;
  three_digit_id?: number;
  more_digit_id?: number;
  account_id?: number;
  two_digits?: Prisma.Two_DigitGetPayload<{}>[];
  three_digits?: Prisma.Three_DigitGetPayload<{
    include: { two_digit: true };
  }>[];
  more_digits?: Prisma.More_Than_Four_DigitGetPayload<{
    include: { three_digit: true };
  }>[];
  accounts?: Prisma.Account_EntryGetPayload<{}>[];
  debit?: $Enums.EntryType;
  type?: $Enums.DidgitType;

  data: Prisma.EntryGetPayload<{
    include: {
      currency: true;

      sub_entries: {
        include: {
          account_entry: true;
          more_than_four_digit: true;
          reference: true;
          three_digit: true;
          two_digit: true;
        };
      };
    };
  }>[];
};

export default function EntryDataTable(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const [isActive, setActiveTransition] = useTransition();

  const [search, setSearch] = useState({
    two_digit_id: props.two_digit_id,
    three_digit_id: props.three_digit_id, //customize the default page size
    more_digit_id: props.more_digit_id,
    account_id: props.account_id,
    type: props.type,
    debit: props.debit,
    id: props.id,
  });
  const [selectDate, setSelectDate] = useState<DateRange>({
    from: props.date[0],
    to: props.date[1],
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const { replace, push } = useRouter();
  const { createAlert } = useAlertHook();

  const pathName = usePathname();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setTransition(() => {
        replace(
          pathName +
            `?from_date=${selectDate?.from?.getTime()}&to_date=${selectDate?.to?.getTime()}&two_digit_id=${
              search.two_digit_id
            }&more_digit_id=${search.more_digit_id}&three_digit_id=${
              search.three_digit_id
            }&account_id=${search.account_id}&type=${search.type}&id=${
              search.id
            }&debit=${search.debit}`,
          {}
        );
      });
    },
    [search, selectDate, pathName, replace]
  );
  const columns: ColumnDef<CommonEntryType>[] = useMemo(
    () => [
      {
        accessorKey: "action",
        cell(originalRow) {
          const { id, title } = originalRow.row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <DotsHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Authorized permission="Edit_Entry">
                    <DropdownMenuItem
                      onClick={() => push(pathName + "/form?id=" + id)}
                      className="cursor-pointer"
                      disabled={isActive}
                    >
                      Edit
                    </DropdownMenuItem>
                  </Authorized>
                  <Authorized permission="View_Entry">
                    <DropdownMenuItem
                      onClick={() => push(pathName + "/" + id)}
                      className="cursor-pointer"
                      disabled={isActive}
                    >
                      View
                    </DropdownMenuItem>
                  </Authorized>
                  <Authorized permission="Delete_Entry">
                    <DropdownMenuItem
                      disabled={isActive}
                      className="cursor-pointer"
                      onClick={() => {
                        const isConfirm = confirm(
                          `Do You sure you want to delete ${title} id:${id} `
                        );
                        if (isConfirm) {
                          setActiveTransition(async () => {
                            const result = await deleteEntry(id);

                            createAlert(result);
                          });
                        }
                      }}
                    >
                      {isActive ? <> deleting...</> : "Delete"}
                    </DropdownMenuItem>
                  </Authorized>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
      },

      {
        accessorKey: "id", //simple recommended way to define a column
        header: "ID",
        cell: ({ row: { original } }) => (
          <div
            className={`text-center rounded-sm ${
              original.status === "Deleted"
                ? "bg-red-500"
                : original.create_date.toLocaleTimeString() !==
                  original.modified_date.toLocaleTimeString()
                ? "bg-yellow-400"
                : ""
            }`}
          >
            {original.id}
          </div>
        ),
      },
      {
        accessorKey: "create_date", //simple recommended way to define a column
        header: "Date",
        accessorFn(originalRow) {
          return moment(originalRow?.create_date).format("DD-MM-yyy hh:mm a");
        },
      },
      {
        accessorKey: "title", //simple recommended way to define a column
        header: "Title",
      },
      {
        accessorKey: "amount" as any, //simple recommended way to define a column
        header: "Amount",
        accessorFn(originalRow) {
          var amounts = originalRow?.sub_entries
            ?.filter((res) => res.type === "Debit")
            .map((res) => res.amount);
          var amount = 0;
          amounts?.forEach((e) => (amount += e));
          return `${originalRow?.currency?.symbol}${FormatNumberWithFixed(
            amount
          )}`;
        },
      },
      {
        accessorKey: "description",
        header: "SubEntry",
        cell(originalRow) {
          var s = [];
          originalRow?.row.original?.sub_entries
            ?.sort((a, b) => a.type.length - b.type.length)
            .forEach((e, i) =>
              s.push(
                <TableRow key={e.id + "" + i}>
                  <TableHead align="center">
                    {originalRow.row.original.currency.symbol}
                    {FormatNumberWithFixed(e.amount)}
                  </TableHead>

                  {e.type === "Debit" && (
                    <TableHead align="center">
                      {e.reference_id ? (
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell>
                                Reference To: ({e.reference_id}){" "}
                                {e.reference?.username ?? ""}
                              </TableCell>

                              <TableCell colSpan={2}>
                                ({e?.two_digit_id ?? ""}
                                {e?.three_digit_id ?? ""}
                                {e?.more_than_four_digit_id ?? ""}
                                {e?.account_entry_id ?? ""}){" "}
                                {e.two_digit?.name ?? ""}
                                {e.three_digit?.name ?? ""}
                                {e.more_than_four_digit?.name ?? ""}
                                {e.account_entry?.username ?? ""}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      ) : (
                        <>
                          ({e?.two_digit_id ?? ""}
                          {e?.three_digit_id ?? ""}
                          {e?.more_than_four_digit_id ?? ""}
                          {e?.account_entry_id ?? ""}) {e.two_digit?.name ?? ""}
                          {e.three_digit?.name ?? ""}
                          {e.more_than_four_digit?.name ?? ""}
                          {e.account_entry?.username ?? ""}
                        </>
                      )}
                    </TableHead>
                  )}
                  <TableHead></TableHead>
                  {e.type === "Credit" && (
                    <TableHead align="center">
                      {e.reference_id ? (
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell>
                                Reference To: ({e.reference_id}){" "}
                                {e.reference?.username ?? ""}
                              </TableCell>

                              <TableCell colSpan={2}>
                                ({e?.two_digit_id ?? ""}
                                {e?.three_digit_id ?? ""}
                                {e?.more_than_four_digit_id ?? ""}
                                {e?.account_entry_id ?? ""}){" "}
                                {e.two_digit?.name ?? ""}
                                {e.three_digit?.name ?? ""}
                                {e.more_than_four_digit?.name ?? ""}
                                {e.account_entry?.username ?? ""}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      ) : (
                        <>
                          ({e?.two_digit_id ?? ""}
                          {e?.three_digit_id ?? ""}
                          {e?.more_than_four_digit_id ?? ""}
                          {e?.account_entry_id ?? ""}) {e.two_digit?.name ?? ""}
                          {e.three_digit?.name ?? ""}
                          {e.more_than_four_digit?.name ?? ""}
                          {e.account_entry?.username ?? ""}
                        </>
                      )}
                    </TableHead>
                  )}
                </TableRow>
              )
            );

          return (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead align="center">Amount</TableHead>
                  <TableHead align="center">Debit</TableHead>
                  <TableHead align="center">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{s}</TableBody>
            </Table>
          );
        },
      },
    ],
    [createAlert, isActive, pathName, push]
  );

  const table = useReactTable({
    data: props.data,
    columns: columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,

      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <Style className="w-full ">
      <div className="flex justify-between items-center">
        <h1>Result: {props.data.length}</h1>
      </div>
      <form
        className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-4 mb-5"
        onSubmit={handleSubmit}
      >
        <SearchSelect
          data={props.data.map((res) => ({ id: res.id, name: res.title }))}
          hit="id"
          label="Ids"
          onChange={(e) => {
            setSearch((prev) => ({
              ...prev,
              id: e,
            }));
          }}
          default={search.id}
        />

        <DateRangePicker
          onChange={setSelectDate}
          default={{ from: props.date[0], to: props.date[1] }}
        />

        <SearchSelect
          data={props.two_digits}
          hit="two digit"
          label="Two Digits"
          onChange={(e) => {
            setSearch((prev) => ({
              ...prev,
              more_digit_id: undefined,
              three_digit_id: undefined,
              two_digit_id: e,
            }));
          }}
          default={search.two_digit_id}
        />
        <SearchSelect
          data={props.three_digits}
          hit="there digit"
          label="There Digits"
          onChange={(e) => {
            setSearch((prev) => ({
              ...prev,
              more_digit_id: undefined,
              three_digit_id: e,
              two_digit_id: undefined,
            }));
          }}
          default={search.three_digit_id}
        />
        <SearchSelect
          data={props.more_digits}
          hit="more digit"
          label="More Digits"
          onChange={(e) => {
            setSearch((prev) => ({
              ...prev,
              more_digit_id: undefined,
              three_digit_id: undefined,
              two_digit_id: e,
            }));
          }}
          default={search.more_digit_id}
        />
        <SearchSelect
          data={props.accounts}
          hit="account"
          label="Accounts"
          onChange={(e) => {
            setSearch((prev) => ({
              ...prev,
              account_id: e,
            }));
          }}
          default={search.account_id}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="w-full">
            <Button
              variant="outline"
              className="ml-auto w-full flex justify-between items-center"
            >
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-full">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button className="sm:w-full" type="submit" disabled={isPadding}>
          {isPadding ? (
            <>
              {" "}
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              loading...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </form>
      <div className="w-full min-w-max table-auto text-left">
        <Table>
          <TableHeader className="">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <h5>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}{" "}
          page(s).
        </h5>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </Style>
  );
}
const Style = styled.div`
  table {
    tbody,
    thead,
    tr,
    td,
    th {
      color: black;
      font-size: 12pt;

      border: #00000013 solid 1px;
    }

    table {
      margin-top: 5px;
      thead {
        tr {
          th {
          }
        }
      }
    }
  }
`;
