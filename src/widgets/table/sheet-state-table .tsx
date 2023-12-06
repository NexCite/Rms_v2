"use client";
import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { $Enums, Prisma } from "@prisma/client";
import { FormatNumberWithFixed } from "@rms/lib/global";

import {
  Autocomplete,
  Card,
  CardHeader,
  Divider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NexCiteButton from "@rms/components/button/nexcite-button";
import Loading from "@rms/components/ui/loading";
import { findEnteris } from "@rms/service/entry-service";
import dayjs from "dayjs";
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import moment from "moment";
import Image from "next/image";
import { usePDF } from "react-to-pdf";

export default function SheetStateTable(props: Props) {
  const [isPadding, setTransition] = useTransition();

  const [searchEntries, setSearchEntries] = useState<{
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
  }>({
    two_digit: null,
    three_digit: null,
    account: null,
    type: null,
    more_than_four_digit: null,
    include_reference: null,
    debit: null,
    id: null,
    from: dayjs().startOf("D").toDate(),
    to: dayjs().endOf("D").toDate(),
  });

  const [dataEntries, setDataEntries] = useState<any[]>([]);

  const { totalCredit, totalDebit, totalCreditRate, totalDebitRate } =
    useMemo(() => {
      var totalDebit: Record<string, number> = {},
        totalCredit: Record<string, number> = {},
        currencies: { [k: string]: boolean } = {};

      var totalDebitRate = 0,
        totalCreditRate = 0;

      dataEntries.forEach((entry) => {
        const { three_digit, account, two_digit, more_than_four_digit } =
          searchEntries;
        const three_digit_id = three_digit?.id,
          account_id = account?.id,
          two_digit_id = two_digit?.id,
          more_digit_id = more_than_four_digit?.id;

        entry.sub_entries.forEach((subEntry) => {
          var amount = 0;

          if (
            account_id &&
            !two_digit_id &&
            !three_digit_id &&
            !more_digit_id
          ) {
            if (account_id === subEntry.account_entry_id) {
              amount = subEntry.amount;
            }
          }
          if (two_digit_id) {
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
              subEntry.more_than_four_digit?.three_digit_id ===
                three_digit_id ||
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
              subEntry.account_entry?.more_than_four_digit_id ===
                more_digit_id ||
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
              if (entry.rate) {
                totalCreditRate += subEntry.amount / entry.rate;
              }
            } else if (totalCredit[entry.currency.symbol]) {
              totalCredit[entry.currency.symbol] += subEntry.amount;
              if (entry.rate) {
                totalDebitRate += subEntry.amount / entry.rate;
              }
            } else {
              if (!currencies[entry.currency.symbol]) {
                currencies[entry.currency.symbol] = true;
              }
              totalCredit[entry.currency.symbol] = subEntry.amount;
              if (entry.rate) {
                totalDebitRate += subEntry.amount / entry.rate;
              }
            }
          } else {
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

          if (
            account_id &&
            !two_digit_id &&
            !three_digit_id &&
            !more_digit_id
          ) {
            if (account_id === subEntry.account_entry_id) {
              return;
            } else {
              return;
            }
          }
        });
      });

      return {
        totalDebitRate,
        totalCreditRate,
        totalDebit,
        totalCredit,
        currencies,
      };
    }, [dataEntries]);
  const titleRef = useRef<HTMLHeadingElement>();
  const { toPDF, targetRef } = usePDF();
  const [loadingUi, setLoadingUi] = useState(true);
  useEffect(() => {
    setLoadingUi(false);
  }, []);
  useEffect(() => {
    setTransition(() =>
      findEnteris(searchEntries).then((res) => {
        setDataEntries(res.result);
      })
    );
  }, [searchEntries]);
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
    renderTopToolbar: () => (
      <>
        <div className="flex justify-between items-center px-5">
          <div className="flex  items-center gap-4 py-5 ">
            <Image
              src={"/api/media/" + props.config.logo}
              width={60}
              height={60}
              priority={false}
              alt="logo"
              className="rounded-full w-12 h-12 mb-3 ml-2 "
            />
            <Typography className="text-4xl">{props.config.name}</Typography>
          </div>
          <Typography variant="h6">
            Total Result: {dataEntries.length}
          </Typography>
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
          <div>
            <Typography>Export Date:</Typography>
            <Typography>
              {dayjs().format("dddd DD-MM-YYYY  hh:mm a")}
            </Typography>
          </div>
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
    ),
    renderBottomToolbar: (e) => {
      const subEntriesData = useMemo(
        () =>
          props.currencies
            .filter((res) => {
              return totalCredit[res.symbol] === undefined &&
                totalDebit[res.symbol] === undefined
                ? false
                : true;
            })
            .map((res) => ({
              currncy: res.symbol,
              debit: FormatNumberWithFixed(totalDebit[res.symbol] ?? 0),
              credit: FormatNumberWithFixed(totalCredit[res.symbol] ?? 0),
              total: `${
                (totalDebit[res.symbol] ?? 0) > (totalCredit[res.symbol] ?? 0)
                  ? "Debit"
                  : (totalDebit[res.symbol] ?? 0) ===
                    (totalCredit[res.symbol] ?? 0)
                  ? ""
                  : "Credit"
              }  ${FormatNumberWithFixed(
                Math.abs(
                  (totalDebit[res.symbol] ?? 0) - (totalCredit[res.symbol] ?? 0)
                )
              )}`,
              totalCreditRate: `$${FormatNumberWithFixed(totalCreditRate)}`,
              totalDebitRate: `$${FormatNumberWithFixed(totalDebitRate)}`,
              totalRate: `${
                totalDebitRate == totalCreditRate
                  ? ""
                  : totalDebitRate > totalCreditRate
                  ? "Debit"
                  : "Credit"
              } $${FormatNumberWithFixed(
                Math.abs(totalDebitRate - totalCreditRate)
              )}`,
            })),
        [dataEntries]
      );
      const subEntriesTable = useMaterialReactTable({
        columns: subEntriesColumns,
        data: subEntriesData,
        enablePagination: false,
        enableFilters: false,
        enableDensityToggle: false,
        renderTopToolbar: <></>,
        enableExpandAll: false,
        enableFullScreenToggle: false,
        enableExpanding: false,
        enableHiding: false,
        enableSorting: false,
        enableColumnActions: false,
        initialState: {
          pagination: { pageSize: 1000, pageIndex: 0 },
        },
      });

      return (
        <>
          <MaterialReactTable table={subEntriesTable} />
        </>
      );
    },

    initialState: {
      columnVisibility: {},
      pagination: {
        pageIndex: 0,
        pageSize: 500,
      },
    },
  });
  return loadingUi ? (
    <Loading />
  ) : (
    <Card variant="outlined">
      <CardHeader
        title={<Typography variant="h5">Sheet State Table</Typography>}
      />

      <Divider />

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

        <NexCiteButton
          label="Export"
          onClick={(e) => {
            setTransition(() => {
              toPng(document.getElementById("export-to-img")).then(function (
                dataUrl
              ) {
                const anchor = document.createElement("a");

                // Set the href to the URL you want to download
                anchor.href = dataUrl;

                // Optional: set the download attribute to a specific filename
                anchor.download = titleRef.current.innerText + ".png";

                // Append the anchor to the document body temporarily
                document.body.appendChild(anchor);

                // Trigger the download by simulating a click on the anchor
                anchor.click();

                // Remove the anchor from the document body
                document.body.removeChild(anchor);
              });
            });
          }}
          isPadding={isPadding}
        />
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
const columnSubHelper = createMRTColumnHelper<{
  currncy: string;
  debit: string;
  credit: string;
  total: string;
  totalCreditRate: string;
  totalDebitRate: string;
  totalRate: string;
}>();

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor(
    (row) => moment(row?.to_date).format("DD-MM-yyy hh:mm a"),
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
];

type Props = {
  config: {
    logo: string;
    name: string;
  };

  two_digits?: Prisma.Two_DigitGetPayload<{}>[];
  three_digits?: Prisma.Three_DigitGetPayload<{
    include: { two_digit: true };
  }>[];
  more_digits?: Prisma.More_Than_Four_DigitGetPayload<{
    include: { three_digit: true };
  }>[];
  accounts?: Prisma.Account_EntryGetPayload<{}>[];
  currencies: Prisma.CurrencyGetPayload<{}>[];
};

const subEntriesColumns = [
  columnSubHelper.accessor("currncy", {
    header: "Currncy",
  }),
  columnSubHelper.accessor("debit", {
    header: "Debit",
  }),
  columnSubHelper.accessor("credit", {
    header: "Credit",
  }),
  columnSubHelper.accessor("total", {
    header: "Total",
  }),
  columnSubHelper.accessor("totalDebitRate", {
    header: "Total Debit Rate",
  }),
  columnSubHelper.accessor("totalCreditRate", {
    header: "Total Credit Rate",
  }),
  columnSubHelper.accessor("totalRate", {
    header: "Total Rate",
  }),
];
