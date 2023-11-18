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
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { $Enums, Prisma } from "@prisma/client";
import { Button } from "@rms/components/ui/button";
import Loading from "@rms/components/ui/loading";
import { useStore } from "@rms/hooks/toast-hook";
import { createSchedule, updateSchedule } from "@rms/service/schedule-service";
import dayjs from "dayjs";
import { PlusSquare, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import moment from "moment";

interface Props {
  schedule?: Prisma.ScheduleGetPayload<{
    include: {
      attendance: { include: { employee: true; media: true } };
    };
  }>;
  id?: number;
  isEditMode?: boolean;
  vactions: Prisma.VacationGetPayload<{}>[];
  scheduleConfig: Prisma.ScheduleConfigGetPayload<{}>;
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
          from_over_time: true;
          to_over_time: true;
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

  const formSchema = useMemo(
    () =>
      z.object({
        to_date: z.date(),

        attendance: z.array(
          z.object({
            from_time: z.date().nullable().optional(),
            to_time: z.date().nullable().optional(),
            from_over_time: z.date().nullable().optional(),
            to_over_time: z.date().nullable().optional(),
            absent: z.boolean(),
            description: z.string().optional().nullable(),
            media: z
              .object({
                path: z.string().optional(),
                type: z.enum([$Enums.MediaType.Pdf]).default("Pdf").optional(),
                title: z.string().optional(),
              })
              .optional(),
            employee_id: z.number(),
            username: z.string(),
          })
        ),
      }),
    []
  );

  useEffect(() => {}, [props.employees]);

  const scheduleConfig = useMemo(() => {
    return props.scheduleConfig;
  }, [props.scheduleConfig]);

  const store = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: props.isEditMode
      ? {
          to_date: props.schedule.to_date,
          attendance: props.schedule.attendance.map((res) => {
            const vaction = props.vactions.find(
              (ress) => ress.employee_id === res.employee_id
            );

            return {
              username: res.employee?.username,
              absent: vaction ? true : false,
              description: vaction?.description,
              employee_id: res.employee_id,
              from_time: res.absent ? null : res.from_time,
              to_time: res.absent ? null : res.to_time,
              from_over_time: res.absent ? null : res.from_over_time,
              to_over_time: res.absent ? null : res.to_over_time,

              media: res.media
                ? {
                    path: res.media.path,
                    title: res.media.title,
                    type: res.media.type,
                  }
                : undefined,
            };
          }),
        }
      : {
          attendance: props.employees.map((res) => {
            const vaction = props.vactions.find(
              (ress) => ress.employee_id === res.id
            );
            return {
              absent: vaction ? true : false,
              description: vaction?.description,
              employee_id: res.id,
              username: res.username,
              from_time: vaction ? null : scheduleConfig.from_time,
              to_time: vaction ? null : scheduleConfig.to_time,
              from_over_time: vaction ? null : scheduleConfig.from_over_time,
              to_over_time: vaction ? null : scheduleConfig.to_over_time,
            };
          }),
          to_date: moment().startOf("D").toDate(),
        },
  });

  const handleSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      var formData = {
        to_date: values.to_date,
        attendance: [],
      };
      formData.attendance = values.attendance.map((res) => ({
        ...res,
        username: undefined,
      }));
      formData.to_date = values.to_date;

      const error = [];

      values.attendance.map((res) => {
        if (!res.absent) {
          if (
            (res.from_time && !res.to_time) ||
            (!res.from_time && res.to_time)
          ) {
            error.push({
              message: `From In Time and To In Time must be required for ${res.username}`,
            });
          }

          if (
            (res.from_over_time && !res.to_over_time) ||
            (!res.from_over_time && res.to_over_time)
          ) {
            error.push({
              message: `From OverTime and To OverTime must be required for ${res.username}`,
            });
          }
        } else {
          if (!res.description || res?.description?.length === 0) {
            error.push({
              message: `Description must be required for ${res.username}`,
            });
          }
        }
      });

      if (error.length > 0) {
        form.setError("attendance", {
          message: error.map((res) => `<div> ${res.message} </div>`).join(""),
          type: "required",
        });
        return;
      }

      setTransition(async () => {
        if (props.schedule) {
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                      <DatePicker
                        disabled={props.isEditMode}
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
                        value={dayjs(field.value)}
                        onChange={(e) => {
                          field.onChange(e?.toDate());
                        }}
                      />
                    </FormControl>
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name={"attendance"}
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
                      <div className="flex pr-3 pt-3 flex-col gap-5">
                        {field.value?.map((res, i) => (
                          <div key={i} className="flex w-full flex-col gap-3">
                            <h1>
                              ({res.employee_id}) {res.username}
                            </h1>
                            <div className="grid grid-cols-2 gap-5">
                              <TimePicker
                                disabled={res.absent}
                                label="In Time"
                                slotProps={{
                                  textField: {
                                    InputLabelProps: { shrink: true },
                                    size: "small",
                                    required: true,
                                    fullWidth: true,

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
                                value={dayjs(res.from_time)}
                                onChange={(e) => {
                                  field.value[i].from_time =
                                    e?.toDate() ?? null;
                                  field.onChange(field.value);
                                }}
                              />

                              <TimePicker
                                disabled={res.absent}
                                label="Out Time"
                                slotProps={{
                                  textField: {
                                    InputLabelProps: { shrink: true },
                                    size: "small",
                                    required: true,
                                    fullWidth: true,

                                    // helperText: fieldState?.error?.message,
                                    // error: Boolean(fieldState?.error),
                                    error: Boolean(
                                      checkBoxesError(fieldState, i, "to_time")
                                    ),
                                  },
                                }}
                                value={dayjs(res.to_time)}
                                onChange={(e) => {
                                  field.value[i].to_time = e?.toDate() ?? null;
                                  field.onChange(field.value);
                                }}
                              />

                              <TimePicker
                                disabled={res.absent}
                                label="Overtime In"
                                slotProps={{
                                  textField: {
                                    InputLabelProps: { shrink: true },
                                    size: "small",
                                    fullWidth: true,

                                    // helperText: fieldState?.error?.message,
                                    // error: Boolean(fieldState?.error),
                                    error: Boolean(
                                      checkBoxesError(
                                        fieldState,
                                        i,
                                        "from_over_time"
                                      )
                                    ),
                                  },
                                }}
                                value={dayjs(res.from_over_time)}
                                onChange={(e) => {
                                  field.value[i].from_over_time =
                                    e?.toDate() ?? null;
                                  field.onChange(field.value);
                                }}
                              />

                              <TimePicker
                                disabled={res.absent}
                                label="Overtime Out"
                                slotProps={{
                                  textField: {
                                    InputLabelProps: { shrink: true },
                                    size: "small",
                                    fullWidth: true,
                                    // helperText: fieldState?.error?.message,
                                    // error: Boolean(fieldState?.error),
                                    error: Boolean(
                                      checkBoxesError(
                                        fieldState,
                                        i,
                                        "to_over_time"
                                      )
                                    ),
                                  },
                                }}
                                value={dayjs(res.to_over_time)}
                                onChange={(e) => {
                                  field.value[i].to_over_time =
                                    e?.toDate() ?? null;
                                  field.onChange(field.value);
                                }}
                              />
                              <div className="w-max">
                                <FormControlLabel
                                  disabled={props.isEditMode}
                                  checked={res.absent}
                                  control={
                                    <Switch
                                      onChange={(e, c) => {
                                        field.value[i].absent = c;

                                        if (!props.isEditMode && c) {
                                          var result = confirm(
                                            `Are you sure ${res.username} absent?`
                                          );
                                          if (result) {
                                            field.value[i].from_over_time =
                                              null;
                                            field.value[i].to_over_time = null;
                                            field.value[i].from_time = null;
                                            field.value[i].to_time = null;

                                            field.onChange(field.value);
                                            return;
                                          }
                                        }

                                        if (c) {
                                          field.value[i].from_over_time = null;
                                          field.value[i].to_over_time = null;
                                          field.value[i].from_time = null;
                                          field.value[i].to_time = null;
                                        } else {
                                          field.value[i].from_over_time =
                                            scheduleConfig.from_over_time;
                                          field.value[i].to_over_time =
                                            scheduleConfig.to_over_time;
                                          field.value[i].from_time =
                                            scheduleConfig.from_time;
                                          field.value[i].to_time =
                                            scheduleConfig.to_time;
                                        }
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
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    type="text"
                                    label="Description"
                                    value={res.description}
                                    required
                                    minRows={3}
                                    maxRows={5}
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
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                }}
              />
            </CardContent>
          </Card>
        </LocalizationProvider>
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
