"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, Prisma } from "@prisma/client";
import { Button } from "@rms/components/ui/button";

import { FormatNumberWithFixed } from "@rms/lib/global";
import { createEntry, updateEntry } from "@rms/service/entry-service";
import { PlusSquare, X } from "lucide-react";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Alert,
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import UploadWidget from "../upload/upload-widget";
import { useStore } from "@rms/hooks/toast-hook";

interface Props {
  id?: number;
  entry?: Prisma.EntryGetPayload<{ include: { media: true } }>;
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
type Type = {
  title?: string;
  description: string;
  note?: string;
  to_date?: Date;
  sub_entries?: Prisma.SubEntryCreateManyInput[];
  media?: Prisma.MediaCreateNestedOneWithoutEntryInput;
  currency_id: number;
};

export default function EntryForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();
  const [forms, setForms] = useState<Type>({
    title: props.entry?.title,
    description: props.entry?.description,
    note: props.entry?.note,
    currency_id: props.entry?.currency_id,
    sub_entries: [],
    to_date: new Date(),
  });

  const formSchema = props.isEditMode
    ? z.object({
        title: z.string().min(3),
        description: z.string().min(3),
        note: z.string().optional(),
        currency_id: z.number(),
      })
    : z.object({
        title: z.string().min(3),
        description: z.string().min(3),
        note: z.string().optional(),
        currency_id: z.number(),
        sub_entries: z.object({
          createMany: z.object({
            data: z
              .array(
                z.object({
                  type: z.enum([
                    $Enums.DebitCreditType.Debit,
                    $Enums.DebitCreditType.Credit,
                  ]),
                  amount: z.number().min(0),
                  account_entry_id: z.number().optional(),
                  three_digit_id: z.number().optional(),
                  two_digit_id: z.number().optional(),
                  reference_id: z.number().optional(),

                  more_than_four_digit_id: z.number().optional(),
                })
              )
              .min(2),
          }),
        }),
        media: z
          .object({
            create: z.object({
              path: z.string(),
              type: z.enum([$Enums.MediaType.Pdf]).default("Pdf"),
              title: z.string(),
            }),
          })
          .optional(),
        to_date: z.date(),
      });

  const [errors, setErrors] = useState<{ index?: number; message: string }[]>(
    []
  );

