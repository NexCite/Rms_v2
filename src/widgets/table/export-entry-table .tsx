"use client";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

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

import { DateRange } from "react-day-picker";
import DateRangePicker from "@rms/components/ui/date-range-pciker";

import useAlertHook from "@rms/hooks/alert-hooks";
import { Loader2 } from "lucide-react";
import moment from "moment";
import { usePDF } from "react-to-pdf";
import Image from "next/image";

export default function ExportEntryDataTable(props: Props) {
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
  const { replace } = useRouter();

  const pathName = usePathname();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setTransition(() => {
        replace(
          pathName +
            `?from_date=${selectDate.from?.getTime()}&to_date=${selectDate.to?.getTime()}&two_digit_id=${
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
          return moment(originalRow?.date).format("DD-MM-yyy hh:mm a");
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
          var amounts = originalRow?.subEntries
            ?.filter((res) => res.type === "Debit")
            .map((res) => res.amount);
          var amount = 0;
          amounts?.forEach((e) => (amount += e));
          return `${originalRow?.currency}${FormatNumberWithFixed(amount)}`;
        },
      },
      {
        accessorKey: "description",
        header: "SubEntry",
        cell(originalRow) {
          var s = [];
          originalRow?.row.original.subEntries
            ?.sort((a, b) => a.type.length - b.type.length)
            .forEach((e, i) =>
              s.push(
                <TableRow key={e.id + "" + i}>
                  <TableHead align="center">
                    {originalRow.row.original.currency}
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
    []
  );

  const { entries, totalCredit, totalDebit, currencies } = useMemo(() => {
    var totalDebit: Record<string, number> = {},
      totalCredit: Record<string, number> = {},
      currencies: { [k: string]: boolean } = {},
      entries: CommonEntryType[] = [];

    props.data.forEach((entry) => {
      const newEntry: CommonEntryType = {
        amount: 0,
        currency: entry.currency.symbol,
        date: entry.to_date,
        subEntries: [],

        title: entry.title,
        id: entry.id,
      };

      const { three_digit_id, account_id, two_digit_id, more_digit_id } =
        search;

      entry.sub_entries.forEach((subEntry) => {
        var amount = 0;
        if (account_id && !two_digit_id && !three_digit_id && !more_digit_id) {
          if (account_id === subEntry.account_entry_id) {
            amount = subEntry.amount;
          }
        }
        if (search.two_digit_id) {
          if (
            subEntry.two_digit_id === two_digit_id ||
            subEntry.three_digit?.two_digit_id === two_digit_id ||
            subEntry.more_than_four_digit?.three_digit?.two_digit_id ===
              two_digit_id ||
            subEntry.account_entry?.two_digit_id === two_digit_id ||
            subEntry.account_entry?.three_digit?.two_digit_id ===
              two_digit_id ||
            subEntry.account_entry?.more_than_four_digit?.three_digit
              ?.two_digit_id === two_digit_id ||
            subEntry.reference?.two_digit_id === two_digit_id ||
            subEntry.reference?.three_digit?.two_digit_id === two_digit_id ||
            subEntry.reference?.more_than_four_digit?.three_digit
              ?.two_digit_id === two_digit_id
          ) {
            amount = subEntry.amount;
          }
        } else if (three_digit_id) {
          if (
            subEntry.three_digit_id === three_digit_id ||
            subEntry.more_than_four_digit?.three_digit_id === three_digit_id ||
            subEntry.account_entry?.three_digit_id === three_digit_id ||
            subEntry.account_entry?.more_than_four_digit?.three_digit_id ===
              three_digit_id ||
            subEntry.reference?.three_digit_id === three_digit_id ||
            subEntry.reference?.more_than_four_digit?.three_digit_id ===
              three_digit_id
          ) {
            amount = subEntry.amount;
          }
        } else if (more_digit_id) {
          if (
            subEntry.more_than_four_digit_id === more_digit_id ||
            subEntry.account_entry?.more_than_four_digit_id === more_digit_id ||
            subEntry.reference?.more_than_four_digit_id === more_digit_id
          ) {
            amount = subEntry.amount;
          }
        }

        if (amount === 0) {
          if (subEntry.type === "Credit") {
            if (totalCredit[entry.currency.symbol]) {
              totalCredit[entry.currency.symbol] += subEntry.amount;
            } else {
              if (!currencies[entry.currency.symbol]) {
                currencies[entry.currency.symbol] = true;
              }
              totalCredit[entry.currency.symbol] = subEntry.amount;
            }
          } else if (totalDebit[entry.currency.symbol]) {
            totalDebit[entry.currency.symbol] += subEntry.amount;
          } else {
            if (!currencies[entry.currency.symbol]) {
              currencies[entry.currency.symbol] = true;
            }
            totalDebit[entry.currency.symbol] = subEntry.amount;
          }
        } else {
          newEntry.amount = amount;
        }

        if (
          (two_digit_id ?? 0) !== subEntry.two_digit_id &&
          (three_digit_id ?? 0) !== subEntry.three_digit_id &&
          (more_digit_id ?? 0) !== more_digit_id
        ) {
          if (
            account_id &&
            !two_digit_id &&
            !three_digit_id &&
            !more_digit_id
          ) {
            if (account_id === subEntry.account_entry_id) {
              return;
            } else {
              newEntry.subEntries.push(subEntry);

              return;
            }
          }
          newEntry.subEntries.push(subEntry);
        }
      });

      entries.push(newEntry);
    });

    return { entries, totalDebit, totalCredit, currencies };
  }, [props.data]);
  const table = useReactTable({
    data: entries,
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
      pagination: { pageSize: 999999, pageIndex: 0 },
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
  const titleRef = useRef<HTMLHeadingElement>();
  const { toPDF, targetRef } = usePDF();
  return (
    <Style className="w-full ">
      <div className="flex justify-between items-center">
        <h1>Result: {props.data.length}</h1>
        <Button
          className="bg-black"
          color="dark"
          onClick={() => {
            toPDF({
              filename: `${titleRef?.current?.textContent}.pdf`,
              method: "save",
              resolution: 3,
            });
          }}
        >
          Export
        </Button>
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
      <div className="rounded-md p-2" ref={targetRef}>
        <Table className="">
          <TableHeader className="static">
            <TableRow>
              <TableHead colSpan={5}>
                <div className="flex  items-center">
                  <Image
                    src={"/api/media/" + props.config.logo}
                    width={60}
                    height={60}
                    alt="logo"
                    style={{ borderRadius: "50%" }}
                  />
                  <h1 style={{ fontSize: 24, color: "black" }}>
                    {props.config.name}
                  </h1>
                </div>
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead colSpan={2}>
                To:{" "}
                {props.two_digit_id
                  ? `(${props.two_digit_id}) ${
                      props.two_digits.find(
                        (res) => res.id === search.two_digit_id
                      ).name
                    }`
                  : ""}
                {props.three_digit_id
                  ? `(${props.three_digit_id}) ${
                      props.three_digits.find(
                        (res) => res.id === search.three_digit_id
                      ).name
                    }`
                  : ""}
                {props.more_digit_id
                  ? `(${props.more_digit_id}) ${
                      props.more_digits.find(
                        (res) => res.id === search.more_digit_id
                      ).name
                    }`
                  : ""}
                {props.account_id
                  ? `(${props.account_id}) ${
                      props.accounts.find((res) => res.id === search.account_id)
                        .username
                    }`
                  : ""}
              </TableHead>
              <TableHead>
                Export Date: {moment().format("dddd DD-MM-yyy hh:mm a")}
              </TableHead>
              <TableHead>
                From: {moment(selectDate.from).format("dddd DD-MM-yyy hh:mm a")}
              </TableHead>
              <TableHead>
                To: {moment(selectDate.to).format("dddd DD-MM-yyy hh:mm a")}
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead colSpan={5} align="center">
                <div
                  ref={titleRef}
                  contentEditable
                  className="text-center text-3xl p-5"
                >
                  <span>Type title...</span>
                </div>
              </TableHead>
            </TableRow>

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
            <TableRow>
              <TableHead colSpan={4} align="center">
                Amount
              </TableHead>
              <TableHead>
                <Table>
                  <TableHeader>
                    <TableRow className="">
                      <TableHead
                        colSpan={2}
                        align="center"
                        className="w-full text-center"
                      >
                        Debit
                      </TableHead>
                    </TableRow>

                    {Object.keys(totalDebit).map((res) => (
                      <TableRow key={res}>
                        <TableHead>{res}</TableHead>
                        <TableHead key={res}>
                          {res}
                          {FormatNumberWithFixed(totalDebit[res])}
                        </TableHead>
                      </TableRow>
                    ))}
                  </TableHeader>
                </Table>
                <Table>
                  <TableHeader>
                    <TableRow className="">
                      <TableHead
                        colSpan={2}
                        align="center"
                        className="w-full text-center"
                      >
                        Credit
                      </TableHead>
                    </TableRow>

                    {Object.keys(totalCredit).map((res) => (
                      <TableRow key={res}>
                        <TableHead>{res}</TableHead>
                        <TableHead key={res}>
                          {res}
                          {FormatNumberWithFixed(totalCredit[res])}
                        </TableHead>
                      </TableRow>
                    ))}
                  </TableHeader>
                </Table>
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead colSpan={4}></TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
            {Object.keys(currencies).map((res) => (
              <TableRow key={res}>
                <TableHead colSpan={4}></TableHead>
                <TableHead colSpan={3} align="center">
                  {res}{" "}
                  {FormatNumberWithFixed(
                    (totalCredit[res] ?? 0) - (totalDebit[res] ?? 0)
                  )}
                </TableHead>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
    TableHead {
      color: black;
      font-size: 12pt;

      border: #00000013 solid 1px;
    }

    table {
      margin-top: 5px;
      thead {
        tr {
          TableHead {
          }
        }
      }
    }
  }
`;
type CommonEntryType = {
  title: string;

  id: number;
  amount: number;
  currency: string;
  date: Date;
  subEntries: Prisma.SubEntryGetPayload<{
    include: {
      account_entry: {
        include: {
          two_digit: true;
          three_digit: {
            include: { two_digit: true };
          };
          more_than_four_digit: {
            include: { three_digit: { include: { two_digit: true } } };
          };
        };
      };
      more_than_four_digit: {
        include: { three_digit: { include: { two_digit: true } } };
      };
      reference: {
        include: {
          two_digit: true;
          three_digit: {
            include: { two_digit: true };
          };
          more_than_four_digit: {
            include: { three_digit: { include: { two_digit: true } } };
          };
        };
      };
      three_digit: { include: { two_digit: true } };
      two_digit: true;
    };
  }>[];
};

type Props = {
  config: {
    logo: string;
    name: string;
  };
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
          account_entry: {
            include: {
              more_than_four_digit: {
                include: {
                  three_digit: { include: { two_digit: true } };
                };
              };

              three_digit: {
                include: {
                  two_digit: true;
                };
              };
              two_digit: true;
            };
          };
          reference: {
            include: {
              more_than_four_digit: {
                include: {
                  three_digit: { include: { two_digit: true } };
                };
              };

              three_digit: {
                include: {
                  two_digit: true;
                };
              };
              two_digit: true;
            };
          };
          more_than_four_digit: {
            include: {
              three_digit: { include: { two_digit: true } };
            };
          };

          three_digit: {
            include: {
              two_digit: true;
            };
          };
          two_digit: true;
        };
      };
    };
  }>[];
};
