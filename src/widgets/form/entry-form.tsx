"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, Prisma } from "@prisma/client";
import { Button } from "@rms/components/ui/button";

import { FormatNumberWithFixed } from "@rms/lib/global";
import { createEntry, updateEntry } from "@rms/service/entry-service";
import { PlusSquare, X } from "lucide-react";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Loading from "@rms/components/ui/loading";
import NumericFormatCustom from "@rms/components/ui/text-field-number";
import { useStore } from "@rms/hooks/toast-hook";
import { Activity, ActivityStatus } from "@rms/models/CommonModel";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { MdOutlineKeyboardArrowUp } from "react-icons/md";
import { z } from "zod";
import UploadWidget from "../upload/upload-widget";

interface Props {
  id?: number;
  entry?: Prisma.EntryGetPayload<{
    include: {
      sub_entries: true;
      media: true;
    };
  }>;
  activity?: Activity;
  isEditMode?: boolean;
  more_than_four_digit: {
    three_digit: {
      id: number;
      name: string;
    };
    id: number;
    name: string;
  }[];
  two_digit: {
    id: number;
    name: string;
    create_date: Date;
    modified_date: Date;
    status: $Enums.Status;
    user_id: number;
    type: $Enums.DigitType;
    debit_credit: $Enums.DebitCreditType;
  }[];
  three_digit: {
    id: number;
    name: string;
    two_digit: {
      id: number;
      name: string;
    };
  }[];

  account_entry: {
    id: number;
    username: string;
    type: $Enums.Account_Entry_Type;
  }[];

  currencies: Prisma.CurrencyGetPayload<{}>[];
}