  const store = useStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: props.entry,
  });

  useEffect(() => {
    if (props.isEditMode) {
      setForms(props.entry as any);
    }
  }, [props.isEditMode, props.entry]);

  const [media, setMedia] = useState<Prisma.MediaGetPayload<{}>>();

  const handleSubmit = useCallback(() => {
    var m: Prisma.EntryUncheckedCreateInput;
    m = {
      description: forms.description,
      title: forms.title,
      to_date: forms.to_date,
      note: forms.note,
      currency_id: forms.currency_id,
      sub_entries: props.isEditMode
        ? undefined
        : {
            createMany: {
              data: forms.sub_entries.map((res) => ({
                amount: res.amount,
                status: res.status,
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
      media: media
        ? {
            create: {
              path: media.path,
              title: media.title,
              type: "Pdf",
            },
          }
        : undefined,
    };
    const result = formSchema.safeParse(m);
    form.clearErrors([
      "currency_id",
      "description",
      "description",
      "note",
      "title",
    ]);

    const error = [];
    var debit = 0;
    var credit = 0;
    if (!props.isEditMode) {
      forms.sub_entries.map((res, i) => {
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
      setErrors(error);
    }
    if (forms.sub_entries.length < 1) {
      return setErrors(
        error.concat([{ message: "SubEntry must be not empty" }])
      );
    }

    if (result.success === false) {
      return Object.keys(result.error.formErrors.fieldErrors).map((res) => {
        form.setError(res as any, {
          message: result.error.formErrors.fieldErrors[res][0],
        });
      });
    } else if (error.length > 0) {
      return;
    } else {
      form.clearErrors([
        "currency_id",
        "description",
        "description",
        "note",
        "title",
      ]);
      setTransition(async () => {
        if (props.isEditMode) {
          const result = await updateEntry(props.id, {
            title: m.title,
            currency_id: m.currency_id,
            description: m.description,
            note: m.note,
          });
          store.OpenAlert(result);
          if (result.status === 200) {
            back();
          }
        } else {
          const result = await createEntry(m);
          store.OpenAlert(result);
          if (result.status === 200) {
            back();
          }
        }
      });
    }
  }, [props, forms, media, formSchema, back, form, store]);

  return (
    <form className="max-w-[450px] m-auto" noValidate>
      <Card>
        {errors.length > 0 && (
          <Alert severity="error">
            {errors.map((res) => (
              <h4 key={res.index}>
                {res.message} SubEntry {res.index && <span>{res.index}</span>}
              </h4>
            ))}
          </Alert>
        )}
        <CardHeader
          title={
            <div className="flex justify-between items-center flex-row">
              <Typography variant="h5">Entry From</Typography>
              <LoadingButton
                onClick={(e) => {
                  handleSubmit();
                }}
                variant="contained"
                className="hover:bg-blue-gray-900  hover:text-brown-50 capitalize bg-black text-white w-[150px]"
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
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <TextField
                InputLabelProps={{ shrink: true }}
                required
                {...field}
                error={Boolean(fieldState.error)}
                label="Title"
                size="small"
                fullWidth
                value={forms.title}
                helperText={fieldState?.error?.message}
                onChange={(e) => {
                  setForms((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }));
                }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <TextField
                InputLabelProps={{ shrink: true }}
                required
                {...field}
                multiline
                minRows={3}
                maxRows={5}
                error={Boolean(fieldState.error)}
                label="Description"
                size="small"
                fullWidth
                defaultValue={field.value}
                helperText={fieldState?.error?.message}
                onChange={(e) => {
                  setForms((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="note"
            render={({ field, fieldState }) => (
              <TextField
                InputLabelProps={{ shrink: true }}
                {...field}
                multiline
                minRows={3}
                maxRows={5}
                error={Boolean(fieldState.error)}
                label="Note"
                size="small"
                fullWidth
                defaultValue={field.value}
                helperText={fieldState?.error?.message}
                onChange={(e) => {
                  setForms((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }));
                }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="currency_id"
            render={({ field, fieldState }) => (
              <Autocomplete
                size="small"
                isOptionEqualToValue={(e) => e.value === forms.currency_id}
                defaultValue={(() => {
                  const currnecy = props.currencies.find(
                    (res) => res.id === forms.currency_id
                  );

                  return currnecy
                    ? { label: currnecy.symbol, value: currnecy.id }
                    : undefined;
                })()}
                onChange={(e, v) =>
                  setForms((prev) => ({ ...prev, currency_id: v?.value }))
                }
                renderInput={(params) => (
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...field}
                    value={forms.currency_id}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState?.error?.message}
                    {...params}
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
                    value={dayjs(forms.to_date)}
                    onChange={(e) => {
                      setForms((prev) => ({
                        ...prev,
                        to_date: e?.toDate(),
                      }));
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            )}
          />

          <div className="grid-cols-12">
            {!props.isEditMode && (
              <UploadWidget
                isPdf
                onSave={(e) => {
                  setMedia({ path: e, title: e, type: "Pdf" } as any);
                }}
              />
            )}
          </div>
          {!props.isEditMode && (
            <>
              <div style={{ margin: "0px 0px 0px" }}>
                <h1 className="text-2xl">Entries</h1>
              </div>
              <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
              {forms?.sub_entries?.map((res, i) => (
                <div className="mb-5 " key={i}>
                  <div className="flex justify-between items-center">
                    <h1>SubEntry: {i + 1}</h1>
                    {forms.sub_entries.length}
                    <Button
                      onClick={() => {
                        setErrors([]);
                        console.log(i, forms.sub_entries.length);
                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries.filter(
                            (res, ii) => i !== ii
                          ),
                        }));
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
                      type="number"
                      label="Amount"
                      value={res.amount}
                      required
                      onChange={(e) => {
                        if (Number.isNaN(e.target.value)) {
                          forms.sub_entries[i].amount = 1;
                        } else {
                          forms.sub_entries[i].amount = +e.target.value;
                        }

                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries,
                        }));
                      }}
                      helperText={`${FormatNumberWithFixed(res.amount ?? 0)}`}
                    />

                    <Autocomplete
                      disablePortal
                      isOptionEqualToValue={(ress) => ress == res.type}
                      size="small"
                      onChange={(e, v) => {
                        forms.sub_entries[i].type = v as any;
                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries,
                        }));
                      }}
                      value={res.type}
                      options={Object.keys($Enums.DebitCreditType)}
                      renderInput={(params) => (
                        <TextField
                          InputLabelProps={{ shrink: true }}
                          required
                          {...params}
                          label="Type"
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1  md:grid-cols-2 gap-4 mt-3">
                    <Autocomplete
                      disablePortal
                      size="small"
                      isOptionEqualToValue={(ress) =>
                        ress.value === res.two_digit_id
                      }
                      value={(() => {
                        const result = props.two_digit.find(
                          (ress) => ress.id === res.two_digit_id
                        );

                        return result
                          ? {
                              label: `(${result.id}) ${result.name}`,
                              value: result.id,
                            }
                          : undefined;
                      })()}
                      onChange={(e, v) => {
                        forms.sub_entries[i].two_digit_id = v?.value;
                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries,
                        }));
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
                          InputLabelProps={{ shrink: true }}
                          {...params}
                          label="Two And More"
                        />
                      )}
                    />
                    <Autocomplete
                      disablePortal
                      isOptionEqualToValue={(ress) =>
                        ress.value === res.three_digit_id
                      }
                      size="small"
                      value={(() => {
                        const result = props.three_digit.find(
                          (ress) => ress.id === res.three_digit_id
                        );

                        return result
                          ? {
                              label: `(${result.id}) ${result.name}`,
                              value: result.id,
                            }
                          : undefined;
                      })()}
                      onChange={(e, v) => {
                        forms.sub_entries[i].three_digit_id = v?.value;
                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries,
                        }));
                      }}
                      options={props.three_digit.map((res) => ({
                        label: `(${res.id}) ${res.name}`,
                        value: res.id,
                      }))}
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
                          InputLabelProps={{ shrink: true }}
                          {...params}
                          label="Three And More"
                        />
                      )}
                    />

                    <Autocomplete
                      isOptionEqualToValue={(ress) =>
                        ress.value === res.more_than_four_digit_id
                      }
                      disablePortal
                      value={(() => {
                        const result = props.more_than_four_digit.find(
                          (ress) => ress.id === res.more_than_four_digit_id
                        );

                        return result
                          ? {
                              label: `(${result.id}) ${result.name}`,
                              value: result.id,
                            }
                          : undefined;
                      })()}
                      size="small"
                      onChange={(e, v) => {
                        forms.sub_entries[i].more_than_four_digit_id = v?.value;
                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries,
                        }));
                      }}
                      options={props.more_than_four_digit.map((res) => ({
                        label: `(${res.id}) ${res.name}`,
                        value: res.id,
                      }))}
                      disabled={
                        res.three_digit_id
                          ? true
                          : res.two_digit_id
                          ? true
                          : res.account_entry_id
                          ? true
                          : false
                      }
                      renderInput={(params) => (
                        <TextField
                          InputLabelProps={{ shrink: true }}
                          {...params}
                          label="Four And More"
                        />
                      )}
                    />

                    <Autocomplete
                      isOptionEqualToValue={(ress) =>
                        ress.value === res.account_entry_id
                      }
                      disablePortal
                      size="small"
                      onChange={(e, v) => {
                        forms.sub_entries[i].account_entry_id = v?.value;
                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries,
                        }));
                      }}
                      value={(() => {
                        const result = props.account_entry.find(
                          (ress) => ress.id === res.account_entry_id
                        );

                        return result
                          ? {
                              label: `(${result.id}) ${result.username}`,
                              value: result.id,
                              group: result.type,
                            }
                          : undefined;
                      })()}
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
                          InputLabelProps={{ shrink: true }}
                          {...params}
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
                      value={(() => {
                        const result = props.account_entry.find(
                          (ress) => ress.id === res.reference_id
                        );

                        return result
                          ? {
                              label: `(${result.id}) ${result.username}`,
                              value: result.id,
                              group: result.type,
                            }
                          : undefined;
                      })()}
                      size="small"
                      onChange={(e, v) => {
                        forms.sub_entries[i].reference_id = v?.value;
                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries,
                        }));
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
                          InputLabelProps={{ shrink: true }}
                          {...params}
                          label="Reference Account"
                        />
                      )}
                    />
                  </div>
                  {i !== forms.sub_entries.length - 1 && (
                    <hr className="my-1 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
                  )}
                </div>
              ))}
            </>
          )}
          {!props.isEditMode && (
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
                  setForms((prev) => ({
                    ...prev,

                    sub_entries: prev.sub_entries.concat({
                      type:
                        forms.sub_entries.length === 0
                          ? "Debit"
                          : forms.sub_entries.length === 1
                          ? "Credit"
                          : undefined,
                      entry_id: undefined,

                      amount: 1,
                      two_digit_id: undefined,
                      reference_id: undefined,
                      three_digit_id: undefined,
                      more_than_four_digit_id: undefined,
                      account_entry_id: undefined,
                    }),
                  }));
                }}
              >
                <PlusSquare />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
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
