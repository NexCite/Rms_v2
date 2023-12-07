"use client";
import { useCallback, useEffect, useState, useTransition } from "react";

import { $Enums, Prisma } from "@prisma/client";
import { FormatNumberWithFixed } from "@rms/lib/global";

import {
  Autocomplete,
  Card,
  CardHeader,
  Divider,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NexCiteButton from "@rms/components/button/nexcite-button";
import Authorized from "@rms/components/ui/authorized";
import { useToast } from "@rms/hooks/toast-hook";
import {
  deleteEntry,
  findEnteris,
  resetEntry,
} from "@rms/service/entry-service";
import dayjs from "dayjs";
import {
  MRT_TableHeadCellFilterContainer,
  MRT_ToggleGlobalFilterButton,
  MRT_GlobalFilterTextField,
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
  MRT_PaginationState,
} from "material-react-table";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePDF } from "react-to-pdf";
import useHistoryStore from "@rms/hooks/history-hook";
type CommonEntriesSearch = {
  two_digit?: Prisma.Two_DigitGetPayload<{}>;
  three_digit?: Prisma.Three_DigitGetPayload<{}>;
  account?: Prisma.Account_EntryGetPayload<{}>;
  type?: $Enums.DigitType;
  more_than_four_digit?: Prisma.More_Than_Four_DigitGetPayload<{}>;
  include_reference?: boolean;
  debit?: $Enums.DebitCreditType;
  id?: number;
  from: Date;
  to: Date;
};
export default function SheetStateTable(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const historyStore = useHistoryStore<CommonEntriesSearch>("entry")();
  const [searchEntries, setSearchEntries] = useState<CommonEntriesSearch>(
    historyStore.data ?? {
      two_digit: null,
      three_digit: null,
      account: null,
      type: null,
      more_than_four_digit: null,
      include_reference: null,
      debit: null,
      id: undefined,
      from: dayjs().startOf("D").toDate(),
      to: dayjs().endOf("D").toDate(),
    }
  );
  const pathName = usePathname();
  const historyTablePageStore = useHistoryStore<MRT_PaginationState>(
    "entry-table-page",
    { pageIndex: 0, pageSize: 100 }
  )();
  const [dataEntries, setDataEntries] = useState<any[]>([]);
  const [id, setId] = useState<number>(undefined);

  const { targetRef } = usePDF();
  const toast = useToast();
  const handleData = useCallback(() => {
    setTransition(async () => {
      historyStore.setData(searchEntries);
      await findEnteris(searchEntries).then((res) => {
        setDataEntries(res.result);
      });
    });
  }, [findEnteris, searchEntries, setTransition]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);
  useEffect(() => {
    searchEntries.id = id;
    if (!loading) {
      handleData();
    }
  }, [searchEntries, handleData, loading]);

  const table = useMaterialReactTable({
    columns,
    data: dataEntries,

    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },
    muiTableContainerProps: { sx: { margin: 0 } },
    enableRowActions: true,
    renderRowActionMenuItems({
      row: {
        original: { id, title },
      },
    }) {
      return [
        <Authorized permission="Edit_Entry" key={213213}>
          <Link href={pathName + "/form?id=" + id}>
            <MenuItem className="cursor-pointer" disabled={isPadding}>
              Edit
            </MenuItem>
          </Link>
        </Authorized>,
        <Authorized permission={"Reset"} key={2}>
          <MenuItem
            disabled={isPadding}
            className="cursor-pointer"
            onClick={() => {
              const isConfirm = confirm(
                `Do You sure you want to reset ${name} id:${id} `
              );
              if (isConfirm) {
                setTransition(async () => {
                  const result = await resetEntry(id);

                  toast.OpenAlert(result);
                });
              }
            }}
          >
            {isPadding ? <> reseting...</> : "Reset"}
          </MenuItem>
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
            disabled={isPadding}
            className="cursor-pointer"
            onClick={() => {
              const isConfirm = confirm(
                `Do You sure you want to delete ${title} id:${id} `
              );
              if (isConfirm) {
                setTransition(async () => {
                  const result = await deleteEntry(id);
                  handleData();

                  toast.OpenAlert(result);
                });
              }
            }}
          >
            {isPadding ? <> deleting...</> : "Delete"}
          </MenuItem>
        </Authorized>,
      ];
    },
    renderTopToolbar: (props) => (
      <div>
        <div className="flex justify-between items-center p-3">
          <Typography variant="h6">
            Total Result: {dataEntries.length}
          </Typography>
          <div className="flex items-center justify-center">
            <MRT_ToggleGlobalFilterButton table={table} />
            <MRT_GlobalFilterTextField table={table} />
          </div>
        </div>
        <Divider />
        <div className="flex gap-5 justify-between p-5 mb-5">
          <div>
            <Typography>To: </Typography>
            <Typography>
              {searchEntries.two_digit
                ? `(${searchEntries.two_digit.id}) ${searchEntries.two_digit.name}`
                : ""}
            </Typography>
            <Typography>
              {searchEntries.three_digit
                ? `(${searchEntries.three_digit.id}) ${searchEntries.three_digit.name}`
                : ""}
            </Typography>
            <Typography>
              {searchEntries.more_than_four_digit
                ? `(${searchEntries.more_than_four_digit.id}) ${searchEntries.more_than_four_digit.name}`
                : ""}
            </Typography>
            <Typography>
              {searchEntries.account
                ? `(${searchEntries.account.id}) ${searchEntries.account.username}`
                : ""}
            </Typography>
          </div>
          <div></div>
          <div></div>
          <div></div>
          <div>
            <Typography>From: </Typography>
            <Typography>
              {dayjs(searchEntries.from).format("dddd DD-MM-YYYY")}
            </Typography>
          </div>
          <div>
            <Typography>To:</Typography>
            <Typography>
              {dayjs(searchEntries.to).format("dddd DD-MM-YYYY")}
            </Typography>
          </div>
        </div>
      </div>
    ),
    onPaginationChange: historyTablePageStore.setData,

    state: {
      showLoadingOverlay: isPadding,
      pagination: historyTablePageStore.data,
    },
    initialState: {
      density: "comfortable",
    },
  });
  return loading ? (
    <></>
  ) : (
    <Card variant="outlined">
      <CardHeader title={<Typography variant="h5">Entry Table</Typography>} />

      <Divider />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearchEntries((prev) => ({
            ...prev,
            id,
          }));
        }}
        className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4  h-full  overflow-auto  justify-between rms-container p-5"
      >
        <TextField
          disabled={isPadding}
          inputProps={{ type: "number" }}
          size="small"
          value={id}
          placeholder="Id"
          label="Id"
          onChange={(e) => {
            const id = parseInt(e.target.value);
            setId(Number.isInteger(id) ? id : undefined);
          }}
        />
        <NexCiteButton label="Search By Id" isPadding={isPadding} />
      </form>
      <form className=" grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4  h-full  overflow-auto  justify-between rms-container p-5">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            slotProps={{ textField: { size: "small" } }}
            label="From Date"
            value={dayjs(searchEntries.from)}
            onChange={(e) => {
              setSearchEntries((prev) => ({
                ...prev,
                from: e.startOf("D").toDate(),
              }));
            }}
          />
          <DatePicker
            slotProps={{ textField: { size: "small" } }}
            label="To Date"
            value={dayjs(searchEntries.to)}
            onChange={(e) => {
              setSearchEntries((prev) => ({
                ...prev,
                to: e.endOf("D").toDate(),
              }));
            }}
          />
        </LocalizationProvider>
        <Autocomplete
          disablePortal
          size="small"
          key={"Two Digits"}
          isOptionEqualToValue={(e) => e.id === searchEntries.two_digit?.id}
          value={searchEntries.two_digit}
          onChange={(e, f) => {
            setSearchEntries((prev) => ({
              ...prev,
              more_than_four_digit: null,
              three_digit: null,
              two_digit: f,
            }));
          }}
          getOptionLabel={(e) => `(${e.id}) ${e.name}`}
          options={props.two_digits}
          renderInput={(params) => (
            <TextField
              {...params}
              className="nexcite-input"
              label="Two Digits"
            />
          )}
        />
        <Autocomplete
          disablePortal
          size="small"
          isOptionEqualToValue={(e) => e.id === searchEntries.three_digit?.id}
          key={"Three Digits"}
          value={searchEntries.three_digit}
          onChange={(e, f) => {
            setSearchEntries((prev) => ({
              ...prev,
              more_than_four_digit: null,
              three_digit: f,
              two_digit: null,
            }));
          }}
          getOptionLabel={(e) => `(${e.id}) ${e.name}`}
          options={props.three_digits}
          renderInput={(params) => (
            <TextField
              {...params}
              className="nexcite-input"
              label="Three Digits"
            />
          )}
        />

        <Autocomplete
          disablePortal
          size="small"
          key={"More Digits"}
          getOptionLabel={(e) => `(${e.id}) ${e.name}`}
          value={searchEntries.more_than_four_digit}
          isOptionEqualToValue={(e) =>
            e.id === searchEntries.more_than_four_digit?.id
          }
          onChange={(e, f) => {
            setSearchEntries((prev) => ({
              ...prev,
              more_than_four_digit: f,
              three_digit: null,
              two_digit: null,
            }));
          }}
          options={props.more_digits}
          renderInput={(params) => (
            <TextField
              {...params}
              className="nexcite-input"
              label="More Four Digits"
              size="small"
            />
          )}
        />

        <Autocomplete
          disablePortal
          key={"Accounts"}
          size="small"
          isOptionEqualToValue={(e) => e.id === searchEntries.account?.id}
          value={searchEntries.account}
          onChange={(e, f) => {
            setSearchEntries((prev) => ({
              ...prev,
              account: f,
            }));
          }}
          getOptionLabel={(e) => `(${e.id}) ${e.username}`}
          groupBy={(option) => option.type}
          options={props.accounts.sort((a, b) => a.type.localeCompare(b.type))}
          renderInput={(params) => (
            <TextField {...params} className="nexcite-input" label="Accounts" />
          )}
        />

        <div className="flex items-center w-full ">
          <div>
            <label htmlFor="switch">Include Reffrence</label>
            <Switch
              name="switch"
              onChange={(e, f) => {
                setSearchEntries((prev) => ({ ...prev, include_reference: f }));
              }}
              checked={searchEntries.include_reference}
            />
          </div>
        </div>
      </form>
      <div ref={targetRef} id="export-to-img">
        <MaterialReactTable table={table} />
      </div>
    </Card>
  );
}