export default function EntryForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();

  const formSchema = z
    .object({
      includeRate: z.boolean().default(props.entry?.rate ? true : false),
      title: z.string().min(3),
      description: z.string().min(3),
      note: z.string().optional(),
      currency_id: z.number(),
      sub_entries: z
        .array(
          z.object({
            type: z.enum([
              $Enums.DebitCreditType.Debit,
              $Enums.DebitCreditType.Credit,
            ]),
            amount: z.number().or(
              z
                .string()
                .regex(/^-?\d+(\.\d{1,2})?$/)
                .transform(Number)
            ),
            account_entry_id: z.number().optional().nullable(),
            three_digit_id: z.number().optional().nullable(),
            two_digit_id: z.number().optional().nullable(),
            reference_id: z.number().optional().nullable(),

            more_than_four_digit_id: z.number().optional().nullable(),
          })
        )
        .min(2),
      media: z
        .object({
          path: z.string().optional(),
          type: z.enum([$Enums.MediaType.Pdf]).default("Pdf").optional(),
          title: z.string().optional(),
        })
        .optional(),
      to_date: z.date(),
    })
    .optional()
    .nullable();

  const store = useStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: props.activity
      ? {
          description: props.activity.description,
          note: props.activity.note,
          to_date: new Date(props.activity.create_date),
          currency_id: (() =>
            props.currencies.find(
              (res) => res.symbol === props.activity.client.currency.symbol
            )?.id ?? undefined)(),
          sub_entries: [],
        }
      : {
          to_date: props.entry?.to_date ?? new Date(),
          description: props.entry?.description ?? undefined,
          note: props.entry?.note ?? undefined,
          title: props.entry?.title ?? undefined,
          currency_id: props.entry?.currency_id ?? undefined,

          includeRate: props.entry?.rate ? true : false,
          sub_entries:
            props.entry?.sub_entries?.map((res) => ({
              amount: res.amount,
              account_entry_id: res.account_entry_id,
              more_than_four_digit_id: res.more_than_four_digit_id,
              reference_id: res.reference_id,
              three_digit_id: res.three_digit_id,
              two_digit_id: res.two_digit_id,
              type: res.type,
            })) ?? [],
          media: props.isEditMode
            ? undefined
            : props.entry?.media?.path
            ? {
                path: props.entry?.media?.path,
                type: "Pdf",
                title: props.entry?.media?.title,
              }
            : undefined,
        },
  });
  const { totalCredit, totalDebit, totalUnkown } = useMemo(() => {
    var totalDebit = 0,
      totalCredit = 0,
      totalUnkown = 0;
    form.watch("sub_entries").map((res) => {
      switch (res.type) {
        case "Credit":
          totalCredit += res.amount;
          break;
        case "Debit":
          totalDebit += res.amount;
          break;
        default:
          totalUnkown += res.amount;
          break;
      }
    });
    return { totalDebit, totalCredit, totalUnkown };
  }, [form, form.watch("sub_entries"), form.watch("currency_id")]);
  const handleSubmit = useCallback(
    (values) => {
      var m: Prisma.EntryUncheckedCreateInput;
      m = {
        description: values.description,
        title: values.title,
        to_date: values.to_date,
        note: values.note,
        currency_id: values.currency_id,
        sub_entries: {
          createMany: {
            data: values.sub_entries.map((res) => ({
              amount: parseFloat(res.amount + ""),
              status: "Enable",
              type: res.type,
              account_entry_id:
                res.account_entry_id === 0 ? undefined : res.account_entry_id,
              two_digit_id:
                res.two_digit_id === 0 ? undefined : res.two_digit_id,
              three_digit_id:
                res.three_digit_id === 0 ? undefined : res.three_digit_id,
              more_than_four_digit_id:
                res.more_than_four_digit_id === 0
                  ? undefined
                  : res.more_than_four_digit_id,
              reference_id:
                res.reference_id === 0 ? undefined : res.reference_id,
            })),
          },
        },
        media: values.media
          ? {
              create: {
                path: values?.media.path,
                title: values?.title,
                type: "Pdf",
                file_name: (() => {
                  var filename = values.media?.path?.split("/");
                  return filename[filename.length - 1];
                })(),
              },
            }
          : undefined,
      };

      const error = [];
      var debit = 0;
      var credit = 0;
      values.sub_entries.map((res, i) => {
        if (res.type === "Debit") debit += res.amount;
        else if (res.type === "Credit") credit += res.amount;
        if (
          !res.three_digit_id &&
          !res.more_than_four_digit_id &&
          !res.account_entry_id &&
          !res.two_digit_id
        ) {
          error.push({ index: i + 1, message: "Missing  client or level" });
        }
        if (!res.type) {
          error.push({ index: i + 1, message: "Missing  type" });
        }
      });

      if (debit - credit !== 0)
        error.push({
          index: undefined,
          message: "Debit must be equal Credit",
        });

      if (error.length > 0) {
        form.setError("sub_entries", {
          message: error
            .map(
              (res) =>
                (res.index ? `<div>SubEntry Index (${res.index}):` : "") +
                ` ${res.message}</div>`
            )
            .join(""),
          type: "required",
        });
        return;
      }

      setTransition(async () => {
        if (props.entry) {
          const result = await updateEntry(props.id, m, values.includeRate);
          store.OpenAlert(result);
          if (result.status === 200) {
            back();
          }
        } else {
          const result = await createEntry(
            m,
            values.includeRate,

            props.activity
              ? { id: props.activity.id, status: ActivityStatus.Provided }
              : undefined
          );
          store.OpenAlert(result);
          if (result.status === 200) {
            back();
          }
        }
      });
    },
    [props, back, form, store]
  );
  const [loadingUi, setLoadingUi] = useState(true);
  useEffect(() => {
    setLoadingUi(false);
  }, []);

  const currency = useMemo(() => {
    var currency_id = form.watch("currency_id");
    if (currency_id) {
      const currency = props.currencies.find((res) => res.id === currency_id);
      if (currency?.rate) {
        return { rate: currency.rate, symbol: currency.symbol };
      }
      return undefined;
    }
  }, [form, props.currencies, form.watch("currency_id")]);
  return (
    <form
      className="max-w-[450px] m-auto"
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      {loadingUi ? (
        <Loading />
      ) : (
        <Card className="">
          {props.entry?.rate}
          {props.activity && (
            <div className="  entry-form-size:absolute top-[80px]   end-[2%] entry-form-size:max-w-xs  w-full    ">
              <Accordion
                defaultExpanded
                variant="outlined"
                elevation={0}
                className="rounded-none"
              >
                <AccordionSummary expandIcon={<MdOutlineKeyboardArrowUp />}>
                  <Typography className="text-2xl">
                    Activity Information
                  </Typography>
                </AccordionSummary>
                <Divider />
                <AccordionDetails className="p-0">
                  <Card
                    className="  w-full  entry-form-size:max-h-[600px]  max-h-full overflow-auto  border-none"
                    variant="outlined"
                  >
                    <CardContent className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <Typography className="text-xl">Activty Id</Typography>
                        <Typography className="text-xl">
                          {props.activity.id}
                        </Typography>
                      </div>

                      <div className="flex justify-between items-center">
                        <Typography className="text-xl">Currency</Typography>
                        <Typography className="text-xl">
                          {props.activity.client.currency.symbol}
                        </Typography>
                      </div>

                      <div className="flex justify-between items-center">
                        <Typography className="text-xl">Account Id</Typography>
                        <Typography className="text-xl">
                          {props.activity.account_id}
                        </Typography>
                      </div>
                      <div className="flex justify-between items-center">
                        <Typography className="text-xl">Client </Typography>
                        <Typography className="text-xl">
                          {props.activity.client.username}
                        </Typography>
                      </div>
                      <div className="flex justify-between items-center">
                        <Typography className="text-xl">Client Id</Typography>
                        <Typography className="text-xl">
                          {props.activity.client.id}
                        </Typography>
                      </div>

                      <div className="flex justify-between items-center">
                        <Typography className="text-xl">Amount</Typography>
                        <Typography className="text-xl">
                          {props.activity.client.currency.symbol}{" "}
                          {FormatNumberWithFixed(props.activity.amount)}
                        </Typography>
                      </div>
                      <div className="flex justify-between items-center">
                        <Typography className="text-xl">
                          Activity Type
                        </Typography>
                        <Typography className="text-xl">
                          {props.activity.type}
                        </Typography>
                      </div>

                      <div className="flex justify-between items-start flex-col gap-2 border rounded-sm p-2">
                        <Typography className="text-2xl">
                          Description
                        </Typography>

                        <Typography className="text-xl">
                          {props.activity.description}{" "}
                        </Typography>
                      </div>

                      <div className="flex justify-between items-start flex-col gap-2 border rounded-sm p-2">
                        <Typography className="text-2xl">Note</Typography>

                        <Typography className="text-xl">
                          {props.activity.note}{" "}
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>
            </div>
          )}

          <CardHeader
            title={
              <div className="flex justify-between items-center flex-row">
                <Typography variant="h5">Entry From</Typography>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  className={
                    isPadding
                      ? ""
                      : "hover:bg-blue-gray-900  hover:text-brown-50 capitalize bg-black text-white w-[150px]"
                  }
                  disableElevation
                  loading={isPadding}
                >
                  Save
                </LoadingButton>
              </div>
            }
          ></CardHeader>
          <Divider />
          <CardContent className="flex gap-5 flex-col">
            <>
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    InputLabelProps={{ shrink: true }}
                    required
                    value={field.value}
                    error={Boolean(fieldState.error)}
                    label="Title"
                    size="small"
                    fullWidth
                    helperText={fieldState?.error?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    InputLabelProps={{ shrink: true }}
                    required
                    multiline
                    disabled={Boolean(props.activity)}
                    minRows={3}
                    maxRows={5}
                    error={Boolean(fieldState.error)}
                    label="Description"
                    size="small"
                    fullWidth
                    value={field.value}
                    helperText={fieldState?.error?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="note"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    InputLabelProps={{ shrink: true }}
                    disabled={Boolean(props.activity)}
                    multiline
                    minRows={3}
                    maxRows={5}
                    error={Boolean(fieldState.error)}
                    label="Note"
                    size="small"
                    fullWidth
                    value={field.value}
                    helperText={fieldState?.error?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="currency_id"
                render={({ field, fieldState }) => (
                  <Autocomplete
                    size="small"
                    disabled={Boolean(
                      props.activity
                        ? props.currencies.find(
                            (res) =>
                              res.symbol ===
                              props.activity.client.currency.symbol
                          ) ?? false
                        : false
                    )}
                    isOptionEqualToValue={(e) => e.value === field.value}
                    value={(() => {
                      const currnecy = props.currencies.find(
                        (res) => res.id === field.value
                      );

                      return currnecy
                        ? { label: currnecy.symbol, value: currnecy.id }
                        : undefined;
                    })()}
                    onChange={(e, v) => field.onChange(v?.value)}
                    renderInput={(params) => (
                      <TextField
                        {...field}
                        error={Boolean(fieldState.error)}
                        helperText={fieldState?.error?.message}
                        {...params}
                        InputLabelProps={{ shrink: true }}
                        label="Currency"
                        required
                      />
                    )}
                    options={props.currencies.map((res) => ({
                      label: res.symbol,
                      value: res.id,
                    }))}
                  />
                )}
              />
              <Controller
                control={form.control}
                name={"to_date" as any}
                render={({ field, fieldState }) => (
                  <FormControl {...field} size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        disabled={Boolean(props.activity)}
                        minDate={dayjs().subtract(7, "day")}
                        label="Date"
                        maxDate={dayjs()}
                        slotProps={{
                          textField: {
                            size: "small",
                            required: true,
                            error: Boolean(fieldState?.error),
                            helperText: fieldState?.error?.message,
                          },
                        }}
                        value={dayjs(field.value)}
                        onChange={(e) => {
                          field.onChange(e?.toDate());
                        }}
                      />
                    </LocalizationProvider>
                  </FormControl>
                )}
              />
              <Controller
                control={form.control}
                name={"includeRate"}
                render={({ field, fieldState }) =>
                  currency?.rate ? (
                    <FormControl {...field} size="small">
                      <h1>Include Rate</h1>
                      <Switch
                        checked={field.value}
                        onChange={(e, v) => {
                          field.onChange(v);
                        }}
                      />
                    </FormControl>
                  ) : (
                    <></>
                  )
                }
              />

              <div className="grid-cols-12">
                <Controller
                  control={form.control}
                  name="media"
                  render={({ field, fieldState }) => (
                    <UploadWidget
                      isPdf
                      path={field.value?.path}
                      onSave={(e) => {
                        field.onChange(
                          e
                            ? {
                                path: e,
                                title: form.getValues("title"),
                                type: "Pdf",
                              }
                            : undefined
                        );
                      }}
                    />
                  )}
                />
              </div>
            </>

            <>
              <div style={{ margin: "0px 0px 0px" }}>
                <h1 className="text-2xl">Entries</h1>
              </div>
              <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
              {
                <Controller
                  control={form.control}
                  name="sub_entries"
                  render={({ field, fieldState }) => {
                    return (
                      <>
                        {Boolean(fieldState.error?.message) && (
                          <Alert variant="outlined" severity="error">
                            <AlertTitle>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: fieldState.error.message,
                                }}
                              ></div>
                            </AlertTitle>
                          </Alert>
                        )}
                        <div>
                          <div className="flex flex-wrap gap-5 justify-between mb-5">
                            <h1>
                              Total Debit:{" "}
                              {FormatNumberWithFixed(
                                parseFloat(totalDebit + "")
                              )}
                            </h1>
                            <h1>
                              Total Credit:{" "}
                              {FormatNumberWithFixed(
                                parseFloat(totalCredit + "")
                              )}
                            </h1>
                            <h1>
                              Total Unkown:{" "}
                              {FormatNumberWithFixed(
                                parseFloat(totalUnkown + "")
                              )}
                            </h1>

                            {currency && (
                              <h1>
                                Rate:{" "}
                                {FormatNumberWithFixed(
                                  currency?.rate,
                                  2
                                ).replace(".00", "")}
                              </h1>
                            )}
                          </div>
                          <Divider />
                        </div>
                        {field.value?.map((res, i) => (
                          <div className="mb-5 " key={i}>
                            <div className="flex justify-between items-center">
                              <h1>SubEntry: {i + 1}</h1>
                              <Button
                                onClick={() => {
                                  field.onChange(
                                    field.value.filter((res, ii) => i !== ii)
                                  );
                                }}
                                size="sm"
                                className="bg-black"
                                color="dark"
                                type="button"
                              >
                                <X size="15" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                              <TextField
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                label="Amount"
                                value={res.amount}
                                required
                                InputProps={{
                                  inputComponent: NumericFormatCustom as any,
                                }}
                                onChange={(e) => {
                                  field.value[i].amount = e.target.value as any;
                                  field.onChange(field.value);
                                }}
                                error={Boolean(
                                  checkSubEntriesError(fieldState, i, "amount")
                                )}
                                helperText={` ${checkSubEntriesError(
                                  fieldState,
                                  i,
                                  "amount"
                                )}`}
                              />

                              <Autocomplete
                                value={
                                  !res.type
                                    ? null
                                    : { label: res.type, value: res.type }
                                }
                                size="small"
                                onChange={(e, v) => {
                                  field.value[i].type = v?.value as any;
                                  field.onChange(field.value);
                                }}
                                options={Object.keys(
                                  $Enums.DebitCreditType
                                ).map((res) => ({ label: res, value: res }))}
                                isOptionEqualToValue={(ress) =>
                                  res.type === (ress.value as any)
                                }
                                renderInput={(params) => (
                                  <TextField
                                    required
                                    {...params}
                                    InputLabelProps={{ shrink: true }}
                                    label="Type"
                                    error={Boolean(
                                      checkSubEntriesError(
                                        fieldState,
                                        i,
                                        "type"
                                      )
                                    )}
                                    helperText={checkSubEntriesError(
                                      fieldState,
                                      i,
                                      "type"
                                    )}
                                  />
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1  md:grid-cols-2 gap-4 mt-3">
                              <Autocomplete
                                isOptionEqualToValue={(ress) =>
                                  ress.value === res.two_digit_id
                                }
                                value={
                                  props.two_digit
                                    .filter(
                                      (ress) => ress.id === res.two_digit_id
                                    )
                                    .map((res) => ({
                                      label: `(${res.id}) ${res.name}`,
                                      value: res.id,
                                    }))[0] || null
                                }
                                size="small"
                                onChange={(e, v) => {
                                  field.value[i].two_digit_id = v?.value;
                                  field.onChange(field.value);
                                }}
                                options={props.two_digit.map((res) => ({
                                  label: `(${res.id}) ${res.name}`,
                                  value: res.id,
                                }))}
                                disabled={
                                  res.three_digit_id
                                    ? true
                                    : res.more_than_four_digit_id
                                    ? true
                                    : res.account_entry_id
                                    ? true
                                    : false
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    InputLabelProps={{ shrink: true }}
                                    label="Two And More"
                                  />
                                )}
                              />
                              <Autocomplete
                                disablePortal
                                size="small"
                                value={
                                  props.three_digit
                                    .filter(
                                      (ress) => ress.id === res.three_digit_id
                                    )
                                    .map((res) => ({
                                      label: `(${res.id}) ${res.name}`,
                                      value: res.id,
                                    }))[0] || null
                                }
                                onChange={(e, v) => {
                                  field.value[i].three_digit_id = v?.value;
                                  field.onChange(field.value);
                                }}
                                options={props.three_digit.map((res) => ({
                                  label: `(${res.id}) ${res.name}`,
                                  value: res.id,
                                }))}
                                isOptionEqualToValue={(ress) =>
                                  ress.value === res.three_digit_id
                                }
                                disabled={
                                  res.two_digit_id
                                    ? true
                                    : res.more_than_four_digit_id
                                    ? true
                                    : res.account_entry_id
                                    ? true
                                    : false
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    InputLabelProps={{ shrink: true }}
                                    label="Three And More"
                                  />
                                )}
                              />

                              <Autocomplete
                                disablePortal
                                size="small"
                                value={
                                  props.more_than_four_digit
                                    .filter(
                                      (ress) =>
                                        ress.id === res.more_than_four_digit_id
                                    )
                                    .map((res) => ({
                                      label: `(${res.id}) ${res.name}`,
                                      value: res.id,
                                    }))[0] || null
                                }
                                onChange={(e, v) => {
                                  field.value[i].more_than_four_digit_id =
                                    v?.value;
                                  field.onChange(field.value);
                                }}
                                options={props.more_than_four_digit.map(
                                  (res) => ({
                                    label: `(${res.id}) ${res.name}`,
                                    value: res.id,
                                  })
                                )}
                                disabled={
                                  res.three_digit_id
                                    ? true
                                    : res.two_digit_id
                                    ? true
                                    : res.account_entry_id
                                    ? true
                                    : false
                                }
                                isOptionEqualToValue={(ress) =>
                                  ress.value === res.more_than_four_digit_id
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    InputLabelProps={{ shrink: true }}
                                    label="Four And More"
                                  />
                                )}
                              />

                              <Autocomplete
                                disablePortal
                                size="small"
                                value={
                                  props.account_entry
                                    .filter(
                                      (ress) => ress.id === res.account_entry_id
                                    )
                                    .map((res) => ({
                                      label: `(${res.id}) ${res.username}`,
                                      value: res.id,
                                      group: res.type,
                                    }))[0] || null
                                }
                                onChange={(e, v) => {
                                  field.value[i].account_entry_id = v?.value;
                                  field.onChange(field.value);
                                }}
                                isOptionEqualToValue={(ress) =>
                                  ress.value === res.account_entry_id
                                }
                                groupBy={(res) => res.group}
                                options={props.account_entry.map((res) => ({
                                  label: `(${res.id}) ${res.username}`,
                                  value: res.id,
                                  group: res.type,
                                }))}
                                disabled={
                                  res.three_digit_id
                                    ? true
                                    : res.two_digit_id
                                    ? true
                                    : res.reference_id
                                    ? true
                                    : res.more_than_four_digit_id
                                    ? true
                                    : false
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    InputLabelProps={{ shrink: true }}
                                    label="Account"
                                  />
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-3">
                              <Autocomplete
                                disablePortal
                                isOptionEqualToValue={(ress) =>
                                  ress.value === res.reference_id
                                }
                                size="small"
                                value={
                                  props.account_entry
                                    .filter(
                                      (ress) => ress.id === res.reference_id
                                    )
                                    .map((res) => ({
                                      label: `(${res.id}) ${res.username}`,
                                      value: res.id,
                                      group: res.type,
                                    }))[0] || null
                                }
                                onChange={(e, v) => {
                                  field.value[i].reference_id = v?.value;
                                  field.onChange(field.value);
                                }}
                                groupBy={(res) => res.group}
                                options={props.account_entry.map((res) => ({
                                  label: `(${res.id}) ${res.username}`,
                                  value: res.id,
                                  group: res.type,
                                }))}
                                disabled={res.account_entry_id ? true : false}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    InputLabelProps={{ shrink: true }}
                                    label="Reference Account"
                                  />
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </>
                    );
                  }}
                />
              }
            </>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 10,
              }}
            >
              <Button
                type="button"
                className="bg-black"
                color="dark"
                onClick={() => {
                  form.setValue(
                    "sub_entries",
                    form
                      .watch("sub_entries")
                      .concat([{ amount: 1, type: $Enums.EntryType.Debit }])
                  );
                }}
              >
                <PlusSquare />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}

//  <ActionIcon
// variant="filled"
// color="dark"
// size={"lg"}
// onClick={() => {
//   setForms(forms.filter((res, ii) => i !== ii));
// }}
// >
// <MdDelete size={25} />
// </ActionIcon>

function checkSubEntriesError(props: any, index: number, name: string) {
  if (Boolean(props.error)) {
    if (Boolean(props.error))
      switch (Boolean(props.error.message)) {
        case true:
          if (Boolean(props.error[index]))
            return props.error[index][name]?.message ?? "";

        default:
          if (Boolean(props.error[index]))
            return props.error[index][name]?.message ?? "";
      }
  }

  return "";
}
