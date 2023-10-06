"use client";
import React, { useCallback, useMemo, useState, useTransition } from "react";

import { VisibilityState } from "@tanstack/react-table";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { $Enums, Prisma } from "@prisma/client";
import { FormatNumberWithFixed } from "@rms/lib/global";

import { usePathname, useRouter } from "next/navigation";
import styled from "@emotion/styled";

import { DateRange } from "react-day-picker";

import { deleteEntry } from "@rms/service/entry-service";
import useAlertHook from "@rms/hooks/alert-hooks";
import moment from "moment";
import Authorized from "@rms/components/ui/authorized";
import {
  Autocomplete,
  Card,
  CardContent,
  MenuItem,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import LoadingButton from "@mui/lab/LoadingButton";

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

  const { two_digit, three_digit, four_digit, account } = useMemo(() => {
    var two_digit: { id: number; name: string } = undefined,
      three_digit: { id: number; name: string } = undefined,
      four_digit: { id: number; name: string } = undefined;
    var account: { id: number; username: string } = undefined;
    if (search.two_digit_id) {
      two_digit = props.two_digits.find(
        (res) => res.id === search.two_digit_id
      );
    }
    if (search.three_digit_id) {
      three_digit = props.two_digits.find(
        (res) => res.id === search.three_digit_id
      );
    }

    if (search.more_digit_id) {
      four_digit = props.two_digits.find(
        (res) => res.id === search.more_digit_id
      );
    }

    if (search.account_id) {
      account = props.two_digits.find(
        (res) => res.id === search.account_id
      ) as any;
    }

    return { two_digit, three_digit, four_digit, account };
  }, [search]);
  const columns: MRT_ColumnDef<CommonEntryType>[] = useMemo(
    () => [
      {
        header: "Status",
        accessorKey: "status",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },

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
                <tr key={e.id + "" + i}>
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
    [createAlert, isActive, pathName, push]
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
              defaultValue={
                two_digit
                  ? { label: two_digit.name, value: two_digit.id }
                  : undefined
              }
              isOptionEqualToValue={(e) => e.value === two_digit?.id}
              onChange={(e, f) => {
                setSearch((prev) => ({
                  ...prev,
                  more_digit_id: undefined,
                  three_digit_id: undefined,
                  two_digit_id: f ? f.value : undefined,
                }));
              }}
              options={props.two_digits.map((res) => ({
                label: res.name,
                value: res.id,
              }))}
              renderInput={(params) => (
                <TextField {...params} label="Two Digits" />
              )}
            />
            <Autocomplete
              disablePortal
              size="small"
              isOptionEqualToValue={(e) => e.value === three_digit?.id}
              value={
                three_digit
                  ? {
                      label: three_digit.name,
                      value: three_digit.id,
                    }
                  : undefined
              }
              onChange={(e, f) => {
                setSearch((prev) => ({
                  ...prev,
                  more_digit_id: undefined,
                  three_digit_id: f ? f.value : undefined,
                  two_digit_id: undefined,
                }));
              }}
              options={props.three_digits.map((res) => ({
                label: res.name,
                value: res.id,
              }))}
              renderInput={(params) => (
                <TextField {...params} label="Three Digits" />
              )}
            />

            <Autocomplete
              disablePortal
              size="small"
              isOptionEqualToValue={(e) => e.value === four_digit?.id}
              value={
                four_digit
                  ? {
                      label: four_digit.name,
                      value: four_digit.id,
                    }
                  : undefined
              }
              onChange={(e, f) => {
                setSearch((prev) => ({
                  ...prev,
                  more_digit_id: f ? f.value : undefined,
                  three_digit_id: undefined,
                  two_digit_id: undefined,
                }));
              }}
              options={props.more_digits.map((res) => ({
                label: res.name,
                value: res.id,
              }))}
              renderInput={(params) => (
                <TextField {...params} label="More Four Digits" />
              )}
            />
            <Autocomplete
              disablePortal
              size="small"
              isOptionEqualToValue={(e) => e.value === account.id}
              value={
                account
                  ? {
                      label: `${account.id} ${account.username}`,
                      value: account.id,
                    }
                  : undefined
              }
              onChange={(e, f) => {
                setSearch((prev) => ({
                  ...prev,
                  account_id: f.value,
                }));
              }}
              options={props.more_digits.map((res) => ({
                label: res.name,
                value: res.id,
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
          enableRowActions
          columns={columns}
          renderRowActionMenuItems={({
            row: {
              original: { id, title },
            },
          }) => [
            <Authorized permission="Edit_Entry" key={1}>
              <MenuItem
                onClick={() => push(pathName + "/form?id=" + id)}
                className="cursor-pointer"
                disabled={isActive}
              >
                Edit
              </MenuItem>
            </Authorized>,
            <Authorized permission="View_Entry" key={2}>
              <MenuItem
                onClick={() => push(pathName + "/" + id)}
                className="cursor-pointer"
                disabled={isActive}
              >
                View
              </MenuItem>
            </Authorized>,
            <Authorized permission="Delete_Entry" key={3}>
              <MenuItem
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
