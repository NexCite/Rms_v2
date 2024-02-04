"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Prisma } from "@prisma/client";
import NexCiteButton from "@nexcite/components/button/nexcite-button";
import { useToast } from "@nexcite/hooks/toast-hook";
import { updateScheuleConfig } from "@nexcite/service/schedule-config-service";
import dayjs from "dayjs";
import { useMemo, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

type Props = {
  config: Prisma.ScheduleConfigGetPayload<{}>;
};
export default function ScheduleConfigForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const toast = useToast();

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

  const watch = useWatch({ control: form.control });

  const handleForm = (values: z.infer<typeof validation>) => {
    setTransition(() => {
      updateScheuleConfig(props.config.id, values).then((res) => {
        toast.OpenAlert(res);
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
          <NexCiteButton isPadding={isPadding} />
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Controller
            control={form.control}
            name="from_time"
            render={({ field, fieldState, formState }) => (
              <TimePicker
                maxTime={watch.to_time ? dayjs(watch.to_time) : undefined}
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
                minTime={watch.from_time ? dayjs(watch.from_time) : undefined}
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
                  watch.to_over_time ? dayjs(watch.to_over_time) : undefined
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
                  watch.from_over_time ? dayjs(watch.from_over_time) : undefined
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
