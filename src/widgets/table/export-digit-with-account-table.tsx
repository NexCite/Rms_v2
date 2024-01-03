"use client";
import styled from "@emotion/styled";
import { $Enums, Prisma } from "@prisma/client";
import { FormatNumberWithFixed } from "@rms/lib/global";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";

import {
  Autocomplete,
  Card,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  findMoreDigitsSubEntries,
  findThreeDigitsSubEntries,
  findTwoDigitsSubEntries,
  findTwoDigitsSubEntriesWithAccounts,
} from "@rms/service/entry-service";
import { DownloadTableExcel } from "react-export-table-to-excel";

import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NexCiteButton from "@rms/components/button/nexcite-button";
import Loading from "@rms/components/ui/loading";
import dayjs from "dayjs";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDownload,
  MdSearch,
} from "react-icons/md";
import { z } from "zod";

type CommonData = {
  name: string;
  id: number;
  subEntires: Prisma.SubEntryGetPayload<{}>[];
  type?: $Enums.DigitType | "Others";
  debit_credit?: $Enums.DebitCreditType;
};
const schema = z.object({
  two_digits: z.array(z.custom<Prisma.Two_DigitGetPayload<{}>>()),
  three_digits: z.array(z.custom<Prisma.Three_DigitGetPayload<{}>>()),
  more_digits: z.array(z.custom<Prisma.More_Than_Four_DigitGetPayload<{}>>()),
  account: z.custom<Prisma.Account_EntryGetPayload<{}>>().nullable(),

  currency: z.custom<Prisma.CurrencyGetPayload<{}>>(),
  from: z.date().default(dayjs().startOf("D").toDate()),
  to: z.date().default(dayjs().endOf("D").toDate()),
  include_reference: z.boolean().default(false),
});
type schema = z.infer<typeof schema>;
export default function ExportDigitWithAccountTable(props: Props) {
  const [data, setData] = useState<CommonData[]>([]);

  const { handleSubmit, control } = useForm<schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      three_digits: [],
      two_digits: [],
      account: null,
      from: dayjs().startOf("D").toDate(),
      to: dayjs().startOf("D").toDate(),
      more_digits: [],
      currency: null,
    },
  });

  const onSubmit = useCallback((values: schema) => {
    if (!values.currency) {
      return;
    }

    setTransition(() => {
      if (values.two_digits.length > 0) {
        findTwoDigitsSubEntriesWithAccounts({
          currency: values.currency,
          from: values.from,
          to: values.to,
          account: values.account,
          include_reference: values.include_reference,
          two_digits: values.two_digits,
        }).then((res) => {
          const { result } = res;
          setData(result);
        });
      } else if (values.three_digits.length > 0) {
        findThreeDigitsSubEntries({
          currency: values.currency,
          from: values.from,
          to: values.to,
          include_reference: values.include_reference,
          three_digits: values.three_digits,
        }).then((res) => {
          const { result } = res;
          setData(result);
        });
      } else if (values.more_digits.length > 0) {
        findMoreDigitsSubEntries({
          currency: values.currency,
          from: values.from,
          to: values.to,
          include_reference: values.include_reference,
          more_digits: values.more_digits,
        }).then((res) => {
          const { result } = res;

          setData(result);
        });
      }
    });
  }, []);
  const [isPadding, setTransition] = useTransition();
  const watch = useWatch({ exact: true, control });
  const { tableEl } = useMemo(() => {
    var total_debit: number = 0;
    var total_credit: number = 0;
    var total_rate: number = 0;

    const grouped: {
      [key in $Enums.DigitType]?: {
        data: CommonData[];
        name: string;
        total_debit: number;
        total_credit: number;
        total_rate_debit: number;
        total_rate_credit: number;
      };
    } = {};

    data.map((data) => {
      const tempData: CommonData & {
        total_debit: number;
        total_credit: number;
        total_rate: number;
      } = { ...data, total_credit: 0, total_debit: 0, total_rate: 0 };

      data.subEntires = data.subEntires;
      const types = data.type ?? "Others";
      data.subEntires.map((ress) => {
        if (ress.type === "Debit") {
          tempData.total_debit += ress.amount;
          tempData.total_rate += watch.currency
            ? ress.amount / watch.currency.rate
            : 0;
          total_debit += ress.amount;
        } else {
          tempData.total_credit += ress.amount;
          tempData.total_rate -= watch.currency
            ? ress.amount / watch.currency.rate
            : 0;
          total_credit += ress.amount;
        }
      });
      if (grouped[types]) {
        grouped[types].data.push(tempData);
      } else {
        grouped[types] = {
          data: [tempData],
          name: types,
          total_credit: 0,
          total_debit: 0,
          total_rate: 0,
        };
      }
      tempData.subEntires.map((res) => {
        if (res.type === "Debit") {
          grouped[types].total_debit += res.amount;
          grouped[types].total_rate += watch.currency
            ? res.amount / watch.currency.rate
            : 0;
        } else {
          grouped[types].total_credit += res.amount;
          grouped[types].total_rate -= watch.currency
            ? res.amount / watch.currency.rate
            : 0;
        }
      });
    });

    const tableEl: any[] = Object.keys(grouped).map((res) => {
      const result = grouped[res];

      return (
        <>
          <TableRow key={res}>
            <TableCell></TableCell>
            <TableCell className="font-bold">{result.name}</TableCell>
            <TableCell className="font-bold">
              {watch.currency?.symbol}
              {FormatNumberWithFixed(result.total_debit)}
            </TableCell>
            <TableCell className="font-bold">
              {watch.currency?.symbol}
              {FormatNumberWithFixed(result.total_credit)}
            </TableCell>
            <TableCell className="font-bold">
              {watch.currency?.symbol}
              {FormatNumberWithFixed(result.total_debit - result.total_credit)}
            </TableCell>
            {watch.currency?.rate && (
              <TableCell className="font-bold">
                $
                {FormatNumberWithFixed(
                  (result.total_debit - result.total_credit) /
                    watch.currency.rate
                )}
              </TableCell>
            )}
          </TableRow>
          {result.data.map((res, i) => {
            return (
              <TableRow key={res.id}>
                <TableCell>{res.id}</TableCell>
                <TableCell>{res.name}</TableCell>
                <TableCell>
                  {watch.currency?.symbol ?? ""}
                  {FormatNumberWithFixed(res.total_debit)}
                </TableCell>
                <TableCell>
                  {watch.currency?.symbol ?? ""}
                  {FormatNumberWithFixed(res.total_credit)}
                </TableCell>
                <TableCell>
                  {watch.currency?.symbol ?? ""}
                  {FormatNumberWithFixed(res.total_debit - res.total_credit)}
                </TableCell>
                {watch.currency.rate && (
                  <TableCell>
                    {" "}
                    $
                    {FormatNumberWithFixed(
                      (res.total_debit - res.total_credit) / watch.currency.rate
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </>
      );
    });
    if (tableEl.length > 0) {
      tableEl.push(
        <TableRow>
          <TableCell align="left">Total</TableCell>
          <TableCell></TableCell>
          <TableCell>
            {" "}
            {watch.currency?.symbol ?? ""}
            {FormatNumberWithFixed(total_debit)}
          </TableCell>
          <TableCell>
            {" "}
            {watch.currency?.symbol ?? ""}
            {FormatNumberWithFixed(total_credit)}
          </TableCell>

          <TableCell>
            {" "}
            {watch.currency?.symbol ?? ""}
            {FormatNumberWithFixed(total_debit - total_credit)}
          </TableCell>
          {watch.currency.rate && (
            <TableCell> ${FormatNumberWithFixed(total_rate)}</TableCell>
          )}
        </TableRow>
      );
    }

    return { tableEl };
  }, [data]);
  const tableRef = useRef();
  return (
    <Style>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className=" grid grid-cols-1  md:grid-cols-2   gap-4  h-full  overflow-auto  justify-between rms-container p-5">
          <div className="gap-5 flex flex-col">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="from"
                control={control}
                render={({ field, fieldState }) => (
                  <DatePicker
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                    label="From Date"
                    value={dayjs(field.value)}
                    onChange={(e) => {
                      field.onChange(e.startOf("D").toDate());
                    }}
                  />
                )}
              />
              <Controller
                name="to"
                control={control}
                render={({ field, fieldState }) => (
                  <DatePicker
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                    label="To Date"
                    value={dayjs(field.value)}
                    onChange={(e) => {
                      field.onChange(e.endOf("D").toDate());
                    }}
                  />
                )}
              />
            </LocalizationProvider>
            <Controller
              name="currency"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Autocomplete
                    fullWidth
                    isOptionEqualToValue={(e) => field.value?.id === e.id}
                    disablePortal
                    size="small"
                    key={"Two Digits"}
                    value={field.value}
                    onChange={(e, f) => {
                      field.onChange(f);
                    }}
                    getOptionLabel={(e) => `${e.symbol}`}
                    options={props.currencies}
                    disableCloseOnSelect
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(fieldState.error)}
                        className="nexcite-input"
                        label="Currencies"
                      />
                    )}
                  />
                </>
              )}
            />
          </div>

          <div className="gap-5 flex flex-col">
            <Controller
              name="account"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Autocomplete
                    fullWidth
                    isOptionEqualToValue={(e) => field.value?.id === e.id}
                    disablePortal
                    size="small"
                    value={field.value}
                    onChange={(e, f) => {
                      field.onChange(f);
                    }}
                    getOptionLabel={(e) => `${e.username}`}
                    options={props.accounts}
                    disableCloseOnSelect
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(fieldState.error)}
                        className="nexcite-input"
                        label="Accounts"
                      />
                    )}
                  />
                </>
              )}
            />
            <Controller
              name={"two_digits"}
              control={control}
              render={({ field, fieldState, formState }) => (
                <div className="flex gap-5 items-center">
                  <Checkbox
                    disabled={
                      watch.more_digits?.length > 0 ||
                      watch.three_digits?.length > 0
                    }
                    checked={field.value.length === props.two_digits.length}
                    onChange={(e) => {
                      if (field.value.length === props.two_digits.length) {
                        field.onChange([]);
                      } else {
                        field.onChange(props.two_digits);
                      }
                    }}
                    // disabled={
                    //   watch.more_digits.length > 0 ||
                    //   watch.three_digits.length > 0
                    // }
                  ></Checkbox>
                  <Autocomplete
                    fullWidth
                    isOptionEqualToValue={(e) =>
                      field.value.find((res) => res.id === e.id)?.id
                        ? true
                        : false
                    }
                    disabled={
                      watch.more_digits?.length > 0 ||
                      watch.three_digits?.length > 0
                    }
                    disablePortal
                    size="small"
                    key={"Two Digits"}
                    // isOptionEqualToValue={(e) => e.id === watch.two_digit?.id}
                    value={field.value}
                    multiple
                    onChange={(e, f) => {
                      field.onChange(f);
                    }}
                    disableCloseOnSelect
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option.id + option.name}>
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
                    limitTags={2}
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
                </div>
              )}
            />

            <Controller
              name={"three_digits"}
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex gap-5 items-center">
                  <Checkbox
                    disabled={
                      watch.more_digits.length > 0 ||
                      watch.two_digits.length > 0
                    }
                    checked={field.value.length === props.three_digits.length}
                    onChange={(e) => {
                      if (field.value.length === props.three_digits.length) {
                        field.onChange([]);
                      } else {
                        field.onChange(props.three_digits);
                      }
                    }}
                  ></Checkbox>
                  <Autocomplete
                    disabled={
                      watch.more_digits.length > 0 ||
                      watch.two_digits.length > 0
                    }
                    fullWidth
                    isOptionEqualToValue={(e) =>
                      field.value.find((res) => res.id === e.id)?.id
                        ? true
                        : false
                    }
                    disablePortal
                    size="small"
                    key={"Three Digits"}
                    // isOptionEqualToValue={(e) => e.id === watch.two_digit?.id}
                    value={field.value}
                    multiple
                    onChange={(e, f) => {
                      field.onChange(f);
                    }}
                    disableCloseOnSelect
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option.id + option.name}>
                        {" "}
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
                        label="Three Digits"
                      />
                    )}
                    limitTags={2}
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
                </div>
              )}
            />
            <Controller
              name={"more_digits"}
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex gap-5 items-center">
                  <Checkbox
                    disabled={
                      watch.two_digits.length > 0 ||
                      watch.three_digits.length > 0
                    }
                    checked={field.value.length === props.more_digits.length}
                    onChange={(e) => {
                      if (field.value.length === props.more_digits.length) {
                        field.onChange([]);
                      } else {
                        field.onChange(props.more_digits);
                      }
                    }}
                  ></Checkbox>
                  <Autocomplete
                    fullWidth
                    isOptionEqualToValue={(e) =>
                      field.value.find((res) => res.id === e.id)?.id
                        ? true
                        : false
                    }
                    disabled={
                      watch.two_digits.length > 0 ||
                      watch.three_digits.length > 0
                    }
                    disablePortal
                    size="small"
                    key={"More Digits"}
                    // isOptionEqualToValue={(e) => e.id === watch.two_digit?.id}
                    value={field.value}
                    multiple
                    onChange={(e, f) => {
                      field.onChange(f);
                    }}
                    disableCloseOnSelect
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option.id + option.name}>
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
                    options={props.more_digits}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        className="nexcite-input"
                        label="More Digits"
                      />
                    )}
                    limitTags={2}
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
                </div>
              )}
            />
          </div>

          <div className="flex items-center w-full  h-[30px]">
            <div>
              <Controller
                name="include_reference"
                control={control}
                render={({ field }) => (
                  <>
                    <label>Include Reffrence</label>

                    <Switch
                      name="switch"
                      onChange={(e, f) => {
                        field.onChange(f);
                      }}
                      checked={field.value}
                    />
                  </>
                )}
              />
            </div>
          </div>
        </div>
        <div className="mb-5 flex flex-row-reverse gap-5">
          <NexCiteButton
            type="submit"
            className="max-w-xs"
            label="Search"
            icon={<MdSearch />}
          ></NexCiteButton>

          {data.length > 0 && (
            <DownloadTableExcel
              filename={
                (watch.two_digits.length > 0
                  ? `two_digit`
                  : watch.three_digits.length > 0
                  ? `three_digit`
                  : "four_digit") +
                `_${watch.from.toLocaleDateString()}_${watch.to.toLocaleDateString()}`
              }
              sheet={"digits"}
              currentTableRef={tableRef.current}
            >
              <NexCiteButton
                className="max-w-xs"
                label="Export"
                icon={<MdDownload />}
                type="button"
              ></NexCiteButton>
            </DownloadTableExcel>
          )}
        </div>
      </form>

      <Card variant="outlined">
        <CardHeader
          title={
            <div className="flex items-center justify-between">
              <Typography variant="h5">Digit State Table</Typography>
            </div>
          }
        />

        <TableContainer>
          {isPadding ? (
            <div className="p-5">
              <Loading />
            </div>
          ) : (
            <Table size="small" ref={tableRef}>
              <TableHead>
                <TableRow>
                  <TableCell style={{ textAlign: "start" }}>
                    {watch.from.toLocaleDateString()} -{" "}
                    {watch.to.toLocaleDateString()}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  {watch.currency?.rate && <TableCell></TableCell>}
                </TableRow>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Debit</TableCell>
                  <TableCell>Credit</TableCell>
                  <TableCell>Amount</TableCell>
                  {watch.currency?.rate && <TableCell>Total Rate</TableCell>}
                </TableRow>
              </TableHead>

              <TableBody>{tableEl}</TableBody>
            </Table>
          )}
        </TableContainer>

        <Divider />
      </Card>
    </Style>
  );
}

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

const Style = styled.div`
  table {
    td,
    th {
      font-size: 13pt;
      align-items: center;
      text-align: center;
    }
  }
`;
