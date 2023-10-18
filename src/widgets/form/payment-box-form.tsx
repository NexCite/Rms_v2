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
  AlertTitle,
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
  deletePaymentBoxById,
  updatePaymentBox,
} from "@rms/service/payment-box-service";
import Loading from "@rms/components/ui/loading";

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
  value: Prisma.PaymentBoxGetPayload<{
    select: {
      agent_boxes: true;
      client_boxes: true;
      p_l: true;
      coverage_boxes: true;
      expensive_box: true;
      to_date: true;
      description: true;
    };
  }>;
  paymentBoxes: Prisma.PaymentBoxGetPayload<{}>[];
}

interface PaymentBoxType extends BoxesTypes {
  description: string;
  to_date: Date;
}

export default function PaymentBoxForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();

  const formSchema = z.object({
    description: z.string().min(3),
    to_date: z.date(),
    coverage: z
      .array(
        z.object({
          account: z.string(),
          starting_float: z.number().min(0),
          current_float: z.number().min(0),
          closed_p_l: z.number().min(0),
        })
      )
      .min(1),
    clients: z
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
        })
      )
      .min(1),
    agents: z
      .array(
        z.object({
          name: z
            .string()
            .min(1, { message: "Name must be at least 1 characters" }),
          commission: z.number().min(0),
        })
      )
      .min(1),
    p_l: z
      .array(
        z.object({
          name: z
            .string()
            .min(1, { message: "Name must be at least 1 characters" }),
          p_l: z.number().min(0),
        })
      )
      .min(1),
    expensive: z
      .array(
        z.object({
          name: z
            .string()
            .min(1, { message: "Name must be at least 1 characters" }),
          expensive: z.number().min(0),
        })
      )
      .min(1),
  });

  const [errors, setErrors] = useState<{ index?: number; message: string }[]>(
    []
  );

  const { createAlert } = useAlertHook();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: props.value?.description || "",
      to_date: props.value?.to_date || dayjs(),
      clients: props.value?.client_boxes || [],
      agents: props.value?.agent_boxes || [],
      coverage: props.value?.coverage_boxes || [],
      expensive: props.value?.expensive_box || [],
      p_l: props.value?.p_l || [],
    } as any,
  });

  const handleSubmit = useCallback(
    (values) => {
      var formsData = {
        description: values.description,
        to_date: values.to_date,
        client_boxes: values.clients,
        expensive_box: values.expensive,
        p_l: values.p_l,
        agent_boxes: values.agents,
        coverage_boxes: values.coverage,
      };

      const result = formSchema.safeParse(formsData);
      // form.clearErrors([
      //   "description",
      // ]);

      const error = [];

      values.agents.forEach((element, i) => {
        if (!element.commission || !element.name) {
          error.push({
            message: "Make sure to fill all fields for agent boxes",
            index: i + 1,
          });
        }
      });

      values.clients.forEach((element, i) => {
        if (
          !element.commission ||
          !element.current_float ||
          !element.p_l ||
          !element.manger ||
          !element.starting_float ||
          !element.swap
        ) {
          error.push({
            message: "Make sure to fill all fields for client boxes",
            index: i + 1,
          });
        }
      });

      values.coverage.forEach((element, i) => {
        if (
          !element.account ||
          !element.closed_p_l ||
          !element.starting_float ||
          !element.current_float
        ) {
          error.push({
            message: "Make sure to fill all fields for coverage boxes",
            index: i + 1,
          });
        }
      });

      values.expensive.forEach((element, i) => {
        if (!element.expensive || !element.name) {
          error.push({
            message: "Make sure to fill all fields for expensive boxes",
            index: i + 1,
          });
        }
      });

      values.p_l.forEach((element, i) => {
        if (!element.p_l || !element.name) {
          error.push({
            message: "Make sure to fill all fields for p_l boxes",
            index: i + 1,
          });
        }
      });

      if (error.length > 0) {
        setErrors(errors.concat(error));
        return;
      }

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
      //     "description",
      //   ]);

      setTransition(async () => {
        if (props.id) {
          [
            "p_l",
            "expensive_box",
            "client_boxes",
            "coverage_boxes",
            "agent_boxes",
          ].forEach((item) => {
            formsData[item].map((element) => {
              element["payment_box_id"] = props.id;
            });
          });
        }

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
    },
    [props, formSchema, back, form]
  );

  const [loadingUi, setLoadingUi] = useState(true);
  useEffect(() => {
    setLoadingUi(false);
  }, [props.value]);

  return (
    <form
      className="max-w-[450px] m-auto"
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      {loadingUi ? (
        <Loading />
      ) : (
        <Card>
          <CardHeader
            title={
              <div className="flex justify-between items-center flex-row">
                <Typography variant="h5">Payment Box Form</Typography>
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
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  required
                  multiline
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
              name={"to_date" as any}
              render={({ field, fieldState }) => (
                <FormControl {...field} size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      minDate={dayjs().subtract(7, "day")}
                      label="Date"
                      slotProps={{
                        textField: {
                          size: "small",
                          required: true,
                          error: Boolean(fieldState?.error),
                          helperText: fieldState?.error?.message,
                        },
                      }}
                      defaultValue={dayjs(field.value)}
                      onChange={(e) => {
                        field.onChange(e?.toDate());
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
            <Controller
              control={form.control}
              name="clients"
              render={({ field, fieldState }) => {
                return (
                  <>
                    {Boolean(fieldState.error?.message) && (
                      <Alert variant="outlined" severity="error">
                        <AlertTitle>
                          {fieldState.error.message.replaceAll("#space#", "\n")}
                        </AlertTitle>
                      </Alert>
                    )}

                    {field.value?.map((res, i) => (
                      <div className="mb-5 " key={i}>
                        <div className="flex justify-between items-center">
                          <h1>Client Box: {i + 1}</h1>
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
                            type="text"
                            label="Manger"
                            value={res.manger}
                            required
                            onChange={(e) => {
                              field.value[i].manger = e.target.value;

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "manger")
                            )}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            type="number"
                            label="Swap"
                            value={res.swap}
                            required
                            onChange={(e) => {
                              if (Number.isNaN(e.target.value)) {
                                field.value[i].swap = 1;
                              } else {
                                field.value[i].swap = +e.target.value;
                              }

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "swap")
                            )}
                            helperText={`${FormatNumberWithFixed(
                              res.swap ?? 0
                            )}  ${checkBoxesError(fieldState, i, "swap")}`}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            type="number"
                            label="Starting Float"
                            value={res.starting_float}
                            required
                            onChange={(e) => {
                              if (Number.isNaN(e.target.value)) {
                                field.value[i].starting_float = 1;
                              } else {
                                field.value[i].starting_float = +e.target.value;
                              }

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "starting_float")
                            )}
                            helperText={`${FormatNumberWithFixed(
                              res.starting_float ?? 0
                            )}  ${checkBoxesError(
                              fieldState,
                              i,
                              "starting_float"
                            )}`}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            type="number"
                            label="Current Float"
                            value={res.current_float}
                            required
                            onChange={(e) => {
                              if (Number.isNaN(e.target.value)) {
                                field.value[i].current_float = 1;
                              } else {
                                field.value[i].current_float = +e.target.value;
                              }

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "current_float")
                            )}
                            helperText={`${FormatNumberWithFixed(
                              res.current_float ?? 0
                            )}  ${checkBoxesError(
                              fieldState,
                              i,
                              "current_float"
                            )}`}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            type="number"
                            label="P_L"
                            value={res.p_l}
                            required
                            onChange={(e) => {
                              if (Number.isNaN(e.target.value)) {
                                field.value[i].p_l = 1;
                              } else {
                                field.value[i].p_l = +e.target.value;
                              }

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "p_l")
                            )}
                            helperText={`${FormatNumberWithFixed(
                              res.p_l ?? 0
                            )}  ${checkBoxesError(fieldState, i, "p_l")}`}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            type="number"
                            label="Commission"
                            value={res.commission}
                            required
                            onChange={(e) => {
                              if (Number.isNaN(e.target.value)) {
                                field.value[i].commission = 1;
                              } else {
                                field.value[i].commission = +e.target.value;
                              }

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "commission")
                            )}
                            helperText={`${FormatNumberWithFixed(
                              res.commission ?? 0
                            )}  ${checkBoxesError(
                              fieldState,
                              i,
                              "commission"
                            )}`}
                          />
                        </div>
                        {/* {i !== forms.clients.length - 1 && (
                          <hr className="my-1 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
                        )} */}
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
                          form.setValue(
                            "clients",
                            form.watch("clients").concat([
                              {
                                starting_float: 1,
                                current_float: 1,
                                p_l: 1,
                                commission: 1,
                                swap: 1,
                                manger: "",
                              },
                            ])
                          );
                        }}
                      >
                        <PlusSquare />
                      </Button>
                    </div>
                  </>
                );
              }}
            />
            {/* ************Client Boxes End************ */}

            {/* ************Expensive Boxes start************ */}
            <div style={{ margin: "0px 0px 0px" }}>
              <h1 className="text-2xl">Expensive</h1>
            </div>
            <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
            <Controller
              control={form.control}
              name="expensive"
              render={({ field, fieldState }) => {
                return (
                  <>
                    {Boolean(fieldState.error?.message) && (
                      <Alert variant="outlined" severity="error">
                        <AlertTitle>
                          {fieldState.error.message.replaceAll("#space#", "\n")}
                        </AlertTitle>
                      </Alert>
                    )}

                    {field.value?.map((res, i) => (
                      <div className="mb-5 " key={i}>
                        <div className="flex justify-between items-center">
                          <h1>Expensive Box: {i + 1}</h1>
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
                            size="small"
                            type="text"
                            label="Name"
                            value={res.name}
                            required
                            onChange={(e) => {
                              field.value[i].name = e.target.value;

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "name")
                            )}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            type="number"
                            label="Expensive"
                            value={res.expensive}
                            required
                            onChange={(e) => {
                              if (Number.isNaN(e.target.value)) {
                                field.value[i].expensive = 1;
                              } else {
                                field.value[i].expensive = +e.target.value;
                              }

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "expensive")
                            )}
                            helperText={`${FormatNumberWithFixed(
                              res.expensive ?? 0
                            )}  ${checkBoxesError(fieldState, i, "expensive")}`}
                          />
                        </div>
                        {/* {i !== forms.expensive.length - 1 && (
                          <hr className="my-1 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
                        )} */}
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
                          form.setValue(
                            "expensive",
                            form.watch("expensive").concat([
                              {
                                expensive: 1,
                                name: "",
                              },
                            ])
                          );
                        }}
                      >
                        <PlusSquare />
                      </Button>
                    </div>
                  </>
                );
              }}
            />
            {/* ************Expensive Boxes End************ */}

            {/* ************P_L Boxes start************ */}
            <div style={{ margin: "0px 0px 0px" }}>
              <h1 className="text-2xl">P_L</h1>
            </div>
            <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
            <Controller
              control={form.control}
              name="p_l"
              render={({ field, fieldState }) => {
                return (
                  <>
                    {Boolean(fieldState.error?.message) && (
                      <Alert variant="outlined" severity="error">
                        <AlertTitle>
                          {fieldState.error.message.replaceAll("#space#", "\n")}
                        </AlertTitle>
                      </Alert>
                    )}

                    {field.value?.map((res, i) => (
                      <div className="mb-5 " key={i}>
                        <div className="flex justify-between items-center">
                          <h1>P_L Box: {i + 1}</h1>
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
                            type="text"
                            label="Name"
                            placeholder="name"
                            value={res.name}
                            required
                            onChange={(e) => {
                              field.value[i].name = e.target.value;

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "name")
                            )}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            type="number"
                            label="P_l"
                            value={res.p_l}
                            required
                            onChange={(e) => {
                              if (Number.isNaN(e.target.value)) {
                                field.value[i].p_l = 1;
                              } else {
                                field.value[i].p_l = +e.target.value;
                              }

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "p_l")
                            )}
                            helperText={`${FormatNumberWithFixed(
                              res.p_l ?? 0
                            )}  ${checkBoxesError(fieldState, i, "p_l")}`}
                          />
                        </div>
                        {/* {i !== forms.p_l.length - 1 && (
                          <hr className="my-1 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
                        )} */}
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
                          form.setValue(
                            "p_l",
                            form.watch("p_l").concat([
                              {
                                p_l: 1,
                                name: "",
                              },
                            ])
                          );
                        }}
                      >
                        <PlusSquare />
                      </Button>
                    </div>
                  </>
                );
              }}
            />
            {/* ************P_L Boxes End************ */}

            {/* ************Agent Boxes start************ */}
            <div style={{ margin: "0px 0px 0px" }}>
              <h1 className="text-2xl">Agents</h1>
            </div>
            <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
            <Controller
              control={form.control}
              name="agents"
              render={({ field, fieldState }) => {
                return (
                  <>
                    {Boolean(fieldState.error?.message) && (
                      <Alert variant="outlined" severity="error">
                        <AlertTitle>
                          {fieldState.error.message.replaceAll("#space#", "\n")}
                        </AlertTitle>
                      </Alert>
                    )}
                    {field.value?.map((res, i) => (
                      <div className="mb-5 " key={i}>
                        <div className="flex justify-between items-center">
                          <h1>Agent Box: {i + 1}</h1>
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
                            type="text"
                            label="Name"
                            value={res.name}
                            required
                            onChange={(e) => {
                              field.value[i].name = e.target.value;

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "name")
                            )}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            type="number"
                            label="Commission"
                            value={res.commission}
                            required
                            onChange={(e) => {
                              if (Number.isNaN(e.target.value)) {
                                field.value[i].commission = 1;
                              } else {
                                field.value[i].commission = +e.target.value;
                              }

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "commission")
                            )}
                            helperText={`${FormatNumberWithFixed(
                              res.commission ?? 0
                            )}  ${checkBoxesError(
                              fieldState,
                              i,
                              "commission"
                            )}`}
                          />
                        </div>
                        {/* {i !== forms.agents.length - 1 && (
                          <hr className="my-1 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
                        )} */}
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
                          form.setValue(
                            "agents",
                            form.watch("agents").concat([
                              {
                                commission: 1,
                                name: "",
                              },
                            ])
                          );
                        }}
                      >
                        <PlusSquare />
                      </Button>
                    </div>
                  </>
                );
              }}
            />
            {/* ************Agent Boxes End************ */}

            {/* ************Coverage Boxes start************ */}
            <div style={{ margin: "0px 0px 0px" }}>
              <h1 className="text-2xl">Coverage</h1>
            </div>
            <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
            <Controller
              control={form.control}
              name="coverage"
              render={({ field, fieldState }) => {
                return (
                  <>
                    {Boolean(fieldState.error?.message) && (
                      <Alert variant="outlined" severity="error">
                        <AlertTitle>
                          {fieldState.error.message.replaceAll("#space#", "\n")}
                        </AlertTitle>
                      </Alert>
                    )}
                    {field.value?.map((res, i) => (
                      <div className="mb-5 " key={i}>
                        <div className="flex justify-between items-center">
                          <h1>Coverage Box: {i + 1}</h1>
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
                            type="text"
                            label="Account"
                            value={res.account}
                            required
                            onChange={(e) => {
                              field.value[i].account = e.target.value;

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "account")
                            )}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            type="number"
                            label="Starting Float"
                            value={res.starting_float}
                            required
                            onChange={(e) => {
                              if (Number.isNaN(e.target.value)) {
                                field.value[i].starting_float = 1;
                              } else {
                                field.value[i].starting_float = +e.target.value;
                              }

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "starting_float")
                            )}
                            helperText={`${FormatNumberWithFixed(
                              res.starting_float ?? 0
                            )}  ${checkBoxesError(
                              fieldState,
                              i,
                              "starting_float"
                            )}`}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            type="number"
                            label="Current Float"
                            value={res.current_float}
                            required
                            onChange={(e) => {
                              if (Number.isNaN(e.target.value)) {
                                field.value[i].current_float = 1;
                              } else {
                                field.value[i].current_float = +e.target.value;
                              }

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "current_float")
                            )}
                            helperText={`${FormatNumberWithFixed(
                              res.current_float ?? 0
                            )}  ${checkBoxesError(
                              fieldState,
                              i,
                              "current_float"
                            )}`}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            type="number"
                            label="Closed P_l"
                            value={res.closed_p_l}
                            required
                            onChange={(e) => {
                              if (Number.isNaN(e.target.value)) {
                                field.value[i].closed_p_l = 1;
                              } else {
                                field.value[i].closed_p_l = +e.target.value;
                              }

                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "closed_p_l")
                            )}
                            helperText={`${FormatNumberWithFixed(
                              res.closed_p_l ?? 0
                            )}  ${checkBoxesError(
                              fieldState,
                              i,
                              "closed_p_l"
                            )}`}
                          />
                        </div>
                        {/* {i !== forms.coverage.length - 1 && (
                          <hr className="my-1 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
                        )} */}
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
                          form.setValue(
                            "coverage",
                            form.watch("coverage").concat([
                              {
                                starting_float: 1,
                                current_float: 1,
                                closed_p_l: 1,
                                account: "",
                              },
                            ])
                          );
                        }}
                      >
                        <PlusSquare />
                      </Button>
                    </div>
                  </>
                );
              }}
            />
            {/* ************Coverage Boxes End************ */}
          </CardContent>
        </Card>
      )}
    </form>
  );
}

function checkBoxesError(props: any, index: number, name: string) {
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
