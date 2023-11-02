"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, Prisma } from "@prisma/client";
import { Textarea } from "@rms/components/ui/textarea";
import { Alert } from "@rms/components/ui/alert";
import { createInvoice, updateInvoice } from "@rms/service/invoice-service";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import UploadWidget from "../upload/upload-widget";
import { useStore } from "@rms/hooks/toast-hook";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { createVacation, updateVacation } from "@rms/service/vacation-service";

interface Props {
  id?: number;
  isEditMode?: boolean;
  employees?: Prisma.EmployeeGetPayload<{
    select: {
      first_name: true;
      last_name: true;
      id: true;
    };
  }>[];
  value: Prisma.VacationGetPayload<{ include: { media: true } }>;
}

export default function VacationForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();
  const validation = useMemo(() => {
    return z.object({
      description: z
        .string()
        .min(1, { message: "Description must be at least 1 characters" })
        .optional(),
      from_date: z.date(),
      to_date: z.date(),
      // media_id: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
      employee_id: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
      type: z.enum(Object.keys($Enums.VacationType) as any),
    });
  }, []);

  const form = useForm<z.infer<typeof validation>>({
    resolver: zodResolver(validation),
    defaultValues: props.value,
  });

  const [media, setMedia] = useState<Prisma.MediaGetPayload<{}>>();

  const store = useStore();
  const handleSubmit = useCallback(
    (values: z.infer<any>) => {
      // const result = validation.safeParse(values);

      // values.media = media
      //   ? {
      //       create: {
      //         path: media.path,
      //         title: media.title,
      //         type: "Pdf",
      //       },
      //     }
      //   : undefined;

      if (props.value) {
        setTransition(async () => {
          var value2 = JSON.parse(JSON.stringify(values));

          await updateVacation(props.value.id, value2).then((res) => {
            store.OpenAlert(res);
            Object.keys(res.errors ?? []).map((e) => {
              form.setError(e as any, res[e]);
            });

            if (res.status === 200) {
              back();
            }
          });
        });
      } else {
        setTransition(async () => {
          var value2 = JSON.parse(JSON.stringify(values));

          await createVacation(value2).then((res) => {
            store.OpenAlert(res);
            Object.keys(res.errors ?? []).map((e) => {
              form.setError(e as any, res[e]);
            });

            if (res.status === 200) {
              back();
            }
          });
        });
      }
    },
    [back, store, form, media, props.value]
  );
  return (
    <>
      <form
        className=""
        autoComplete="off"
        noValidate
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <Card className="max-w-[450px] m-auto p-2">
          <CardHeader
            title={<Typography variant="h5">Vacation Form</Typography>}
          >
            {" "}
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
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
              name={"from_date"}
              render={({ field, fieldState }) => (
                <FormControl {...field}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      minDate={dayjs().subtract(7, "day")}
                      label="Date Start"
                      slotProps={{
                        textField: {
                          InputLabelProps: { shrink: true },
                          size: "small",
                          required: true,
                          error: Boolean(fieldState?.error),
                          helperText: fieldState?.error?.message,
                        },
                      }}
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
              name={"to_date"}
              render={({ field, fieldState }) => (
                <FormControl {...field}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      minDate={dayjs().subtract(7, "day")}
                      label="Date End"
                      slotProps={{
                        textField: {
                          InputLabelProps: { shrink: true },
                          size: "small",
                          required: true,
                          error: Boolean(fieldState?.error),
                          helperText: fieldState?.error?.message,
                        },
                      }}
                      onChange={(e) => {
                        field.onChange(e?.toDate());
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              )}
            />

            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormControl
                  fullWidth
                  required
                  size="small"
                  error={Boolean(fieldState?.error?.message)}
                >
                  <InputLabel className="mb-3" shrink placeholder="type">
                    Type
                  </InputLabel>
                  <Select
                    {...field}
                    error={Boolean(fieldState.error)}
                    size="small"
                    label="Type"
                    notched
                    fullWidth
                    placeholder="type"
                    defaultValue={field.value}
                  >
                    <MenuItem key={-1} value={undefined}>
                      None
                    </MenuItem>

                    {Object.keys($Enums.VacationType).map((res) => (
                      <MenuItem key={res} value={res}>
                        {" "}
                        {res}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name={"employee_id" as any}
              control={form.control}
              render={({ field, fieldState }) => (
                <Autocomplete
                  disablePortal
                  onChange={(e, v) => {
                    field.onChange(v?.value);
                  }}
                  isOptionEqualToValue={(e) => e.value === props.value?.id}
                  defaultValue={(() => {
                    const result = props.employees.find(
                      (res) => res.id === field.value
                    );

                    return result
                      ? {
                          label: `(${result.id}) ${result.first_name} ${result.last_name}`,
                          value: result.id,
                        }
                      : undefined;
                  })()}
                  size="small"
                  options={props.employees.map((res) => ({
                    label: `(${res.id}) ${res.first_name} ${res.last_name}`,
                    value: res.id,
                  }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ shrink: true }}
                      label="Employee"
                      placeholder="employee"
                    />
                  )}
                />
              )}
            />

            <div className="grid-cols-12">
              <UploadWidget
                isPdf
                path={props.value?.media?.path}
                onSave={(e) => {
                  setMedia(
                    e ? { path: e, title: e, type: "Pdf" } : (undefined as any)
                  );
                }}
              />
            </div>
          </CardContent>
          <LoadingButton
            variant="contained"
            fullWidth
            className={
              isPadding
                ? ""
                : "hover:bg-blue-gray-900   hover:text-brown-50 capitalize bg-black text-white"
            }
            disableElevation
            type="submit"
            loading={isPadding}
          >
            Save
          </LoadingButton>
        </Card>
      </form>
    </>
  );
}
