"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Alert,
  AlertTitle,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Prisma } from "@prisma/client";
import { Button } from "@rms/components/ui/button";
import Loading from "@rms/components/ui/loading";
import { useStore } from "@rms/hooks/toast-hook";
import { createSchedule, updateSchedule } from "@rms/service/schedule-service";
import dayjs from "dayjs";
import { PlusSquare, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import UploadWidget from "../upload/upload-widget";

interface Props {
  id?: number;
  isEditMode?: boolean;
  // attendances?: Prisma.AttendanceGetPayload<{}>[];
  employees: Prisma.EmployeeGetPayload<{
    select: {
      id: true;
      username: true;
      first_name: true;
      last_name: true;
      attendances: {
        select: {
          id: true;
          from_time: true;
          to_time: true;
          over_time_from: true;
          over_time_to: true;
          media_id: true;
          absent: true;
          description: true;
          media: {
            select: {
              id: true;
              path: true;
            };
          };
        };
      };
    };
  }>[];
}

export default function ScheduleForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();

  const attendanceFormSchema = {
    from_time: z.date(),
    to_time: z.date(),
    over_time_from: z.date().optional().nullable(),
    over_time_to: z.date().optional().nullable(),
    absent: z.boolean(),
    description: z.string().optional(),
    media_id: z
      .number()
      .or(z.string().regex(/^\d+$/).transform(Number))
      .optional()
      .nullable(),
    employee_id: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
    // media: z.string().optional().nullable(),
  };

  const attendanceDefaultValues = {};
  const attendanceForms = {};

  props.employees?.forEach((e) => {
    attendanceForms[e.username.toLowerCase()] = z.array(
      z.object(attendanceFormSchema)
    );
    attendanceDefaultValues[e.username.toLowerCase()] =
      e.attendances?.length > 0
        ? e.attendances.map((a) => {
            return {
              from_time: a.from_time || null,
              to_time: a.to_time || null,
              over_time_from: a.over_time_from || null,
              over_time_to: a.over_time_to || null,
              absent: a.absent || false,
              description: a.description || "",
              media_id: a.media_id || null,
              // media: a.media || null,
              employee_id: e.id,
              schedule_id: null,
            };
          })
        : [
            {
              from_time: null,
              to_time: null,
              over_time_from: null,
              over_time_to: null,
              absent: false,
              description: "",
              media_id: null,
              // media: null,
              employee_id: e.id,
              schedule_id: null,
            },
          ];
  });

  const formSchema = z.object({
    ...attendanceForms,
    to_date: z.date(),
  });

  const store = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...attendanceDefaultValues,
      to_date: new Date(),
    },
  });

  const handleSubmit = useCallback(
    (values) => {
      var formData = {
        to_date: values.to_date,
        attendance: [],
      };

      Object.keys(values).forEach((key) => {
        if (key !== "to_date") {
          if (values[key].length > 0) {
            formData.attendance = formData.attendance.concat(values[key]);
          }
        }
      });

      setTransition(async () => {
        console.log(formData);
        if (props.isEditMode) {
          const result = await updateSchedule(props.id, formData as any);
          store.OpenAlert(result);
          if (result.status === 200) {
            back();
          }
        } else {
          const result = await createSchedule(formData as any);
          store.OpenAlert(result);
          if (result.status === 200) {
            back();
          }
        }
      });
    },
    [props, formSchema, back, form]
  );

  const [loadingUi, setLoadingUi] = useState(true);
  useEffect(() => {
    setLoadingUi(false);
  }, [props.employees]);

  return (
    <form
      className="m-auto"
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
                <Typography variant="h5">Employees Schedule Form</Typography>
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

          <CardContent className="flex gap-2 flex-col">
            <div className="flex gap-3 flex-col">
              <Controller
                control={form.control}
                name={"to_date"}
                render={({ field, fieldState }) => (
                  <FormControl {...field} size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        minDate={dayjs().subtract(7, "day")}
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

            {props.employees?.map((employee) => (
              <>
                <div className="flex overflow-x-scroll w-full items-center mt-10 mb-10 pb-5">
                  <div className="m-0">
                    <h1 className="text-2xl w-max pr-2">{`(${employee.id}) ${employee.first_name} ${employee.last_name}`}</h1>
                  </div>

                  <Controller
                    control={form.control}
                    name={employee.username.toLowerCase() as any}
                    render={({ field, fieldState }) => {
                      return (
                        <div className="flex pr-3 pt-3">
                          {/* {Boolean(fieldState.error?.message) && (
                            <Alert variant="outlined" severity="error">
                              <AlertTitle>
                                {fieldState.error.message.replaceAll(
                                  "#space#",
                                  "\n"
                                )}
                              </AlertTitle>
                            </Alert>
                          )} */}
                          {field.value?.map((res, i) => (
                            <div key={i} className="flex w-full">
                              {/* <div className="flex justify-between items-center pl-5 pr-5">
                                <h1>Attendance: {i + 1}</h1>
                                <Button
                                  onClick={() => {
                                    field.onChange(
                                      field.value.filter((res, ii) => i !== ii)
                                    );
                                  }}
                                  size="sm"
                                  className="bg-black ml-3"
                                  color="dark"
                                  type="button"
                                >
                                  <X size="15" />
                                </Button>
                              </div> */}

                              <div className="flex gap-5 items-center">
                                <LocalizationProvider
                                  dateAdapter={AdapterDayjs}
                                >
                                  <DateTimePicker
                                    className="w-max"
                                    minDate={dayjs().subtract(7, "day")}
                                    label="In Time"
                                    slotProps={{
                                      textField: {
                                        InputLabelProps: { shrink: true },
                                        size: "small",
                                        required: true,
                                        // helperText: fieldState?.error?.message,
                                        // error: Boolean(fieldState?.error),
                                        error: Boolean(
                                          checkBoxesError(
                                            fieldState,
                                            i,
                                            "from_time"
                                          )
                                        ),
                                      },
                                    }}
                                    defaultValue={
                                      res.from_time
                                        ? dayjs(res.from_time)
                                        : null
                                    }
                                    onChange={(e) => {
                                      field.value[i].from_time = e?.toDate();
                                      field.onChange(field.value);
                                    }}
                                  />
                                </LocalizationProvider>

                                <LocalizationProvider
                                  dateAdapter={AdapterDayjs}
                                >
                                  <DateTimePicker
                                    className="w-max"
                                    minDate={dayjs().subtract(7, "day")}
                                    label="Out Time"
                                    slotProps={{
                                      textField: {
                                        InputLabelProps: { shrink: true },
                                        size: "small",
                                        required: true,
                                        // helperText: fieldState?.error?.message,
                                        // error: Boolean(fieldState?.error),
                                        error: Boolean(
                                          checkBoxesError(
                                            fieldState,
                                            i,
                                            "to_time"
                                          )
                                        ),
                                      },
                                    }}
                                    defaultValue={
                                      res.to_time ? dayjs(res.to_time) : null
                                    }
                                    onChange={(e) => {
                                      field.value[i].to_time = e?.toDate();
                                      field.onChange(field.value);
                                    }}
                                  />
                                </LocalizationProvider>

                                <LocalizationProvider
                                  dateAdapter={AdapterDayjs}
                                >
                                  <DateTimePicker
                                    className="w-max"
                                    minDate={dayjs().subtract(7, "day")}
                                    label="Overtime In"
                                    slotProps={{
                                      textField: {
                                        InputLabelProps: { shrink: true },
                                        size: "small",
                                        // helperText: fieldState?.error?.message,
                                        // error: Boolean(fieldState?.error),
                                        error: Boolean(
                                          checkBoxesError(
                                            fieldState,
                                            i,
                                            "over_time_from"
                                          )
                                        ),
                                      },
                                    }}
                                    defaultValue={
                                      res.over_time_from
                                        ? dayjs(res.over_time_from)
                                        : null
                                    }
                                    onChange={(e) => {
                                      field.value[i].over_time_from =
                                        e?.toDate();
                                      field.onChange(field.value);
                                    }}
                                  />
                                </LocalizationProvider>

                                <LocalizationProvider
                                  dateAdapter={AdapterDayjs}
                                >
                                  <DateTimePicker
                                    className="w-max"
                                    minDate={dayjs().subtract(7, "day")}
                                    label="Overtime Out"
                                    slotProps={{
                                      textField: {
                                        InputLabelProps: { shrink: true },
                                        size: "small",
                                        // helperText: fieldState?.error?.message,
                                        // error: Boolean(fieldState?.error),
                                        error: Boolean(
                                          checkBoxesError(
                                            fieldState,
                                            i,
                                            "over_time_to"
                                          )
                                        ),
                                      },
                                    }}
                                    defaultValue={
                                      res.over_time_to
                                        ? dayjs(res.over_time_to)
                                        : null
                                    }
                                    onChange={(e) => {
                                      field.value[i].over_time_to = e?.toDate();
                                      field.onChange(field.value);
                                    }}
                                  />
                                </LocalizationProvider>

                                <div className="w-max">
                                  <FormControlLabel
                                    checked={res.absent}
                                    control={
                                      <Switch
                                        onChange={(e) => {
                                          field.value[i].absent =
                                            e.target.checked;
                                          field.onChange(field.value);
                                        }}
                                      />
                                    }
                                    label="Absent"
                                  />
                                </div>

                                {(res.absent || field.value[i].absent) && (
                                  <>
                                    <TextField
                                      className="w-max"
                                      InputLabelProps={{ shrink: true }}
                                      size="small"
                                      type="text"
                                      label="Description"
                                      value={res.description}
                                      required
                                      multiline
                                      onChange={(e) => {
                                        field.value[i].description =
                                          e.target.value;
                                        field.onChange(field.value);
                                      }}
                                      error={Boolean(
                                        checkBoxesError(
                                          fieldState,
                                          i,
                                          "description"
                                        )
                                      )}
                                    />

                                    {/* <div>
                                      <UploadWidget
                                        isLogo
                                        onSave={(e) => {
                                          field.value[i].media = e ?? "";
                                          field.onChange(field.value);
                                          // form.clearErrors("logo");
                                        }}
                                      />
                                    </div> */}
                                  </>
                                )}
                              </div>

                              {/* <hr className="my-1 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" /> */}
                            </div>
                          ))}

                          {/* <div className="flex items-center pl-4">
                            <Button
                              type="button"
                              className="bg-black"
                              color="dark"
                              onClick={() => {
                                form.setValue(
                                  employee.username.toLowerCase() as any,
                                  form
                                    .watch(
                                      employee.username.toLowerCase() as any
                                    )
                                    .concat([
                                      {
                                        from_time: null,
                                        to_time: null,
                                        over_time_from: null,
                                        over_time_to: null,
                                        absent: false,
                                        description: "",
                                        media_id: null,
                                        media: null,
                                        employee_id: employee.id,
                                        schedule_id: null,
                                      },
                                    ])
                                );
                              }}
                            >
                              <PlusSquare />
                            </Button>
                          </div> */}
                        </div>
                      );
                    }}
                  />
                </div>
              </>
            ))}
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
