"use client";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { $Enums, Prisma } from "@prisma/client";
import { FormatNumberWithFixed } from "@rms/lib/global";

import styled from "@emotion/styled";
import { usePathname, useRouter } from "next/navigation";

import { DateRange } from "react-day-picker";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Autocomplete,
  Card,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import moment from "moment";
import Image from "next/image";
import { usePDF } from "react-to-pdf";

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

  const { replace } = useRouter();

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
  const columns: MRT_ColumnDef<CommonEntryType>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",

        muiTableHeadCellProps: {
          align: "center",
        },
        enableGlobalFilter: false, // do not scan this column during global filtering

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "create_date",
        header: "Date",
        accessorFn(originalRow) {
          return moment(originalRow?.date).format("DD-MM-yyy hh:mm a");
        },
        muiTableHeadCellProps: {
          align: "center",
        },
        enableGlobalFilter: false, // do not scan this column during global filtering

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "title",
        header: "Title",
        muiTableHeadCellProps: {
          align: "center",
        },
        enableGlobalFilter: false, // do not scan this column during global filtering

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "amount" as any,
        header: "Amount",
        accessorFn(originalRow) {
          var debitAmout = 0;
          var creditAmount = 0;

          originalRow?.subEntries.map((res) => {
            if (res.type === "Debit") {
              debitAmout += res.amount;
            } else {
              creditAmount += res.amount;
            }
          });

          return `${originalRow?.currency}${FormatNumberWithFixed(
            debitAmout > creditAmount ? debitAmout : creditAmount
          )}`;
        },
        muiTableHeadCellProps: {
          align: "center",
        },
        enableGlobalFilter: false, // do not scan this column during global filtering

        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "description",
        header: "SubEntry",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        Cell(originalRow) {
          var s = [];
          originalRow?.row.original.subEntries
            ?.sort((a, b) => a.type.length - b.type.length)
            .forEach((e, i) =>
              s.push(
                <tr key={e.id + "" + i}>
                  <td align="center">
                    {originalRow.row.original.currency}
                    {FormatNumberWithFixed(e.amount)}
                  </td>

                  {e.type === "Debit" && (
                    <td align="center">
                      {e.reference_id ? (
                        <table className=" min-w-max table-auto text-left">
                          <tbody>
                            <tr>
                              <td>
                                Reference To: ({e.reference_id}){" "}
                                {e.reference?.username ?? ""}
                              </td>

                              <td colSpan={2}>
                                ({e?.two_digit_id ?? ""}
                                {e?.three_digit_id ?? ""}
                                {e?.more_than_four_digit_id ?? ""}
                                {e?.account_entry_id ?? ""}){" "}
                                {e.two_digit?.name ?? ""}
                                {e.three_digit?.name ?? ""}
                                {e.more_than_four_digit?.name ?? ""}
                                {e.account_entry?.username ?? ""}
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
                    </td>
                  )}
                  <td className=""></td>
                  {e.type === "Credit" && (
                    <td align="center">
                      {e.reference_id ? (
                        <table className=" min-w-max table-auto text-left">
                          <tbody>
                            <tr>
                              <td>
                                Reference To: ({e.reference_id}){" "}
                                {e.reference?.username ?? ""}
                              </td>

                              <td colSpan={2}>
                                ({e?.two_digit_id ?? ""}
                                {e?.three_digit_id ?? ""}
                                {e?.more_than_four_digit_id ?? ""}
                                {e?.account_entry_id ?? ""}){" "}
                                {e.two_digit?.name ?? ""}
                                {e.three_digit?.name ?? ""}
                                {e.more_than_four_digit?.name ?? ""}
                                {e.account_entry?.username ?? ""}
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
                    </td>
                  )}
                </tr>
              )
            );

          return (
            <table className=" min-w-max table-auto text-left w-full">
              <thead>
                <tr>
                  <th align="center">
                    <Typography>Amount</Typography>
                  </th>
                  <th align="center">
                    {" "}
                    <Typography>Credit</Typography>
                  </th>
                  <th align="center">
                    <Typography>Debit</Typography>
                  </th>
                </tr>
              </thead>
              <tbody>{s}</tbody>
            </table>
          );
        },
      },
    ],
    []
  );

  const defaultValue = useMemo(() => {
    const account = props.accounts.find((res) => res.id === props.account_id);
    const two_digit = props.two_digits.find(
      (res) => res.id === props.two_digit_id
    );
    const three_digit = props.three_digits.find(
      (res) => res.id === props.three_digit_id
    );
    const more_digit = props.more_digits.find(
      (res) => res.id === props.more_digit_id
    );

    return {
      account,
      two_digit,
      three_digit,
      more_digit,
    };
  }, [props]);

  const { entries, totalCredit, totalDebit } = useMemo(() => {
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
            if (totalDebit[entry.currency.symbol]) {
              totalDebit[entry.currency.symbol] += subEntry.amount;
            } else {
              if (!currencies[entry.currency.symbol]) {
                currencies[entry.currency.symbol] = true;
              }
              totalDebit[entry.currency.symbol] = subEntry.amount;
            }
          } else if (totalCredit[entry.currency.symbol]) {
            totalCredit[entry.currency.symbol] += subEntry.amount;
          } else {
            if (!currencies[entry.currency.symbol]) {
              currencies[entry.currency.symbol] = true;
            }
            totalCredit[entry.currency.symbol] = subEntry.amount;
          }
        } else {
          newEntry.amount = amount;
        }

        if (two_digit_id === subEntry.two_digit_id) {
          return;
        }
        if (three_digit_id === subEntry.three_digit_id) {
          return;
        }
        if (more_digit_id === subEntry.more_than_four_digit_id) {
          return;
        }

        if (account_id && !two_digit_id && !three_digit_id && !more_digit_id) {
          if (account_id === subEntry.account_entry_id) {
            return;
          } else {
            newEntry.subEntries.push(subEntry);

            return;
          }
        }
        newEntry.subEntries.push(subEntry);
      });

      entries.push(newEntry);
    });

    return { entries, totalDebit, totalCredit, currencies };
  }, [props.data]);

  const titleRef = useRef<HTMLHeadingElement>();
  const { toPDF, targetRef } = usePDF();
  return (
    <Style>
      <Card>
        <form
          className=" grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4  h-full  overflow-auto  justify-between rms-container p-5"
          onSubmit={handleSubmit}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              maxDate={dayjs(selectDate.to)}
              slotProps={{ textField: { size: "small" } }}
              label="From Date"
              defaultValue={dayjs(selectDate.from)}
              onChange={(e) => {
                setSelectDate((prev) => ({ ...prev, from: e?.toDate() }));
              }}
            />
            <DatePicker
              minDate={dayjs(selectDate.from)}
              slotProps={{ textField: { size: "small" } }}
              label="To Date"
              defaultValue={dayjs(selectDate.to)}
              onChange={(e) => {
                setSelectDate((prev) => ({ ...prev, from: e?.toDate() }));
              }}
            />
          </LocalizationProvider>
          <Autocomplete
            disablePortal
            size="small"
            disabled={
              search.three_digit_id !== undefined ||
              search.more_digit_id !== undefined ||
              search.id !== undefined
            }
            defaultValue={
              defaultValue.two_digit
                ? {
                    label: `(${defaultValue.two_digit.id}) ${defaultValue.two_digit.name}`,
                    value: defaultValue.two_digit.id,
                  }
                : undefined
            }
            isOptionEqualToValue={(e) => e.value === defaultValue.two_digit?.id}
            onChange={(e, f) => {
              setSearch((prev) => ({
                ...prev,
                more_digit_id: undefined,
                three_digit_id: undefined,
                two_digit_id: f?.value,
              }));
            }}
            options={props.two_digits.map((res) => ({
              label: `(${res.id}) ${res.name}`,
              value: res.id,
            }))}
            renderInput={(params) => (
              <TextField {...params} label="Two Digits" />
            )}
          />
          <Autocomplete
            disablePortal
            size="small"
            disabled={
              search.more_digit_id !== undefined ||
              search.two_digit_id !== undefined ||
              search.id !== undefined
            }
            isOptionEqualToValue={(e) =>
              e.value === defaultValue.three_digit?.id
            }
            defaultValue={
              defaultValue.three_digit
                ? {
                    label: `(${defaultValue.three_digit.id}) ${defaultValue.three_digit.name}`,
                    value: defaultValue.three_digit.id,
                  }
                : undefined
            }
            onChange={(e, f) => {
              setSearch((prev) => ({
                ...prev,
                more_digit_id: undefined,
                three_digit_id: f?.value,
                two_digit_id: undefined,
              }));
            }}
            options={props.three_digits.map((res) => ({
              label: `(${res.id}) ${res.name}`,
              value: res.id,
            }))}
            renderInput={(params) => (
              <TextField {...params} label="Three Digits" />
            )}
          />

          <Autocomplete
            disablePortal
            disabled={
              search.three_digit_id !== undefined ||
              search.two_digit_id !== undefined ||
              search.id !== undefined
            }
            size="small"
            isOptionEqualToValue={(e) =>
              e.value === defaultValue.more_digit?.id
            }
            defaultValue={
              defaultValue.more_digit
                ? {
                    label: `(${defaultValue.more_digit.id}) ${defaultValue.more_digit.name}`,
                    value: defaultValue.more_digit.id,
                  }
                : undefined
            }
            onChange={(e, f) => {
              setSearch((prev) => ({
                ...prev,
                more_digit_id: f?.value,
                three_digit_id: undefined,
                two_digit_id: undefined,
              }));
            }}
            options={props.more_digits.map((res) => ({
              label: `(${res.id}) ${res.name}`,
              value: res.id,
            }))}
            renderInput={(params) => (
              <TextField {...params} label="More Four Digits" />
            )}
          />
          <Autocomplete
            disablePortal
            disabled={search.id !== undefined}
            size="small"
            isOptionEqualToValue={(e) => e.value === defaultValue.account?.id}
            defaultValue={
              defaultValue.account
                ? {
                    label: `${defaultValue.account.id} ${defaultValue.account.username}`,
                    value: defaultValue.account.id,
                    group: defaultValue.account.type,
                  }
                : undefined
            }
            onChange={(e, f) => {
              setSearch((prev) => ({
                ...prev,
                account_id: f?.value,
              }));
            }}
            groupBy={(option) => option.group}
            options={props.accounts.map((res) => ({
              label: `(${res.id}) ${res.username} `,
              value: res.id,
              group: res.type,
            }))}
            renderInput={(params) => <TextField {...params} label="Accounts" />}
          />

          <LoadingButton
            variant="contained"
            className="hover:bg-blue-gray-900  hover:text-brown-50 capitalize bg-black text-white"
            disableElevation
            loadingIndicator="Loading…"
            loading={isPadding}
            type="submit"
          >
            Search
          </LoadingButton>
          <LoadingButton
            variant="contained"
            className="hover:bg-blue-gray-900  hover:text-brown-50 capitalize bg-black text-white"
            disableElevation
            loadingIndicator="Loading…"
            loading={isPadding}
            type="button"
            onClick={(e) => {
              setTransition(() => {
                toPDF({ filename: titleRef.current.innerText });
              });
            }}
          >
            Export
          </LoadingButton>
        </form>
        <div ref={targetRef}>
          <MaterialReactTable
            columns={columns}
            data={entries}
            enablePagination={false}
            enableFilters={false}
            enableDensityToggle={false}
            enableExpandAll={false}
            enableFullScreenToggle={false}
            enableExpanding={false}
            enableHiding={false}
            enableSorting={false}
            enableColumnActions={false}
            enableTableFooter={false}
            enableStickyFooter={false}
            muiTableContainerProps={{ sx: { margin: 0 } }}
            renderTopToolbar={() => (
              <>
                <div className="flex  items-center gap-4 p-5">
                  <Image
                    src={"/api/media/" + props.config.logo}
                    width={60}
                    height={60}
                    alt="logo"
                    style={{ borderRadius: "50%" }}
                  />
                  <Typography className="text-4xl">
                    {props.config.name}
                  </Typography>
                </div>
                <Divider />
                <div className="flex gap-5 justify-between p-5 mb-5">
                  <div>
                    <Typography>
                      To:{" "}
                      {props.two_digit_id
                        ? `${
                            props.two_digits.find(
                              (res) => res.id === props.two_digit_id
                            )?.name ?? ""
                          }`
                        : ""}
                      {props.three_digit_id
                        ? ` ${
                            props.three_digits.find(
                              (res) => res.id === props.three_digit_id
                            )?.name ?? ""
                          }`
                        : ""}
                      {props.more_digit_id
                        ? ` ${
                            props.more_digits.find(
                              (res) => res.id === props.more_digit_id
                            )?.name ?? ""
                          }`
                        : ""}
                      {props.account_id
                        ? `(${props.account_id}) ${
                            props.accounts.find(
                              (res) => res.id === props.account_id
                            )?.username ?? ""
                          }`
                        : ""}
                    </Typography>
                  </div>
                  <div>
                    <Typography>
                      Export Date: {moment().format("dddd DD-MM-yyy hh:mm a")}
                    </Typography>
                  </div>
                  <div>
                    <Typography>
                      From:{" "}
                      {moment(props.date[0]).format("dddd DD-MM-yyy hh:mm a")}
                    </Typography>
                  </div>
                  <div>
                    <Typography>
                      To:{" "}
                      {moment(props.date[1]).format("dddd DD-MM-yyy hh:mm a")}
                    </Typography>
                  </div>
                </div>
                <Divider />
                <div>
                  <div>
                    <div
                      ref={titleRef}
                      suppressContentEditableWarning={true}
                      contentEditable
                      className="text-center text-3xl p-5 mb-5"
                    >
                      <span>Type title...</span>
                    </div>
                  </div>
                  <Divider />
                </div>
              </>
            )}
            renderBottomToolbar={(e) => {
              return (
                <>
                  <MaterialReactTable
                    muiTableContainerProps={{ sx: { margin: 0 } }}
                    enablePagination={false}
                    enableFilters={false}
                    enableDensityToggle={false}
                    renderTopToolbar={<></>}
                    enableExpandAll={false}
                    enableFullScreenToggle={false}
                    enableExpanding={false}
                    enableHiding={false}
                    enableSorting={false}
                    enableColumnActions={false}
                    columns={[
                      {
                        header: "Currncy",
                        accessorKey: "currncy",
                        muiTableHeadCellProps: {
                          align: "center",
                        },

                        muiTableBodyCellProps: {
                          align: "center",
                        },
                      },
                      {
                        header: "Debit",
                        accessorKey: "debit",
                        muiTableHeadCellProps: {
                          align: "center",
                        },

                        muiTableBodyCellProps: {
                          align: "center",
                        },
                      },
                      {
                        header: "Credit",
                        accessorKey: "credit",
                        muiTableHeadCellProps: {
                          align: "center",
                        },

                        muiTableBodyCellProps: {
                          align: "center",
                        },
                      },
                      {
                        header: "Total",
                        accessorKey: "total",
                        muiTableHeadCellProps: {
                          align: "center",
                        },

                        muiTableBodyCellProps: {
                          align: "center",
                        },
                      },
                    ]}
                    data={props.currencies.map((res) => ({
                      currncy: res.symbol,
                      debit: FormatNumberWithFixed(totalDebit[res.symbol] ?? 0),
                      credit: FormatNumberWithFixed(
                        totalCredit[res.symbol] ?? 0
                      ),
                      total: FormatNumberWithFixed(
                        Math.abs(
                          (totalDebit[res.symbol] ?? 0) -
                            (totalCredit[res.symbol] ?? 0)
                        )
                      ),
                    }))}
                  />
                </>
              );
            }}
          />
        </div>
      </Card>
    </Style>
  );
}
const Style = styled.div``;
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
  type?: $Enums.DigitType;
  currencies: Prisma.CurrencyGetPayload<{}>[];
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
