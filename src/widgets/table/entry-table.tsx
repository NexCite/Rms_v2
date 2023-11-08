"use client";
import React, { useCallback, useMemo, useState, useTransition } from "react";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import { $Enums, Prisma } from "@prisma/client";
import { FormatNumberWithFixed } from "@rms/lib/global";

import styled from "@emotion/styled";
import { usePathname, useRouter } from "next/navigation";

import { DateRange } from "react-day-picker";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Autocomplete,
  Card,
  CardContent,
  MenuItem,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import { deleteEntry } from "@rms/service/entry-service";
import dayjs from "dayjs";
import moment from "moment";
import Link from "next/link";

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
  type?: $Enums.DigitType;

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
  const [isPadding, setIsPadding] = useTransition();
  const [isActive, setActive] = useTransition();

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
  const store = useStore();

  const pathName = usePathname();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsPadding(() => {
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
  const columns: MRT_ColumnDef<CommonEntryType>[] = useMemo(
    () => [
      {
        accessorKey: "id",

        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "ID",
        Cell: ({ row: { original } }) => (
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
        accessorKey: "create_date",

        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },

        header: "Date",
        accessorFn(originalRow) {
          return moment(originalRow?.create_date).format("DD-MM-yyy hh:mm a");
        },
      },
      {
        accessorKey: "title",

        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "Title",
      },
      {
        accessorKey: "amount" as any,

        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },

        header: "Amount",
        Cell(originalRow) {
          var amounts = originalRow.row.original?.sub_entries
            ?.filter((res) => res.type === "Debit")
            .map((res) => res.amount);
          var amount = 0;
          amounts?.forEach((e) => (amount += e));
          return originalRow.row.original.rate ? (
            <table>
              <thead>
                <tr>
                  <th>Rate</th>
                  <th>Rate Amount</th>
                  <th> Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {FormatNumberWithFixed(originalRow.row.original.rate)}
                  </td>
                  <td>
                    $
                    {FormatNumberWithFixed(
                      amount / originalRow.row.original.rate
                    )}
                  </td>
                  <td>
                    {" "}
                    {originalRow.row.original.currency.symbol}
                    {FormatNumberWithFixed(amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            `${
              originalRow.row.original?.currency?.symbol
            }${FormatNumberWithFixed(amount)}`
          );
        },
      },
      {
        accessorKey: "description",

        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "SubEntry",
        size: 500, //large column

        Cell(originalRow) {
          var s = [];
          originalRow?.row.original?.sub_entries
            ?.sort((a, b) => a.type.length - b.type.length)
            .forEach((e, i) =>
              s.push(
                <tr key={i}>
                  <td align="center">
                    {originalRow.row.original.currency.symbol}
                    {FormatNumberWithFixed(e.amount)}
                  </td>

                  {e.type === "Debit" && (
                    <td align="center">
                      {e.reference_id ? (
                        <table className=" min-w-max table-auto text-center">
                          <tbody>
                            <tr>
                              <td>
                                Reference To: ({e.reference_id}){" "}
                                {e.reference?.first_name}{" "}
                                {e.reference?.last_name}
                              </td>

                              <td colSpan={2}>
                                ({e?.two_digit_id ?? ""}
                                {e?.three_digit_id ?? ""}
                                {e?.more_than_four_digit_id ?? ""}
                                {e?.account_entry_id ?? ""}){" "}
                                {e.two_digit?.name ?? ""}
                                {e.three_digit?.name ?? ""}
                                {e.more_than_four_digit?.name ?? ""}
                                {e.account_entry?.first_name}{" "}
                                {e.reference?.last_name}
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
                          {e.account_entry?.first_name} {e.reference?.last_name}
                        </>
                      )}
                    </td>
                  )}
                  <td className=""></td>
                  {e.type === "Credit" && (
                    <td align="center">
                      {e.reference_id ? (
                        <table className=" min-w-max table-auto text-center">
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
                                {e.account_entry?.first_name}{" "}
                                {e.reference?.last_name}
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
                          {e.account_entry?.first_name} {e.reference?.last_name}
                        </>
                      )}
                    </td>
                  )}
                </tr>
              )
            );

          return (
            <table className=" min-w-max table-auto text-center w-full">
              <thead>
                <tr>
                  <td align="center">Amount</td>
                  <td align="center">Debit</td>
                  <td align="center">Credit</td>
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

  return (
    <Style className=" ">
      <Card>
        <CardContent className="mb-0">
          <form
            className=" grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4  h-full  overflow-auto  justify-between rms-container p-5"
            onSubmit={handleSubmit}
          >
            <TextField
              label="Id"
              disabled={
                search.three_digit_id !== undefined ||
                search.more_digit_id !== undefined ||
                search.two_digit_id !== undefined ||
                search.account_id !== undefined
              }
              type="number"
              size="small"
              defaultValue={search.id}
              onChange={(e) => {
                setSearch((prev) => ({
                  ...prev,
                  id: e.target.value ? +e.target.value : undefined,
                }));
              }}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                slotProps={{ textField: { size: "small" } }}
                label="From Date"
                defaultValue={dayjs(selectDate.from)}
                onChange={(e) => {
                  setSelectDate((prev) => ({
                    ...prev,
                    from: e.startOf("D").toDate(),
                  }));
                }}
              />
              <DatePicker
                slotProps={{ textField: { size: "small" } }}
                label="To Date"
                defaultValue={dayjs(selectDate.to)}
                onChange={(e) => {
                  setSelectDate((prev) => ({
                    ...prev,
                    from: e.endOf("D").toDate(),
                  }));
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
              isOptionEqualToValue={(e) =>
                e.value === defaultValue.two_digit?.id
              }
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
                      label: `(${defaultValue.account.id}) ${defaultValue.account.username}`,
                      value: defaultValue.account.id,
                      group: defaultValue.account.type,
                    }
                  : undefined
              }
              groupBy={(option) => option.group}
              onChange={(e, f) => {
                setSearch((prev) => ({
                  ...prev,
                  account_id: f?.value,
                }));
              }}
              options={props.accounts.map((res) => ({
                label: `(${res.id}) ${res.username} `,
                value: res.id,
                group: res.type,
              }))}
              renderInput={(params) => (
                <TextField {...params} label="Accounts" />
              )}
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
          </form>
        </CardContent>
        <MaterialReactTable
          state={{ showProgressBars: isPadding }}
          enableRowActions
          muiLinearProgressProps={({ isTopToolbar }) => ({
            variant: "query", //if you want to show exact progress value

            sx: {
              display: isTopToolbar ? "block" : "none", //hide bottom progress bar
            },
          })}
          columns={columns}
          renderRowActionMenuItems={({
            row: {
              original: { id, title },
            },
          }) => [
            <Authorized permission="Edit_Entry" key={213213}>
              <Link href={pathName + "/form?id=" + id}>
                <MenuItem className="cursor-pointer" disabled={isPadding}>
                  Edit
                </MenuItem>
              </Link>
            </Authorized>,
            <Authorized permission="View_Entry" key={324234}>
              <Link href={pathName + "/" + id}>
                <MenuItem className="cursor-pointer" disabled={isPadding}>
                  View
                </MenuItem>
              </Link>
            </Authorized>,
            <Authorized permission="Delete_Entry" key={432523523}>
              <MenuItem
                disabled={isActive}
                className="cursor-pointer"
                onClick={() => {
                  const isConfirm = confirm(
                    `Do You sure you want to delete ${title} id:${id} `
                  );
                  if (isConfirm) {
                    setActive(async () => {
                      const result = await deleteEntry(id);

                      store.OpenAlert(result);
                    });
                  }
                }}
              >
                {isActive ? <> deleting...</> : "Delete"}
              </MenuItem>
            </Authorized>,
          ]}
          data={props.data}
        />
      </Card>
      <div></div>
    </Style>
  );
}
const Style = styled.div``;
