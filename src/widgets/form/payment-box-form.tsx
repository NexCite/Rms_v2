"use client";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { createEntry, updateEntry } from "@rms/service/entry-service";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FormatNumberWithFixed } from "@rms/lib/global";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@rms/components/ui/button";
import LoadingButton from "@mui/lab/LoadingButton";
import useAlertHook from "@rms/hooks/alert-hooks";
import { PlusSquare, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { z } from "zod";
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
import {
  createPaymentBox,
  updatePaymentBox,
} from "@rms/service/payment-box-service";

interface BoxesTypes {
  clients: Prisma.ClientBoxGetPayload<{}>[];
  coverage: Prisma.CoverageBoxGetPayload<{}>[];
  agents: Prisma.AgentBoxGetPayload<{}>[];
  p_l: Prisma.P_LBoxGetPayload<{}>[];
  expensive: Prisma.ExpensiveBoxGetPayload<{}>[];
}

interface Props {
  id?: number;
  isEditMode?: boolean;
  value: Prisma.PaymentBoxGetPayload<{}>;
  paymentBoxes: Prisma.PaymentBoxGetPayload<{}>[];
  relations?: BoxesTypes;
}

interface PaymentBoxType extends BoxesTypes {
  description: string;
  to_date: Date;
}

export default function PaymentBoxForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();
  const [forms, setForms] = useState<PaymentBoxType>({
    description: props.value?.description,
    to_date: new Date(),
    clients: [],
    coverage: [],
    agents: [],
    p_l: [],
    expensive: [],
  });

  const formSchema = z.object({
    description: z.string().min(3),
    to_date: z.date(),

    coverage: z.object({
      createMany: z.object({
        data: z
          .array(
            z.object({
              amount: z.number().min(0),
              starting_float: z.number().min(0),
              current_float: z.number().min(0),
              closed_p_l: z.number().min(0),
              payment_box_id: z
                .number()
                .or(z.string().regex(/^\d+$/).transform(Number)),
            })
          )
          .min(1),
      }),
    }),
    clients: z.object({
      createMany: z.object({
        data: z
          .array(
            z.object({
              manger: z
                .string()
                .min(1, { message: "Manager must be at least 1 characters" }),
              starting_float: z.number().min(0),
              current_float: z.number().min(0),
              p_l: z.number().min(0),
              commission: z.number().min(0),
              swap: z.number().min(0),
              payment_box_id: z
                .number()
                .or(z.string().regex(/^\d+$/).transform(Number)),
            })
          )
          .min(1),
      }),
    }),
    agents: z.object({
      createMany: z.object({
        data: z
          .array(
            z.object({
              name: z
                .string()
                .min(1, { message: "Name must be at least 1 characters" }),
              commission: z.number().min(0),
              payment_box_id: z
                .number()
                .or(z.string().regex(/^\d+$/).transform(Number)),
            })
          )
          .min(1),
      }),
    }),
    p_l: z.object({
      createMany: z.object({
        data: z
          .array(
            z.object({
              name: z
                .string()
                .min(1, { message: "Name must be at least 1 characters" }),
              p_l: z.number().min(0),
              payment_box_id: z
                .number()
                .or(z.string().regex(/^\d+$/).transform(Number)),
            })
          )
          .min(1),
      }),
    }),
    expensive: z.object({
      createMany: z.object({
        data: z
          .array(
            z.object({
              name: z
                .string()
                .min(1, { message: "Name must be at least 1 characters" }),
              expensive: z.number().min(0),
              payment_box_id: z
                .number()
                .or(z.string().regex(/^\d+$/).transform(Number)),
            })
          )
          .min(1),
      }),
    }),
  });

  const [errors, setErrors] = useState<{ index?: number; message: string }[]>(
    []
  );

  const { createAlert } = useAlertHook();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: props.value,
  });

  useEffect(() => {
    if (props.isEditMode) {
      setForms(props.value as any);
    }
  }, [props.isEditMode, props.value]);

  const handleSubmit = useCallback(() => {
    var formsData = {
      ...forms,
      client_boxes: forms.clients,
      expensive_box: forms.expensive,
      p_l: forms.p_l,
      agent_boxes: forms.agents,
      coverage_boxes: forms.coverage,
    };

    // var m: PaymentBoxType = forms;
    // m = {
    //   description: forms.description,
    //   title: forms.title,
    //   to_date: forms.to_date,
    //   note: forms.note,
    //   currency_id: forms.currency_id,
    //   sub_entries: props.isEditMode
    //     ? undefined
    //     : {
    //         createMany: {
    //           data: forms.sub_entries.map((res) => ({
    //             amount: res.amount,
    //             status: res.status,
    //             type: res.type,
    //             account_entry_id:
    //               res.account_entry_id === 0 ? undefined : res.account_entry_id,
    //             two_digit_id:
    //               res.two_digit_id === 0 ? undefined : res.two_digit_id,
    //             three_digit_id:
    //               res.three_digit_id === 0 ? undefined : res.three_digit_id,
    //             more_than_four_digit_id:
    //               res.more_than_four_digit_id === 0
    //                 ? undefined
    //                 : res.more_than_four_digit_id,
    //             reference_id:
    //               res.reference_id === 0 ? undefined : res.reference_id,
    //           })),
    //         },
    //       },
    // };
    // const result = formSchema.safeParse(m);
    // form.clearErrors([
    //   "currency_id",
    //   "description",
    //   "description",
    //   "note",
    //   "title",
    // ]);

    const error = [];
    // if (forms.coverage.data.length < 1) {
    //   return setErrors(
    //     error.concat([{ message: "SubEntry must be not empty" }])
    //   );
    // }

    // if (result.success === false) {
    //   return Object.keys(result.error.formErrors.fieldErrors).map((res) => {
    //     form.setError(res as any, {
    //       message: result.error.formErrors.fieldErrors[res][0],
    //     });
    //   });
    // } else if (error.length > 0) {
    //   return;
    // } else {
    //   form.clearErrors([
    //     "currency_id",
    //     "description",
    //     "description",
    //     "note",
    //     "title",
    //   ]);

    setTransition(async () => {
      if (props.isEditMode) {
        const result = await updatePaymentBox(props.id, formsData as any);
        createAlert(result);
        if (result.status === 200) {
          back();
        }
      } else {
        const result = await createPaymentBox(formsData as any);
        createAlert(result);
        if (result.status === 200) {
          back();
        }
      }
    });
    // }
  }, [props, forms, formSchema, back, form, createAlert]);

  return (
    <form className="max-w-[450px] m-auto" noValidate>
      <Card>
        {errors.length > 0 && (
          <Alert severity="error">
            {errors.map((res) => (
              <h4 key={res.index}>
                {res.message} Payment Box{" "}
                {res.index && <span>{res.index}</span>}
              </h4>
            ))}
          </Alert>
        )}
        <CardHeader
          title={
            <div className="flex justify-between items-center flex-row">
              <Typography variant="h5">Payment Box Form</Typography>
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
            name="description"
            render={({ field, fieldState }) => (
              <TextField
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

          {/* ************Client Boxes start************ */}
          <div style={{ margin: "0px 0px 0px" }}>
            <h1 className="text-2xl">Clients</h1>
          </div>
          <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
          {forms?.clients?.map((res, i) => (
            <div className="mb-5 " key={i}>
              <div className="flex justify-between items-center">
                <h1>Client Box: {i + 1}</h1>
                <Button
                  onClick={() => {
                    setErrors([]);

                    setForms((prev) => ({
                      ...prev,
                      clients: prev.clients.filter((res, ii) => i !== ii),
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
                  size="small"
                  type="text"
                  label="Manger"
                  defaultValue={res.manger}
                  required
                  onChange={(e) => {
                    forms.clients[i].manger = e.target.value;

                    setForms((prev) => ({
                      ...prev,
                      clients: prev.clients,
                    }));
                  }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Swap"
                  defaultValue={res.swap}
                  required
                  onChange={(e) => {
                    if (Number.isNaN(e.target.value)) {
                      forms.clients[i].swap = 1;
                    } else {
                      forms.clients[i].swap = +e.target.value;
                    }

                    setForms((prev) => ({
                      ...prev,
                      clients: prev.clients,
                    }));
                  }}
                  helperText={`${FormatNumberWithFixed(res.swap ?? 0)}`}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Starting Float"
                  defaultValue={res.starting_float}
                  required
                  onChange={(e) => {
                    if (Number.isNaN(e.target.value)) {
                      forms.clients[i].starting_float = 1;
                    } else {
                      forms.clients[i].starting_float = +e.target.value;
                    }

                    setForms((prev) => ({
                      ...prev,
                      clients: prev.clients,
                    }));
                  }}
                  helperText={`${FormatNumberWithFixed(
                    res.starting_float ?? 0
                  )}`}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Current Float"
                  defaultValue={res.current_float}
                  required
                  onChange={(e) => {
                    if (Number.isNaN(e.target.value)) {
                      forms.clients[i].current_float = 1;
                    } else {
                      forms.clients[i].current_float = +e.target.value;
                    }

                    setForms((prev) => ({
                      ...prev,
                      clients: prev.clients,
                    }));
                  }}
                  helperText={`${FormatNumberWithFixed(
                    res.current_float ?? 0
                  )}`}
                />
                <TextField
                  size="small"
                  type="number"
                  label="P_L"
                  defaultValue={res.p_l}
                  required
                  onChange={(e) => {
                    if (Number.isNaN(e.target.value)) {
                      forms.clients[i].p_l = 1;
                    } else {
                      forms.clients[i].p_l = +e.target.value;
                    }

                    setForms((prev) => ({
                      ...prev,
                      clients: prev.clients,
                    }));
                  }}
                  helperText={`${FormatNumberWithFixed(res.p_l ?? 0)}`}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Commission"
                  defaultValue={res.p_l}
                  required
                  onChange={(e) => {
                    if (Number.isNaN(e.target.value)) {
                      forms.clients[i].commission = 1;
                    } else {
                      forms.clients[i].commission = +e.target.value;
                    }

                    setForms((prev) => ({
                      ...prev,
                      clients: prev.clients,
                    }));
                  }}
                  helperText={`${FormatNumberWithFixed(res.commission ?? 0)}`}
                />

                <Autocomplete
                  disablePortal
                  size="small"
                  onChange={(e, v) => {
                    forms.clients[i].payment_box_id = v?.value;
                    setForms((prev) => ({
                      ...prev,
                      clients: prev.clients,
                    }));
                  }}
                  options={props.paymentBoxes.map((res) => ({
                    label: `(${res.id}) ${res.description.substring(0, 10)}`,
                    value: res.id,
                  }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Payment Box" />
                  )}
                />
              </div>
              {i !== forms.clients.length - 1 && (
                <hr className="my-1 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
              )}
            </div>
          ))}
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
                  clients: prev.clients.concat({
                    starting_float: 0,
                    current_float: 0,
                    p_l: 0,
                    commission: 0,
                    swap: 0,
                    manger: "",
                    payment_box_id: undefined,
                  } as any),
                }));
              }}
            >
              <PlusSquare />
            </Button>
          </div>
          {/* ************Client Boxes End************ */}

          {/* ************Expensive Boxes start************ */}
          <div style={{ margin: "0px 0px 0px" }}>
            <h1 className="text-2xl">Expensive</h1>
          </div>
          <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
          {forms?.expensive?.map((res, i) => (
            <div className="mb-5 " key={i}>
              <div className="flex justify-between items-center">
                <h1>Expensive Box: {i + 1}</h1>
                <Button
                  onClick={() => {
                    setErrors([]);

                    setForms((prev) => ({
                      ...prev,
                      expensive: prev.expensive.filter((res, ii) => i !== ii),
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
                  size="small"
                  type="number"
                  label="Expensive"
                  defaultValue={res.expensive}
                  required
                  onChange={(e) => {
                    if (Number.isNaN(e.target.value)) {
                      forms.expensive[i].expensive = 1;
                    } else {
                      forms.expensive[i].expensive = +e.target.value;
                    }

                    setForms((prev) => ({
                      ...prev,
                      expensive: prev.expensive,
                    }));
                  }}
                  helperText={`${FormatNumberWithFixed(res.expensive ?? 0)}`}
                />
                <TextField
                  size="small"
                  type="text"
                  label="Name"
                  defaultValue={res.name}
                  required
                  onChange={(e) => {
                    forms.expensive[i].name = e.target.value;

                    setForms((prev) => ({
                      ...prev,
                      expensive: prev.expensive,
                    }));
                  }}
                />
                <Autocomplete
                  disablePortal
                  size="small"
                  onChange={(e, v) => {
                    forms.expensive[i].payment_box_id = v?.value;
                    setForms((prev) => ({
                      ...prev,
                      expensive: prev.expensive,
                    }));
                  }}
                  options={props.paymentBoxes.map((res) => ({
                    label: `(${res.id}) ${res.description.substring(0, 10)}`,
                    value: res.id,
                  }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Payment Box" />
                  )}
                />
              </div>
              {i !== forms.expensive.length - 1 && (
                <hr className="my-1 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
              )}
            </div>
          ))}
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
                  expensive: prev.expensive.concat({
                    expensive: 0,
                    name: "",
                    payment_box_id: undefined,
                  } as any),
                }));
              }}
            >
              <PlusSquare />
            </Button>
          </div>
          {/* ************Expensive Boxes End************ */}

          {/* ************P_L Boxes start************ */}
          <div style={{ margin: "0px 0px 0px" }}>
            <h1 className="text-2xl">P_L</h1>
          </div>
          <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
          {forms?.p_l?.map((res, i) => (
            <div className="mb-5 " key={i}>
              <div className="flex justify-between items-center">
                <h1>P_L Box: {i + 1}</h1>
                <Button
                  onClick={() => {
                    setErrors([]);

                    setForms((prev) => ({
                      ...prev,
                      p_l: prev.p_l.filter((res, ii) => i !== ii),
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
                  size="small"
                  type="text"
                  label="Name"
                  defaultValue={res.name}
                  required
                  onChange={(e) => {
                    forms.p_l[i].name = e.target.value;

                    setForms((prev) => ({
                      ...prev,
                      p_l: prev.p_l,
                    }));
                  }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="P_l"
                  defaultValue={res.p_l}
                  required
                  onChange={(e) => {
                    if (Number.isNaN(e.target.value)) {
                      forms.p_l[i].p_l = 1;
                    } else {
                      forms.p_l[i].p_l = +e.target.value;
                    }

                    setForms((prev) => ({
                      ...prev,
                      p_l: prev.p_l,
                    }));
                  }}
                  helperText={`${FormatNumberWithFixed(res.p_l ?? 0)}`}
                />
                <Autocomplete
                  disablePortal
                  size="small"
                  onChange={(e, v) => {
                    forms.p_l[i].payment_box_id = v?.value;
                    setForms((prev) => ({
                      ...prev,
                      p_l: prev.p_l,
                    }));
                  }}
                  options={props.paymentBoxes.map((res) => ({
                    label: `(${res.id}) ${res.description.substring(0, 10)}`,
                    value: res.id,
                  }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Payment Box" />
                  )}
                />
              </div>
              {i !== forms.p_l.length - 1 && (
                <hr className="my-1 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
              )}
            </div>
          ))}
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
                  p_l: prev.p_l.concat({
                    p_l: 0,
                    name: "",
                    payment_box_id: undefined,
                  } as any),
                }));
              }}
            >
              <PlusSquare />
            </Button>
          </div>
          {/* ************P_L Boxes End************ */}

          {/* ************Agent Boxes start************ */}
          <div style={{ margin: "0px 0px 0px" }}>
            <h1 className="text-2xl">Agents</h1>
          </div>
          <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
          {forms?.agents?.map((res, i) => (
            <div className="mb-5 " key={i}>
              <div className="flex justify-between items-center">
                <h1>Agent Box: {i + 1}</h1>
                <Button
                  onClick={() => {
                    setErrors([]);

                    setForms((prev) => ({
                      ...prev,
                      agents: prev.agents.filter((res, ii) => i !== ii),
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
                  size="small"
                  type="text"
                  label="Name"
                  defaultValue={res.name}
                  required
                  onChange={(e) => {
                    forms.agents[i].name = e.target.value;

                    setForms((prev) => ({
                      ...prev,
                      agents: prev.agents,
                    }));
                  }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Commission"
                  defaultValue={res.commission}
                  required
                  onChange={(e) => {
                    if (Number.isNaN(e.target.value)) {
                      forms.agents[i].commission = 1;
                    } else {
                      forms.agents[i].commission = +e.target.value;
                    }

                    setForms((prev) => ({
                      ...prev,
                      agents: prev.agents,
                    }));
                  }}
                  helperText={`${FormatNumberWithFixed(res.commission ?? 0)}`}
                />
                <Autocomplete
                  disablePortal
                  size="small"
                  onChange={(e, v) => {
                    forms.agents[i].payment_box_id = v?.value;
                    setForms((prev) => ({
                      ...prev,
                      agents: prev.agents,
                    }));
                  }}
                  options={props.paymentBoxes.map((res) => ({
                    label: `(${res.id}) ${res.description.substring(0, 10)}`,
                    value: res.id,
                  }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Payment Box" />
                  )}
                />
              </div>
              {i !== forms.agents.length - 1 && (
                <hr className="my-1 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
              )}
            </div>
          ))}
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
                  agents: prev.agents.concat({
                    commission: 0,
                    name: "",
                    payment_box_id: undefined,
                  } as any),
                }));
              }}
            >
              <PlusSquare />
            </Button>
          </div>
          {/* ************Agent Boxes End************ */}

          {/* ************Coverage Boxes start************ */}
          <div style={{ margin: "0px 0px 0px" }}>
            <h1 className="text-2xl">Coverage</h1>
          </div>
          <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
          {forms?.coverage?.map((res, i) => (
            <div className="mb-5 " key={i}>
              <div className="flex justify-between items-center">
                <h1>Client Box: {i + 1}</h1>
                <Button
                  onClick={() => {
                    setErrors([]);

                    setForms((prev) => ({
                      ...prev,
                      coverage: prev.coverage.filter((res, ii) => i !== ii),
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
                  size="small"
                  type="text"
                  label="Account"
                  defaultValue={res.account}
                  required
                  onChange={(e) => {
                    forms.coverage[i].account = e.target.value;

                    setForms((prev) => ({
                      ...prev,
                      coverage: prev.coverage,
                    }));
                  }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Starting Float"
                  defaultValue={res.starting_float}
                  required
                  onChange={(e) => {
                    if (Number.isNaN(e.target.value)) {
                      forms.coverage[i].starting_float = 1;
                    } else {
                      forms.coverage[i].starting_float = +e.target.value;
                    }

                    setForms((prev) => ({
                      ...prev,
                      coverage: prev.coverage,
                    }));
                  }}
                  helperText={`${FormatNumberWithFixed(
                    res.starting_float ?? 0
                  )}`}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Current Float"
                  defaultValue={res.current_float}
                  required
                  onChange={(e) => {
                    if (Number.isNaN(e.target.value)) {
                      forms.coverage[i].current_float = 1;
                    } else {
                      forms.coverage[i].current_float = +e.target.value;
                    }

                    setForms((prev) => ({
                      ...prev,
                      coverage: prev.coverage,
                    }));
                  }}
                  helperText={`${FormatNumberWithFixed(
                    res.current_float ?? 0
                  )}`}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Closed P_l"
                  defaultValue={res.closed_p_l}
                  required
                  onChange={(e) => {
                    if (Number.isNaN(e.target.value)) {
                      forms.coverage[i].closed_p_l = 1;
                    } else {
                      forms.coverage[i].closed_p_l = +e.target.value;
                    }

                    setForms((prev) => ({
                      ...prev,
                      coverage: prev.coverage,
                    }));
                  }}
                  helperText={`${FormatNumberWithFixed(res.closed_p_l ?? 0)}`}
                />
                <Autocomplete
                  disablePortal
                  size="small"
                  onChange={(e, v) => {
                    forms.coverage[i].payment_box_id = v?.value;
                    setForms((prev) => ({
                      ...prev,
                      coverage: prev.coverage,
                    }));
                  }}
                  options={props.paymentBoxes.map((res) => ({
                    label: `(${res.id}) ${res.description.substring(0, 10)}`,
                    value: res.id,
                  }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Payment Box" />
                  )}
                />
              </div>
              {i !== forms.coverage.length - 1 && (
                <hr className="my-1 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
              )}
            </div>
          ))}
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
                  coverage: prev.coverage.concat({
                    starting_float: 0,
                    current_float: 0,
                    closed_p_l: 0,
                    account: "",
                    payment_box_id: undefined,
                  } as any),
                }));
              }}
            >
              <PlusSquare />
            </Button>
          </div>
          {/* ************Coverage Boxes End************ */}
        </CardContent>
      </Card>
    </form>
  );
}
