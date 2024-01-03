"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { $Enums, Prisma } from "@prisma/client";
import { FormatNumberWithFixed } from "@rms/lib/global";

import {
  Autocomplete,
  Card,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NexCiteButton from "@rms/components/button/nexcite-button";
import {
  deleteEntry,
  findEnteris,
  resetEntry,
} from "@rms/service/entry-service";

import Authorized from "@rms/components/ui/authorized";
import useHistoryStore from "@rms/hooks/history-hook";
import { useToast } from "@rms/hooks/toast-hook";
import dayjs from "dayjs";
import {
  MRT_ColumnFiltersState,
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePDF } from "react-to-pdf";

import html2canvas from "html2canvas";
import LoadingClient from "@rms/components/other/loading-client";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

export default function SheetStateTable(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const historyStore =
    useHistoryStore<CommonEntriesSearch>("sheet-state-search")();
  const historyStoreTableFilter = useHistoryStore<MRT_ColumnFiltersState>(
    "sheet-state-table-filter",
    []
  )();

  const [searchEntries, setSearchEntries] = useState<CommonEntriesSearch>(
    historyStore.data ?? {
      two_digit: [],
      three_digit: [],
      currency: [],
      account: [],
      type: null,
      more_than_four_digit: [],
      include_reference: null,
      debit: null,
      from: dayjs().startOf("D").toDate(),
      to: dayjs().endOf("D").toDate(),
    }
  );

  const [dataEntries, setDataEntries] = useState<any[]>([]);
  const [totals, setTotals] = useState<{
    totalDebit: Record<string, number>;
    totalCredit: Record<string, number>;
    currencies: { [k: string]: boolean };
    totalCreditRate: number;
    totalDebitRate: number;
  }>({
    totalDebit: {},
    totalCredit: {},
    currencies: {},
    totalCreditRate: 0,
    totalDebitRate: 0,
  });

  // const { totalCredit, totalDebit, totalCreditRate, totalDebitRate } =
  //   useMemo(() => {
  //     var totalDebit: Record<string, number> = {},
  //       totalCredit: Record<string, number> = {},
  //       currencies: { [k: string]: boolean } = {};

  //     var totalDebitRate = 0,
  //       totalCreditRate = 0;

  //     dataEntries.forEach((entry) => {
  //       const { three_digit, account, two_digit, more_than_four_digit } =
  //         searchEntries;
  //       const three_digit_ids = three_digit.map((res) => res.id),
  //         account_ids = account?.map((res) => res.id),
  //         two_digit_ids = two_digit?.map((res) => res.id),
  //         more_digit_ids = more_than_four_digit?.map((res) => res.id);

  //       entry.sub_entries.forEach((subEntry) => {
  //         var amount = 0;

  //         if (
  //           account_ids.length > 0 &&
  //           two_digit_ids.length === 0 &&
  //           three_digit_ids.length === 0 &&
  //           more_digit_ids.length === 0
  //         ) {
  //           if (account_ids.includes(subEntry.account_entry_id)) {
  //             amount = subEntry.amount;
  //           }
  //         }
  //         if (two_digit_ids.length > 0) {
  //           if (
  //             two_digit_ids.includes(subEntry.two_digit_id) ||
  //             two_digit_ids.includes(subEntry.three_digit?.two_digit_id) ||
  //             two_digit_ids.includes(
  //               subEntry.more_than_four_digit?.three_digit?.two_digit_id
  //             ) ||
  //             two_digit_ids.includes(subEntry.account_entry?.two_digit_id) ||
  //             two_digit_ids.includes(
  //               subEntry.account_entry?.three_digit?.two_digit_id
  //             ) ||
  //             two_digit_ids.includes(
  //               subEntry.account_entry?.more_than_four_digit?.three_digit
  //                 ?.two_digit_id
  //             ) ||
  //             two_digit_ids.includes(subEntry.reference?.two_digit_id) ||
  //             two_digit_ids.includes(
  //               subEntry.reference?.three_digit?.two_digit_id
  //             ) ||
  //             two_digit_ids.includes(
  //               subEntry.reference?.more_than_four_digit?.three_digit
  //                 ?.two_digit_id
  //             )
  //           ) {
  //             amount = subEntry.amount;
  //           }
  //         } else if (three_digit_ids.length > 0) {
  //           if (
  //             three_digit_ids.includes(subEntry.three_digit_id) ||
  //             three_digit_ids.includes(
  //               subEntry.more_than_four_digit?.three_digit_id
  //             ) ||
  //             three_digit_ids.includes(
  //               subEntry.account_entry?.three_digit_id
  //             ) ||
  //             three_digit_ids.includes(
  //               subEntry.account_entry?.more_than_four_digit?.three_digit_id
  //             ) ||
  //             three_digit_ids.includes(subEntry.reference?.three_digit_id) ||
  //             three_digit_ids.includes(
  //               subEntry.reference?.more_than_four_digit?.three_digit_id
  //             )
  //           ) {
  //             amount = subEntry.amount;
  //           }
  //         } else if (more_digit_ids.length > 0) {
  //           if (
  //             more_digit_ids.includes(subEntry.more_than_four_digit_id) ||
  //             more_digit_ids.includes(
  //               subEntry.account_entry?.more_than_four_digit_id
  //             ) ||
  //             more_digit_ids.includes(
  //               subEntry.reference?.more_than_four_digit_id
  //             )
  //           ) {
  //             amount = subEntry.amount;
  //           }
  //         }

  //         if (amount === 0) {
  //           if (subEntry.type === "Credit") {
  //             if (totalDebit[entry.currency.symbol]) {
  //               totalDebit[entry.currency.symbol] += subEntry.amount;
  //             } else {
  //               if (!currencies[entry.currency.symbol]) {
  //                 currencies[entry.currency.symbol] = true;
  //               }
  //               totalDebit[entry.currency.symbol] = subEntry.amount;
  //             }
  //             if (entry.rate) {
  //               totalCreditRate += subEntry.amount / entry.rate;
  //             }
  //           } else if (totalCredit[entry.currency.symbol]) {
  //             totalCredit[entry.currency.symbol] += subEntry.amount;
  //             if (entry.rate) {
  //               totalDebitRate += subEntry.amount / entry.rate;
  //             }
  //           } else {
  //             if (!currencies[entry.currency.symbol]) {
  //               currencies[entry.currency.symbol] = true;
  //             }
  //             totalCredit[entry.currency.symbol] = subEntry.amount;
  //             if (entry.rate) {
  //               totalDebitRate += subEntry.amount / entry.rate;
  //             }
  //           }
  //         } else {
  //         }

  //         if (two_digit_ids.includes(subEntry.two_digit_id)) {
  //           return;
  //         }
  //         if (three_digit_ids.includes(subEntry.three_digit_id)) {
  //           return;
  //         }
  //         if (more_digit_ids.includes(subEntry.more_than_four_digit_id)) {
  //           return;
  //         }

  //         if (
  //           account_ids.length > 0 &&
  //           two_digit_ids.length === 0 &&
  //           three_digit_ids.length === 0 &&
  //           more_digit_ids.length === 0
  //         ) {
  //           if (account_ids.includes(subEntry.account_entry_id)) {
  //             return;
  //           } else {
  //             return;
  //           }
  //         }
  //       });
  //     });

  //     return {
  //       totalDebitRate,
  //       totalCreditRate,
  //       totalDebit,
  //       totalCredit,
  //       currencies,
  //     };
  //   }, [dataEntries]);
  const pathName = usePathname();
  const toast = useToast();
  const titleRef = useRef<HTMLHeadingElement>();
  const { targetRef } = usePDF();
  const [id, setId] = useState<number>(historyStore.data?.id ?? undefined);
  const to = useMemo(() => {
    const divs: any[] = [];
    searchEntries.account.map((res, i) =>
      divs.push(
        <Typography key={i + res.username}>
          ({res.id}) {res.username} {res.currency?.symbol}
        </Typography>
      )
    );
    searchEntries.two_digit.map((res, i) =>
      divs.push(
        <Typography key={res.name + i}>
          ({res.id}) {res.name}
        </Typography>
      )
    );
    searchEntries.three_digit.map((res, i) =>
      divs.push(
        <Typography key={res.name + i}>
          ({res.id}) {res.name}
        </Typography>
      )
    );
    searchEntries.more_than_four_digit.map((res, i) =>
      divs.push(
        <Typography key={res.name + i}>
          ({res.id}) {res.name}
        </Typography>
      )
    );
    return divs;
  }, [searchEntries]);
  const handleData = useCallback(() => {
    setTransition(async () => {
      historyStore.set(searchEntries);
      await findEnteris(searchEntries).then((res) => {
        setDataEntries(res.result);
        const worker = new Worker(new URL("./entry.js", import.meta.url));
        worker.postMessage({
          dataEntries: res.result,
          searchEntries,
        });
        worker.onmessage = ({ data }) => {
          setTransition(() => {
            const {
              totalDebitRate,
              totalCreditRate,
              totalDebit,
              totalCredit,
              currencies,
            } = data;
            setTotals((prev) => ({
              totalDebitRate,
              currencies,
              totalCredit,
              totalCreditRate,
              totalDebit,
            }));
          });
          worker.terminate();
        };
      });
    });
  }, [findEnteris, searchEntries, setTransition]);

  const exportImage = async (elementId, fileName) => {
    let table = document.getElementById("export-to-img");
    // Array.from(tables).map((res) => table.appendChild(res));

    html2canvas(table, {
      useCORS: true,
    }).then((canvas) => {
      const anchor = document.createElement("a");
      anchor.href = canvas.toDataURL("image/png");
      anchor.download = fileName + ".png";
      anchor.click();
    });
  };
  useEffect(() => {
    handleData();
  }, [searchEntries, handleData]);
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
            isOptionEqualToValue={(e) =>
              searchEntries.currency.find((res) => res.id === e.id)?.id
                ? true
                : false
            }
            disablePortal
            size="small"
            key={"Two Digits"}
            // isOptionEqualToValue={(e) => e.id === searchEntries.two_digit?.id}
            value={searchEntries.currency}
            multiple
            onChange={(e, f) => {
              setSearchEntries((prev) => ({
                ...prev,

                currency: f,
              }));
            }}
            getOptionLabel={(e) => `${e.symbol}`}
            options={props.currencies}
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<MdCheckBoxOutlineBlank />}
                  checkedIcon={<MdCheckBox />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.symbol}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                className="nexcite-input"
                label="Currencies"
              />
            )}
            renderTags={(tagValue, getTagProps) => {
              return tagValue.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={`${option.symbol}`}
                />
              ));
            }}
          />
          <Autocomplete
            isOptionEqualToValue={(e) =>
              searchEntries.two_digit.find((res) => res.id === e.id)?.id
                ? true
                : false
            }
            disablePortal
            size="small"
            key={"Two Digits"}
            // isOptionEqualToValue={(e) => e.id === searchEntries.two_digit?.id}
            value={searchEntries.two_digit}
            multiple
            onChange={(e, f) => {
              setSearchEntries((prev) => ({
                ...prev,
                more_than_four_digit: [],
                three_digit: [],
                two_digit: f,
              }));
            }}
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<MdCheckBoxOutlineBlank />}
                  checkedIcon={<MdCheckBox />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                ({option.id}) {option.name}
              </li>
            )}
            groupBy={(e) => e.type}
            getOptionLabel={(e) => `(${e.id}) ${e.name}`}
            options={props.two_digits}
            renderInput={(params) => (
              <TextField
                {...params}
                className="nexcite-input"
                label="Two Digits"
              />
            )}
            renderTags={(tagValue, getTagProps) => {
              return tagValue.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={`(${option.id}) ${option.name}`}
                />
              ));
            }}
          />
          <Autocomplete
            disablePortal
            size="small"
            isOptionEqualToValue={(e) =>
              searchEntries.three_digit.find((res) => res.id === e.id)?.id
                ? true
                : false
            }
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<MdCheckBoxOutlineBlank />}
                  checkedIcon={<MdCheckBox />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                ({option.id}) {option.name}
              </li>
            )}
            groupBy={(e) => e.type}
            key={"Three Digits"}
            multiple
            value={searchEntries.three_digit}
            onChange={(e, f) => {
              setSearchEntries((prev) => ({
                ...prev,
                more_than_four_digit: [],
                three_digit: f,
                two_digit: [],
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
            renderTags={(tagValue, getTagProps) => {
              return tagValue.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={`(${option.id}) ${option.name}`}
                />
              ));
            }}
          />

          <Autocomplete
            disablePortal
            size="small"
            key={"More Digits"}
            isOptionEqualToValue={(e) =>
              searchEntries.more_than_four_digit.find((res) => res.id === e.id)
                ?.id
                ? true
                : false
            }
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<MdCheckBoxOutlineBlank />}
                  checkedIcon={<MdCheckBox />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                ({option.id}) {option.name}
              </li>
            )}
            groupBy={(e) => e.type}
            getOptionLabel={(e) => `(${e.id}) ${e.name}`}
            value={searchEntries.more_than_four_digit}
            multiple
            // isOptionEqualToValue={(e) =>
            //   e.id === searchEntries.more_than_four_digit?.id
            // }
            onChange={(e, f) => {
              setSearchEntries((prev) => ({
                ...prev,
                more_than_four_digit: f,
                three_digit: [],
                two_digit: [],
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
            renderTags={(tagValue, getTagProps) => {
              return tagValue.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={`(${option.id}) ${option.name}`}
                />
              ));
            }}
          />

          <Autocomplete
            isOptionEqualToValue={(e) =>
              searchEntries.account.find((res) => res.id === e.id)?.id
                ? true
                : false
            }
            disablePortal
            key={"Accounts"}
            size="small"
            multiple
            // isOptionEqualToValue={(e) => e.id === searchEntries.account?.id}
            value={searchEntries.account}
            onChange={(e, f) => {
              setSearchEntries((prev) => ({
                ...prev,
                account: f,
              }));
            }}
            renderTags={(tagValue, getTagProps) => {
              return tagValue.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={`(${option.id}) ${option.username}`}
                />
              ));
            }}
            getOptionLabel={(e) => `(${e.id}) ${e.username}`}
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<MdCheckBoxOutlineBlank />}
                  checkedIcon={<MdCheckBox />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                ({option.id}) {option.username}
              </li>
            )}
            groupBy={(option) => option.type}
            options={props.accounts.sort((a, b) =>
              a.type.localeCompare(b.type)
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                className="nexcite-input"
                label="Accounts"
              />
            )}
          />

          <div className="flex items-center w-full  h-[30px]">
            <div>
              <label>Include Reffrence</label>
              <Switch
                name="switch"
                onChange={(e, f) => {
                  setSearchEntries((prev) => ({
                    ...prev,
                    include_reference: f,
                  }));
                }}
                checked={searchEntries.include_reference}
              />
            </div>
          </div>

          <div className="h-[30px]">
            <NexCiteButton
              label="Export"
              onClick={(e) => {
                setTransition(() => {
                  exportImage("", titleRef.current.innerText);
                  // toPng(document.getElementById("export-to-img")).then(function (
                  //   dataUrl
                  // ) {
                  //   const anchor = document.createElement("a");
                  //   // Set the href to the URL you want to download
                  //   anchor.href = dataUrl;
                  //   // Optional: set the download attribute to a specific filename
                  //   anchor.download = titleRef.current.innerText + ".png";
                  //   // Append the anchor to the document body temporarily
                  //   document.body.appendChild(anchor);
                  //   // Trigger the download by simulating a click on the anchor
                  //   anchor.click();
                  //   // Remove the anchor from the document body
                  //   document.body.removeChild(anchor);
                  // });
                });
              }}
              isPadding={isPadding}
            />
          </div>
        </form>
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
            <Typography>For: </Typography>
            <div>{to.length === 0 ? "*" : to}</div>
          </div>
          <div>
            <Typography>Include Reffrence:</Typography>
            <Typography>
              {searchEntries.include_reference ? "True" : "False"}
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

    initialState: {
      density: "comfortable",
      showColumnFilters: historyStoreTableFilter.data.length > 0,
    },
    state: {
      showLoadingOverlay: isPadding,
      columnFilters: historyStoreTableFilter.data,
    },

    onColumnFiltersChange: historyStoreTableFilter.set,
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
    renderBottomToolbar: (e) => {
      const subEntriesData = useMemo(
        () =>
          props.currencies
            .filter((res) => {
              return totals.totalCredit[res.symbol] === undefined &&
                totals.totalDebit[res.symbol] === undefined
                ? false
                : true;
            })
            .map((res) => ({
              currncy: res.symbol,
              debit: FormatNumberWithFixed(totals.totalDebit[res.symbol] ?? 0),
              credit: FormatNumberWithFixed(
                totals.totalCredit[res.symbol] ?? 0
              ),
              total: `${
                (totals.totalDebit[res.symbol] ?? 0) >
                (totals.totalCredit[res.symbol] ?? 0)
                  ? "Debit"
                  : (totals.totalDebit[res.symbol] ?? 0) ===
                    (totals.totalCredit[res.symbol] ?? 0)
                  ? ""
                  : "Credit"
              }  ${FormatNumberWithFixed(
                Math.abs(
                  (totals.totalDebit[res.symbol] ?? 0) -
                    (totals.totalCredit[res.symbol] ?? 0)
                )
              )}`,
              totalCreditRate: `$${FormatNumberWithFixed(
                totals.totalCreditRate
              )}`,
              totalDebitRate: `$${FormatNumberWithFixed(
                totals.totalDebitRate
              )}`,
              totalRate: `${
                totals.totalDebitRate == totals.totalCreditRate
                  ? ""
                  : totals.totalDebitRate > totals.totalCreditRate
                  ? "Debit"
                  : "Credit"
              } $${FormatNumberWithFixed(
                Math.abs(totals.totalDebitRate - totals.totalCreditRate)
              )}`,
            })),
        [dataEntries, totals]
      );
      const subEntriesTable = useMaterialReactTable({
        columns: subEntriesColumns,
        data: subEntriesData,
        enablePagination: false,
        enableFilters: false,
        enableDensityToggle: false,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
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
    enablePagination: false,
  });
  return (
    <Card variant="outlined">
      <CardHeader
        title={<Typography variant="h5">Sheet State Table</Typography>}
      />

      <Divider />

      <div ref={targetRef} id="export-to-img">
        <LoadingClient>
          <MaterialReactTable table={table} />
        </LoadingClient>
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
      id: "sub_entries",
      enableColumnFilter: false,

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
  accounts?: Prisma.Account_EntryGetPayload<{ include: { currency } }>[];
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

type CommonEntriesSearch = {
  two_digit?: Prisma.Two_DigitGetPayload<{}>[];
  currency?: Prisma.CurrencyGetPayload<{}>[];

  three_digit?: Prisma.Three_DigitGetPayload<{}>[];
  account?: Prisma.Account_EntryGetPayload<{ include: { currency: true } }>[];
  type?: $Enums.DigitType;
  more_than_four_digit?: Prisma.More_Than_Four_DigitGetPayload<{}>[];
  include_reference?: boolean;
  debit?: $Enums.DebitCreditType;
  id?: number;
  from: Date;
  to: Date;
};
