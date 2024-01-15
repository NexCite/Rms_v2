"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  AlertTitle,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Prisma } from "@prisma/client";
import NexciteButton from "@rms/components/button/nexcite-button";
import NexCiteButton from "@rms/components/button/nexcite-button";
import Loading from "@rms/components/other/loading";
import NumericFormatCustom from "@rms/components/input/text-field-number";
import { useToast } from "@rms/hooks/toast-hook";
import { createEquity, updateEquity } from "@rms/service/equity-service";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  MdClose,
  MdInfo,
  MdPlusOne,
  MdPrivacyTip,
  MdTipsAndUpdates,
} from "react-icons/md";
import { z } from "zod";

interface Props {
  id?: number;
  isEditMode?: boolean;
  value: Prisma.EquityGetPayload<{
    select: {
      agent_boxes: true;
      manager_boxes: true;
      p_l: true;
      coverage_boxes: true;
      expensive_box: true;
      to_date: true;
      description: true;
      adjustment_boxes: true;
      credit_boxes: true;
    };
  }>;
  Equities: Prisma.EquityGetPayload<{}>[];
}

export default function EquityForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();

  const formSchema = z.object({
    description: z.string().min(3),
    to_date: z.date(),
    coverage: z.array(
      z.object({
        account: z.string(),
        starting_float: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
        current_float: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
        closed_p_l: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
      })
    ),
    managers: z.array(
      z.object({
        manger: z
          .string()
          .min(1, { message: "Manager must be at least 1 characters" }),
        starting_float: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
        current_float: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
        p_l: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
        commission: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
        swap: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
      })
    ),
    agents: z.array(
      z.object({
        name: z
          .string()
          .min(1, { message: "Name must be at least 1 characters" }),
        commission: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
      })
    ),
    p_l: z.array(
      z.object({
        name: z
          .string()
          .min(1, { message: "Name must be at least 1 characters" }),
        p_l: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
      })
    ),
    expensive: z.array(
      z.object({
        name: z
          .string()
          .min(1, { message: "Name must be at least 1 characters" }),
        expensive: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
      })
    ),
    credit: z.array(
      z.object({
        name: z
          .string()
          .min(1, { message: "Name must be at least 1 characters" }),
        credit: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
      })
    ),
    adjustment: z.array(
      z.object({
        name: z
          .string()
          .min(1, { message: "Name must be at least 1 characters" }),
        adjustment: z.number().or(
          z
            .string()
            .regex(/^-?\d+(\.\d{1,2})?$/)
            .transform(Number)
        ),
      })
    ),
  });

  const toast = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: props.value?.description || "",
      to_date: props.value?.to_date || new Date(),
      managers: props.value?.manager_boxes || [],
      agents: props.value?.agent_boxes || [],
      coverage: props.value?.coverage_boxes || [],
      expensive: props.value?.expensive_box || [],
      credit: props.value?.credit_boxes || [],
      adjustment: props.value?.adjustment_boxes || [],

      p_l: props.value?.p_l || [],
    } as any,
  });

  const handleSubmit = useCallback(
    (values) => {
      var formsData = {
        description: values.description,
        to_date: values.to_date,
        manager_boxes: values.managers,
        expensive_box: values.expensive,
        p_l: values.p_l,
        agent_boxes: values.agents,
        coverage_boxes: values.coverage,
        adjustment_boxes: values.adjustment,
        credit_boxes: values.credit,
      };

      setTransition(async () => {
        // if (props.id) {
        //   [
        //     "p_l",
        //     "expensive_box",
        //     "manager_boxes",
        //     "coverage_boxes",
        //     "agent_boxes",
        //     "adjustment_boxes",
        //     "credit_boxes",
        //   ].forEach((item) => {
        //     formsData[item].map((element) => {
        //       element["payment_box_id"] = props.id;
        //     });
        //   });
        // }

        if (props.isEditMode) {
          const result = await updateEquity(props.id, formsData as any);
          toast.OpenAlert(result);
          if (result.status === 200) {
            back();
          }
        } else {
          const result = await createEquity(formsData as any);
          toast.OpenAlert(result);
          if (result.status === 200) {
            back();
          }
        }
      });
      // }
    },
    [props, toast, back]
  );

  const [loadingUi, setLoadingUi] = useState(true);
  useEffect(() => {
    setLoadingUi(false);
  }, [props.value]);

  const handleInput = useCallback((value: any, onChange: any) => {
    onChange(value);
  }, []);
  const watch = useWatch({ control: form.control });

  return (
    <form
      className="max-w-[550px] w-full m-auto"
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      {loadingUi ? (
        <Loading />
      ) : (
        <Card variant="outlined">
          <CardHeader
            title={
              <div className="flex justify-between items-center flex-row">
                <Typography variant="h5" className="w-full">
                  Equity Form
                </Typography>
                <NexCiteButton isPadding={isPadding} />
              </div>
            }
          ></CardHeader>
          <Divider />
          <CardContent className="flex gap-2 flex-col">
            <div className="flex gap-3 flex-col">
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
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={field.value}
                    helperText={fieldState?.error?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name={"to_date"}
                render={({ field, fieldState }) => (
                  <FormControl {...field} size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date"
                        slotProps={{
                          textField: {
                            InputLabelProps: { shrink: true },
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
            </div>
            {/* ************Coverage Boxes Start************ */}

            <div style={{ margin: "0px 0px 0px" }} className="mt-4">
              <h1 className="text-2xl">Coverage Account</h1>
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
                      <div key={i}>
                        <div className="flex justify-between items-center">
                          <h1>Index: {i + 1}</h1>
                          <NexciteButton
                            onClick={() => {
                              field.onChange(
                                field.value.filter((res, ii) => i !== ii)
                              );
                            }}
                            className="bg-black"
                            type="button"
                          >
                            <MdClose size="15" />
                          </NexciteButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
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
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            label="Starting Float"
                            value={res.starting_float}
                            required
                            onChange={(e) => {
                              field.value[i].starting_float = e.target
                                .value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "starting_float")
                            )}
                            helperText={`${checkBoxesError(
                              fieldState,
                              i,
                              "starting_float"
                            )}`}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            label="Current Float"
                            value={res.current_float}
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            required
                            onChange={(e) => {
                              field.value[i].current_float = e.target
                                .value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "current_float")
                            )}
                            helperText={`  ${checkBoxesError(
                              fieldState,
                              i,
                              "current_float"
                            )}`}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            label="Closed P_l"
                            value={res.closed_p_l}
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            required
                            onChange={(e) => {
                              field.value[i].closed_p_l = e.target.value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "closed_p_l")
                            )}
                            helperText={`${checkBoxesError(
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
                      <NexciteButton
                        type="button"
                        className="bg-black"
                        onClick={() => {
                          form.setValue(
                            "coverage",
                            watch.coverage.concat([
                              {
                                starting_float: 0,
                                current_float: 0,
                                closed_p_l: 0,
                                account: "",
                              },
                            ])
                          );
                        }}
                      >
                        <MdPlusOne />
                      </NexciteButton>
                    </div>
                  </>
                );
              }}
            />
            {/* ************Coverage Boxes End************ */}

            {/* ************Manager Boxes start************ */}
            <div style={{ margin: "0px 0px 0px" }}>
              <h1 className="text-2xl">Manager</h1>
            </div>
            <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
            <Controller
              control={form.control}
              name="managers"
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
                      <div key={i}>
                        <div className="flex justify-between items-center">
                          <h1>Index: {i + 1}</h1>
                          <NexciteButton
                            onClick={() => {
                              field.onChange(
                                field.value.filter((res, ii) => i !== ii)
                              );
                            }}
                            className="bg-black"
                            type="button"
                          >
                            <MdClose size="15" />
                          </NexciteButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
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
                            label="Starting Float"
                            value={res.starting_float}
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            required
                            onChange={(e) => {
                              field.value[i].starting_float = e.target
                                .value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "starting_float")
                            )}
                            helperText={`  ${checkBoxesError(
                              fieldState,
                              i,
                              "starting_float"
                            )}`}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            label="Current Float"
                            value={res.current_float}
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            required
                            onChange={(e) => {
                              field.value[i].current_float = e.target
                                .value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "current_float")
                            )}
                            helperText={` ${checkBoxesError(
                              fieldState,
                              i,
                              "current_float"
                            )}`}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            label="P_L"
                            value={res.p_l}
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            required
                            onChange={(e) => {
                              field.value[i].p_l = e.target.value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "p_l")
                            )}
                            helperText={`  ${checkBoxesError(
                              fieldState,
                              i,
                              "p_l"
                            )}`}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            label="Commission"
                            value={res.commission}
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            required
                            onChange={(e) => {
                              field.value[i].commission = e.target.value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "commission")
                            )}
                            helperText={` ${checkBoxesError(
                              fieldState,
                              i,
                              "commission"
                            )}`}
                          />
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            label="Swap"
                            value={res.swap}
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            required
                            onChange={(e) => {
                              field.value[i].swap = e.target.value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "swap")
                            )}
                            helperText={`  ${checkBoxesError(
                              fieldState,
                              i,
                              "swap"
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
                      <NexciteButton
                        type="button"
                        className="bg-black"
                        onClick={() => {
                          form.setValue(
                            "managers",
                            watch.managers.concat([
                              {
                                starting_float: 0,
                                current_float: 0,
                                p_l: 0,
                                commission: 0,
                                swap: 0,
                                manger: "",
                              },
                            ])
                          );
                        }}
                      >
                        <MdPlusOne />
                      </NexciteButton>
                    </div>
                  </>
                );
              }}
            />
            {/* ************Manager Boxes End************ */}

            {/* ************Expensive Boxes start************ */}
            <div
              style={{ margin: "0px 0px 0px" }}
              className="flex items-center"
            >
              <h1 className="text-2xl">Expensive</h1>
              <Tooltip title="Commissions Salary">
                <IconButton size="small">
                  <MdInfo />
                </IconButton>
              </Tooltip>
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
                      <div key={i}>
                        <div className="flex justify-between items-center">
                          <h1>Index: {i + 1}</h1>
                          <NexciteButton
                            onClick={() => {
                              field.onChange(
                                field.value.filter((res, ii) => i !== ii)
                              );
                            }}
                            className="bg-black"
                            type="button"
                          >
                            <MdClose size="15" />
                          </NexciteButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                          <TextField
                            size="small"
                            type="text"
                            label="Name"
                            InputLabelProps={{ shrink: true }}
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
                            label="Expensive"
                            value={res.expensive}
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            required
                            onChange={(e) => {
                              field.value[i].expensive = e.target.value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "expensive")
                            )}
                            helperText={` ${checkBoxesError(
                              fieldState,
                              i,
                              "expensive"
                            )}`}
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
                      <NexciteButton
                        type="button"
                        className="bg-black"
                        onClick={() => {
                          form.setValue(
                            "expensive",
                            watch.expensive.concat([
                              {
                                expensive: 0,
                                name: "",
                              },
                            ])
                          );
                        }}
                      >
                        <MdPlusOne />
                      </NexciteButton>
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
                      <div key={i}>
                        <div className="flex justify-between items-center">
                          <h1>Index: {i + 1}</h1>
                          <NexciteButton
                            onClick={() => {
                              field.onChange(
                                field.value.filter((res, ii) => i !== ii)
                              );
                            }}
                            className="bg-black"
                            type="button"
                          >
                            <MdClose size="15" />
                          </NexciteButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
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
                            label="P_l"
                            value={res.p_l}
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            required
                            onChange={(e) => {
                              field.value[i].p_l = e.target.value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "p_l")
                            )}
                            helperText={` ${checkBoxesError(
                              fieldState,
                              i,
                              "p_l"
                            )}`}
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
                      <NexciteButton
                        type="button"
                        className="bg-black"
                        onClick={() => {
                          form.setValue(
                            "p_l",
                            watch.p_l.concat([
                              {
                                p_l: 0,
                                name: "",
                              },
                            ])
                          );
                        }}
                      >
                        <MdPlusOne />
                      </NexciteButton>
                    </div>
                  </>
                );
              }}
            />
            {/* ************P_L Boxes End************ */}

            {/* ************Agent Boxes start************ */}
            <div style={{ margin: "0px 0px 0px" }}>
              <h1 className="text-2xl">Agent</h1>
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
                      <div key={i}>
                        <div className="flex justify-between items-center">
                          <h1>Index: {i + 1}</h1>
                          <NexciteButton
                            onClick={() => {
                              field.onChange(
                                field.value.filter((res, ii) => i !== ii)
                              );
                            }}
                            className="bg-black"
                            type="button"
                          >
                            <MdClose size="15" />
                          </NexciteButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
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
                            label="Commission"
                            value={res.commission}
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            required
                            onChange={(e) => {
                              field.value[i].commission = e.target.value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "commission")
                            )}
                            helperText={`  ${checkBoxesError(
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
                      <NexciteButton
                        type="button"
                        className="bg-black"
                        onClick={() => {
                          form.setValue(
                            "agents",
                            watch.agents.concat([
                              {
                                commission: 0,
                                name: "",
                              },
                            ])
                          );
                        }}
                      >
                        <MdPlusOne />
                      </NexciteButton>
                    </div>
                  </>
                );
              }}
            />
            {/* ************Agent Boxes End************ */}

            {/* ************Adjustment Boxes start************ */}

            <div style={{ margin: "0px 0px 0px" }}>
              <h1 className="text-2xl">Adjustment</h1>
            </div>
            <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
            <Controller
              control={form.control}
              name="adjustment"
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
                      <div key={i}>
                        <div className="flex justify-between items-center">
                          <h1>Index: {i + 1}</h1>
                          <NexciteButton
                            onClick={() => {
                              field.onChange(
                                field.value.filter((res, ii) => i !== ii)
                              );
                            }}
                            className="bg-black"
                            type="button"
                          >
                            <MdClose size="15" />
                          </NexciteButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
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
                            label="Adjustment"
                            value={res.adjustment}
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            required
                            onChange={(e) => {
                              field.value[i].adjustment = e.target.value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "adjustment")
                            )}
                            helperText={` ${checkBoxesError(
                              fieldState,
                              i,
                              "adjustment"
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
                      <NexciteButton
                        type="button"
                        className="bg-black"
                        onClick={() => {
                          form.setValue(
                            "adjustment",
                            watch.adjustment.concat([
                              {
                                adjustment: 0,
                                name: "",
                              },
                            ])
                          );
                        }}
                      >
                        <MdPlusOne />
                      </NexciteButton>
                    </div>
                  </>
                );
              }}
            />
            {/* ************Adjustment Boxes End************ */}

            {/* ************Credit Boxes start************ */}

            <div style={{ margin: "0px 0px 0px" }}>
              <h1 className="text-2xl">Credit</h1>
            </div>
            <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-50mb-4" />
            <Controller
              control={form.control}
              name="credit"
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
                      <div key={i}>
                        <div className="flex justify-between items-center">
                          <h1>Index: {i + 1}</h1>
                          <NexciteButton
                            onClick={() => {
                              field.onChange(
                                field.value.filter((res, ii) => i !== ii)
                              );
                            }}
                            className="bg-black"
                            type="button"
                          >
                            <MdClose size="15" />
                          </NexciteButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
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
                            label="Credit"
                            value={res.credit}
                            InputProps={{
                              inputComponent: NumericFormatCustom as any,
                            }}
                            required
                            onChange={(e) => {
                              field.value[i].credit = e.target.value as any;
                              field.onChange(field.value);
                            }}
                            error={Boolean(
                              checkBoxesError(fieldState, i, "credit")
                            )}
                            helperText={`  ${checkBoxesError(
                              fieldState,
                              i,
                              "credit"
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
                      <NexciteButton
                        type="button"
                        className="bg-black"
                        onClick={() => {
                          form.setValue(
                            "credit",
                            watch.credit.concat([
                              {
                                credit: 0,
                                name: "",
                              },
                            ])
                          );
                        }}
                      >
                        <MdPlusOne />
                      </NexciteButton>
                    </div>
                  </>
                );
              }}
            />
            {/* ************Credit Boxes End************ */}
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
