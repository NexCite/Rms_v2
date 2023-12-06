"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, Prisma } from "@prisma/client";

import { FormatNumberWithFixed } from "@rms/lib/global";
import { saveEntry } from "@rms/service/entry-service";
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
  IconButton,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NexCiteButton from "@rms/components/button/nexcite-button";
import Loading from "@rms/components/ui/loading";
import NumericFormatCustom from "@rms/components/ui/text-field-number";
import { useStore } from "@rms/hooks/toast-hook";
import { fileZod, mediaZod } from "@rms/lib/common";
import { Activity, ActivityStatus } from "@rms/models/CommonModel";
import dayjs from "dayjs";
import { MuiFileInput } from "mui-file-input";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  MdAttachFile,
  MdClose,
  MdDelete,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { z } from "zod";

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
    type: $Enums.DigitType;

    three_digit: {
      id: number;
      name: string;
      type: $Enums.DigitType;
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
    type: $Enums.DigitType;

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
      file: fileZod.optional().nullable(),
      media: mediaZod.optional().nullable(),
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
          media: props.entry?.media,
        },
  });
  const watch = useWatch({ control: form.control });
  const defaultSelect = useMemo(() => {
    return watch.sub_entries.map((res, i) => ({
      two_digit: res.two_digit_id
        ? props.two_digit.find((digit) => digit.id === res.two_digit_id)
        : null,
      more_digit: res.more_than_four_digit_id
        ? props.more_than_four_digit.find(
            (digit) => digit.id === res.more_than_four_digit_id
          )
        : null,
      account: res.account_entry_id
        ? props.account_entry.find((digit) => digit.id === res.account_entry_id)
        : null,
      reference: res.reference_id
        ? props.account_entry.find((digit) => digit.id === res.reference_id)
        : null,

      three_digit: res.three_digit_id
        ? props.three_digit.find((digit) => digit.id === res.three_digit_id)
        : null,
    }));
  }, [watch.sub_entries]);

  const defaultImage = useMemo(() => {
    const file = watch.file;
    const media = watch.media;
    if (file) {
      return URL.createObjectURL(file);
    }
    if (media) {
      return media;
    }
  }, [watch.file, watch.media]);
  const { totalCredit, totalDebit, totalUnkown } = useMemo(() => {
    var totalDebit = 0,
      totalCredit = 0,
      totalUnkown = 0;
    watch.sub_entries.map((res) => {
      switch (res.type) {
        case "Credit":
          totalCredit += parseFloat(res.amount as any);
          break;
        case "Debit":
          totalDebit += parseFloat(res.amount as any);
          break;
        default:
          totalUnkown += parseFloat(res.amount as any);
          break;
      }
    });
    return { totalDebit, totalCredit, totalUnkown };
  }, [watch.sub_entries]);

  const handleSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
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
      var dataForm = new FormData();

      if (values.file) {
        dataForm.append("file", values.file);
      } else {
        dataForm = undefined;
      }

      setTransition(async () => {
        const result = await saveEntry({
          id: props.entry?.id,

          entry: {
            currency_id: values.currency_id,
            description: values.description,
            title: values.title,
            note: values.note,
            to_date: values.to_date,
          },
          subEntries: values.sub_entries as any,
          activity: props.activity
            ? { id: props.activity.id, status: ActivityStatus.Provided }
            : undefined,
          file: dataForm,
          includeRate: values.includeRate,
          media: values.media
            ? {
                file_name: values.media.file_name,
                path: values.media.path,
                type: values.media.type,
                title: values.media.title,
              }
            : undefined,
        });
        store.OpenAlert(result);
        if (result.status === 200) {
          back();
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
    var currency_id = watch.currency_id;
    if (currency_id) {
      const currency = props.currencies.find((res) => res.id === currency_id);
      if (currency?.rate) {
        return { rate: currency.rate, symbol: currency.symbol };
      }
      return undefined;
    }
  }, [props.currencies, watch.currency_id]);
  return (
    <form
      className="max-w-[700px] m-auto"
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      {loadingUi ? (
        <Loading />
      ) : (
        <Card className="">
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
                <Typography variant="h5" className="w-full">
                  Entry From
                </Typography>
                <NexCiteButton isPadding={isPadding} />
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
                    onChange={(e) => field.onChange(e.target.value)}
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
                    onChange={(e) => field.onChange(e.target.value)}
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
                    onChange={(e) => field.onChange(e.target.value)}
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

              <Controller
                control={form.control}
                name="file"
                render={({ field, fieldState }) => (
                  <>
                    {!defaultImage && (
                      <MuiFileInput
                        value={field.value}
                        label={"Append File"}
                        {...field}
                        error={Boolean(fieldState.error)}
                        helperText={fieldState?.error?.message}
                        clearIconButtonProps={{
                          children: <MdClose fontSize="small" />,
                        }}
                        InputProps={{
                          inputProps: {
                            accept: ".pdf",
                          },
                          startAdornment: <MdAttachFile />,
                        }}
                      />
                    )}
                    <div className="mt-3">
                      {defaultImage && typeof defaultImage === "string" ? (
                        <div>
                          <LoadingButton
                            color="error"
                            loading={isPadding}
                            onClick={() => {
                              setTransition(async () => {
                                field.onChange();
                              });
                            }}
                            startIcon={<MdDelete />}
                          ></LoadingButton>
                          <iframe
                            src={defaultImage}
                            className="w-full  h-[450px] "
                          />
                        </div>
                      ) : typeof defaultImage === "object" ? (
                        <div>
                          <LoadingButton
                            loading={isPadding}
                            onClick={() => {
                              setTransition(async () => {
                                form.setValue("media", undefined);
                              });
                            }}
                            color="error"
                            startIcon={<MdDelete />}
                          >
                            Delete
                          </LoadingButton>
                          <iframe
                            className="w-full  h-[450px] "
                            src={`/api/media/${defaultImage.path}`}
                          ></iframe>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </>
                )}
              />
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
                              <IconButton
                                onClick={() => {
                                  field.onChange(
                                    field.value.filter((res, ii) => i !== ii)
                                  );
                                }}
                              >
                                <X size="15" />
                              </IconButton>
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
                                value={res.type}
                                size="small"
                                onChange={(e, v) => {
                                  field.value[i].type = v as any;
                                  field.onChange(field.value);
                                }}
                                options={Object.keys($Enums.DebitCreditType)}
                                isOptionEqualToValue={(ress) =>
                                  res.type === ress
                                }
                                getOptionLabel={(e) => e}
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
                                disablePortal
                                size="small"
                                groupBy={(e) => e.type}
                                value={defaultSelect[i].two_digit}
                                onChange={(e, v) => {
                                  field.value[i].more_than_four_digit_id = null;
                                  field.value[i].account_entry_id = null;
                                  field.value[i].three_digit_id = null;
                                  field.value[i].two_digit_id = v?.id;
                                  field.onChange(field.value);
                                }}
                                options={props.two_digit}
                                getOptionLabel={(e) => `(${e.id}) ${e.name}`}
                                isOptionEqualToValue={(ress) =>
                                  ress.id === res.two_digit_id
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    InputLabelProps={{ shrink: true }}
                                    label="Two Or More Digit"
                                  />
                                )}
                              />
                              <Autocomplete
                                disablePortal
                                groupBy={(e) => e.type ?? ""}
                                size="small"
                                value={defaultSelect[i].three_digit}
                                onChange={(e, v) => {
                                  field.value[i].more_than_four_digit_id = null;
                                  field.value[i].account_entry_id = null;
                                  field.value[i].two_digit_id = null;
                                  field.value[i].three_digit_id = v?.id;
                                  field.onChange(field.value);
                                }}
                                options={props.three_digit}
                                getOptionLabel={(e) => `(${e.id}) ${e.name}`}
                                isOptionEqualToValue={(ress) =>
                                  ress.id === res.three_digit_id
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    InputLabelProps={{ shrink: true }}
                                    label="Three Or More Digit"
                                  />
                                )}
                              />

                              <Autocomplete
                                disablePortal
                                groupBy={(e) => e.type}
                                size="small"
                                value={defaultSelect[i].more_digit}
                                onChange={(e, v) => {
                                  field.value[i].three_digit_id = null;
                                  field.value[i].account_entry_id = null;
                                  field.value[i].two_digit_id = null;
                                  field.value[i].more_than_four_digit_id =
                                    v?.id;
                                  field.onChange(field.value);
                                }}
                                options={props.more_than_four_digit}
                                getOptionLabel={(e) => `(${e.id}) ${e.name}`}
                                isOptionEqualToValue={(ress) =>
                                  ress.id === res.more_than_four_digit_id
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    InputLabelProps={{ shrink: true }}
                                    label="Four Or More Digit"
                                  />
                                )}
                              />
                              <Autocomplete
                                groupBy={(e) => e.type}
                                disablePortal
                                size="small"
                                value={defaultSelect[i].account}
                                onChange={(e, v) => {
                                  field.value[i].three_digit_id = null;
                                  field.value[i].more_than_four_digit_id = null;
                                  field.value[i].two_digit_id = null;
                                  field.value[i].reference_id = null;

                                  field.value[i].account_entry_id = v?.id;
                                  field.onChange(field.value);
                                }}
                                options={props.account_entry}
                                getOptionLabel={(e) =>
                                  `(${e.id}) ${e.username}`
                                }
                                isOptionEqualToValue={(ress) =>
                                  ress.id === res.account_entry_id
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
                                groupBy={(e) => e.type}
                                disablePortal
                                size="small"
                                value={defaultSelect[i].reference}
                                onChange={(e, v) => {
                                  field.value[i].account_entry_id = null;

                                  field.value[i].reference_id = v?.id;
                                  field.onChange(field.value);
                                }}
                                options={props.account_entry}
                                getOptionLabel={(e) =>
                                  `(${e.id}) ${e.username}`
                                }
                                isOptionEqualToValue={(ress) =>
                                  ress.id === res.reference_id
                                }
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
              <IconButton
                onClick={() => {
                  form.setValue(
                    "sub_entries",
                    watch.sub_entries.concat([
                      { amount: 1, type: $Enums.EntryType.Debit },
                    ])
                  );
                }}
              >
                <PlusSquare />
              </IconButton>
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