const columnHelper = createMRTColumnHelper<
  Prisma.EntryGetPayload<{
    include: {
      currency: true;
      sub_entries: {
        include: {
          account_entry: true;
          more_than_four_digit: true;
          three_digit: true;
          reference: true;
          entry: true;
          two_digit: true;
        };
      };
    };
  }>
>();

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor(
    (row) => dayjs(row?.to_date).format("DD-MM-YYYY hh:mm a"),
    {
      header: "Date",
      id: "to_date",
    }
  ),
  columnHelper.accessor("title", {
    header: "Title",
  }),
  columnHelper.accessor(
    (row) => {
      var debitAmout = 0;
      var creditAmount = 0;

      row.sub_entries.map((res) => {
        if (res.type === "Debit") {
          debitAmout += res.amount;
        } else {
          creditAmount += res.amount;
        }
      });

      return row.rate ? (
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
              <td>{FormatNumberWithFixed(row.rate)}</td>
              <td>
                $
                {FormatNumberWithFixed(
                  debitAmout > creditAmount
                    ? debitAmout
                    : creditAmount / row.rate
                )}
              </td>
              <td>
                {" "}
                {row.currency.symbol}
                {FormatNumberWithFixed(
                  debitAmout > creditAmount ? debitAmout : creditAmount
                )}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        `${row?.currency.symbol}${FormatNumberWithFixed(
          debitAmout > creditAmount ? debitAmout : creditAmount
        )}`
      );
    },
    {
      id: "amount",
      header: "Amount",
    }
  ),
  columnHelper.accessor(
    (row) => {
      var s = [];
      row.sub_entries
        ?.sort((a, b) => a.type.length - b.type.length)
        .forEach((e, i) =>
          s.push(
            <tr key={e.id + "" + i}>
              <td align="center">
                {row.currency.symbol}
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
                      ({e?.three_digit_id ?? ""}
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
                <Typography>Debit</Typography>
              </th>
              <th align="center">
                <Typography>Credit</Typography>
              </th>
            </tr>
          </thead>
          <tbody>{s}</tbody>
        </table>
      );
    },
    {
      id: "description",
      header: "SubEntry",
    }
  ),
  columnHelper.accessor(
    (row) => {
      return row.sub_entries
        .map(
          (e, i) =>
            `${e?.two_digit_id ?? ""}
        ${e?.three_digit_id ?? ""}
        ${e?.more_than_four_digit_id ?? ""}
        ${e?.account_entry_id ?? ""}${e.reference_id ?? ""}`
        )
        .join(", ");
    },
    {
      header: "Digits",
    }
  ),
];

type Props = {
  two_digits?: Prisma.Two_DigitGetPayload<{}>[];
  three_digits?: Prisma.Three_DigitGetPayload<{
    include: { two_digit: true };
  }>[];
  more_digits?: Prisma.More_Than_Four_DigitGetPayload<{
    include: { three_digit: true };
  }>[];
  accounts?: Prisma.Account_EntryGetPayload<{}>[];
};
