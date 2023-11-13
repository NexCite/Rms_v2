"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  TimeField,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Prisma } from "@prisma/client";
import { useStore } from "@rms/hooks/toast-hook";
import { updateScheuleConfig } from "@rms/service/schedule-config-service";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  config: Prisma.ScheduleConfigGetPayload<{}>;
};
export default function ScheduleConfigForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const store = useStore();
  const validation = useMemo(
    () =>
      z.object({
        from_time: z.date(),
        to_time: z.date(),
        from_over_time: z.date(),
        to_over_time: z.date(),
      }),
    []
  );
  const form = useForm<z.infer<typeof validation>>({
    resolver: zodResolver(validation),
    defaultValues: props.config,
  });

  const handleForm = (values: z.infer<typeof validation>) => {
    setTransition(() => {
      updateScheuleConfig(props.config.id, values).then((res) => {
        store.OpenAlert(res);
      });
    });
  };
  return (
    <div className="border p-5 max-w-[550px] m-auto shadow-sm rounded-s flex flex-col gap-5">
      <h1 className="text-xl">Schedule Config Form</h1>
      <hr></hr>
      <form
        noValidate
        onSubmit={form.handleSubmit(handleForm)}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-row-reverse">
          <LoadingButton
            loading={isPadding}
            className="hover:bg-blue-gray-900   hover:text-brown-50 capitalize bg-black text-white"
            variant="contained"
            type="submit"
          >
            Save
          </LoadingButton>
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Controller
            control={form.control}
            name="from_time"
            render={({ field, fieldState, formState }) => (
              <TimePicker
                maxTime={
                  form.watch("to_time")
                    ? dayjs(form.watch("to_time"))
                    : undefined
                }
                value={dayjs(field.value)}
                onChange={(e) => {
                  field.onChange(e?.toDate());
                }}
                label={"From Time"}
                slotProps={{
                  textField: {
                    required: true,
                    error: Boolean(fieldState.error),
                    helperText: fieldState?.error?.message,
                    size: "small",
                    fullWidth: true,
                    label: "From Time",
                    InputLabelProps: {
                      shrink: true,
                    },
                  },
                }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="to_time"
            render={({ field, fieldState, formState }) => (
              <TimePicker
                minTime={
                  form.watch("from_time")
                    ? dayjs(form.watch("from_time"))
                    : undefined
                }
                value={dayjs(field.value)}
                onChange={(e) => {
                  field.onChange(e?.toDate());
                }}
                label={"From Time"}
                slotProps={{
                  textField: {
                    required: true,
                    error: Boolean(fieldState.error),
                    helperText: fieldState?.error?.message,
                    size: "small",
                    fullWidth: true,
                    label: "From Time",
                    InputLabelProps: {
                      shrink: true,
                    },
                  },
                }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="from_over_time"
            render={({ field, fieldState, formState }) => (
              <TimePicker
                maxTime={
                  form.watch("to_over_time")
                    ? dayjs(form.watch("to_over_time"))
                    : undefined
                }
                value={dayjs(field.value)}
                onChange={(e) => {
                  field.onChange(e?.toDate());
                }}
                label={"From Over Time"}
                slotProps={{
                  textField: {
                    required: true,
                    error: Boolean(fieldState.error),
                    helperText: fieldState?.error?.message,
                    size: "small",
                    fullWidth: true,
                    label: "From  Over Time",
                    InputLabelProps: {
                      shrink: true,
                    },
                  },
                }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="to_over_time"
            render={({ field, fieldState, formState }) => (
              <TimePicker
                minTime={
                  form.watch("from_over_time")
                    ? dayjs(form.watch("from_over_time"))
                    : undefined
                }
                value={dayjs(field.value)}
                onChange={(e) => {
                  field.onChange(e?.toDate());
                }}
                label={"To Over Time"}
                slotProps={{
                  textField: {
                    required: true,
                    error: Boolean(fieldState.error),
                    helperText: fieldState?.error?.message,
                    size: "small",
                    fullWidth: true,
                    label: "To Over Time",
                    InputLabelProps: {
                      shrink: true,
                    },
                  },
                }}
              />
            )}
          />
        </LocalizationProvider>
      </form>
    </div>
  );
}
