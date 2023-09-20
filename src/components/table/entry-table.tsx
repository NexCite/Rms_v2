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
import { CalendarIcon, ChevronDown, Loader2 } from "lucide-react";

import { Button } from "@rms/components/ui/button";
import { Checkbox } from "@rms/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rms/components/ui/dropdown-menu";
import { Input } from "@rms/components/ui/input";
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

import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import styled from "styled-components";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@rms/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@rms/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@rms/components/ui/popover";
import SearchSelect from "../search-select";

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
  const [open, setOpen] = React.useState({
    two: false,
    there: false,
    more: false,
    user: false,
  });

  const [isPadding, setTransition] = useTransition();

  const [search, setSearch] = useState({
    two_digit_id: props.two_digit_id,
    three_digit_id: props.three_digit_id, //customize the default page size
    more_digit_id: props.more_digit_id,
    account_id: props.account_id,
    type: props.type,
    debit: props.debit,
    id: props.id,
  });
  const [selectDate, setSelectDate] = useState<{
    from?: Date;
    to?: Date;
  }>({
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
  const { replace } = useRouter();

  const pathName = usePathname();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setTransition(() => {
        replace(
          pathName +
            `?from_date=${selectDate.from.getTime()}&to_date=${selectDate.to.getTime()}&two_digit_id=${
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
    [search, selectDate]
  );
  const columns: ColumnDef<CommonEntryType>[] = useMemo(
    () => [
      {
        accessorKey: "id", //simple recommended way to define a column
        header: "ID",
      },
      {
        accessorKey: "create_date", //simple recommended way to define a column
        header: "Date",
        accessorFn(originalRow) {
          return originalRow?.create_date?.toLocaleDateString();
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
                          <TableHeader>
                            <TableRow>
                              <TableHead> Reference To</TableHead>
                              <TableHead>
                                {e.reference?.username ?? ""}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableHead colSpan={2}>
                                ({e?.two_digit_id ?? ""}
                                {e?.three_digit_id ?? ""}
                                {e?.more_than_four_digit_id ?? ""}
                                {e?.account_entry_id ?? ""}){" "}
                                {e.two_digit?.name ?? ""}
                                {e.three_digit?.name ?? ""}
                                {e.more_than_four_digit?.name ?? ""}
                                {e.account_entry?.username ?? ""}
                              </TableHead>
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
                          <TableHeader>
                            <TableRow>
                              <TableHead align="center">Reference To</TableHead>
                              <TableHead align="center">
                                {e.reference?.username ?? ""}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell colSpan={2} align="center">
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
    []
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
      <h1>Result: {props.data.length}</h1>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 mb-5"
        onSubmit={handleSubmit}
      >
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal ",
                !selectDate.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectDate.from ? (
                format(selectDate.from, "PPP")
              ) : (
                <span>From Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white">
            <Calendar
              mode="single"
              selected={selectDate.from}
              onSelect={(e) => setSelectDate((prev) => ({ ...prev, from: e }))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !selectDate.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectDate.to ? (
                format(selectDate.to, "PPP")
              ) : (
                <span>To Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white">
            <Calendar
              mode="single"
              selected={selectDate.to}
              onSelect={(e) => setSelectDate((prev) => ({ ...prev, to: e }))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
        <Button type="submit" disabled={isPadding}>
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
      <div className="rounded-md border">
        <Table>
          <TableHeader className="static">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
        <div className="flex-1 text-sm text-muted-foreground">
          {props.data.length}
        </div>
        <div className="space-x-2">
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
      </div>
    </Style>
  );
}
const Style = styled.div`
  table {
    > tr {
      box-shadow: rgb(24 22 22 / 26%) 1px 1px 1px;
    }
    table {
      margin-top: 5px;
      box-shadow: rgb(8 8 8 / 15%) 1px 1px 1px;
      thead {
        box-shadow: rgb(8 8 8 / 15%) 1px 1px 1px 1px;

        tr {
          box-shadow: rgb(8 8 8 / 15%) 1px 1px 1px;

          th {
            box-shadow: rgb(8 8 8 / 15%) 1px 1px 1px;
          }
          td {
            box-shadow: rgb(8 8 8 / 15%) 1px 1px 1px;
          }
        }
      }
      tbody {
        box-shadow: rgb(8 8 8 / 15%) 1px 1px 1px;
        tr {
          box-shadow: rgb(8 8 8 / 15%) 1px 1px 1px;
          td {
            box-shadow: rgb(8 8 8 / 15%) 1px 1px 1px;
          }
          th {
            box-shadow: rgb(8 8 8 / 15%) 1px 1px 1px;
          }
        }
      }
    }
  }
`;
