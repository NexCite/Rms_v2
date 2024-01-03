"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";

import { useRouter } from "next/navigation";

import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Card, CardContent, CardHeader, TextField } from "@mui/material";
import NexCiteButton from "@rms/components/button/nexcite-button";
import NumericFormatCustom from "@rms/components/ui/text-field-number";
import { useToast } from "@rms/hooks/toast-hook";
import { createCurrency, updateCurrency } from "@rms/service/currency-service";
type Props = { value: Prisma.CurrencyGetPayload<{}> };
export default function CurrencyForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();
  const formSchema = useMemo(() => {
    return z.object({
      name: z
        .string()
        .min(1, { message: "Name must be at least 1  character" }),
      symbol: z
        .string()
        .min(1, { message: "Symbol must be at least 1  character" }),
      rate: z
        .number()

        .or(
          z
            .string()

            .regex(/^\d+(\.\d{2})?$/)
            .nullable()
            .optional()

            .transform(Number)
            .nullable()
            .optional()
        )
        .or(z.string())
        .nullable()
        .optional(),
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: props.value,
  });
  const toast = useToast();

  const handleSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      setTransition(async () => {
        if (props.value) {
          setTransition(async () => {
            if (Number.isNaN(parseFloat(values.rate + ""))) {
              values.rate = null;
            }
            const result = await updateCurrency(props.value.id, values as any);
            toast.OpenAlert(result);
            if (result.status === 200) back();
            Object.keys(result.errors ?? []).map((e) => {
              form.setError(e as any, result[e]);
            });
          });
        } else {
          setTransition(async () => {
            const result = await createCurrency(values as any);
            toast.OpenAlert(result);
            if (result.status === 200) back();
            Object.keys(result.errors ?? []).map((e) => {
              form.setError(e as any, result[e]);
            });
          });
        }
      });
    },
    [back, props.value, form, toast]
  );
  return (
    <>
      <form
        className="max-w-[450px] m-auto"
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
      >
        <Card variant="outlined">
          <CardHeader title="Currency Form" />
          <CardContent className="flex flex-col gap-5">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <TextField
                    size="small"
                    label="Name"
                    placeholder="name"
                    required
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    {...field}
                    InputLabelProps={{ shrink: true }}
                  />
                );
              }}
            />

            <Controller
              name="symbol"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <TextField
                    size="small"
                    label="Symbol"
                    placeholder="symbol"
                    required
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    {...field}
                    InputLabelProps={{ shrink: true }}
                  />
                );
              }}
            />
            <Controller
              name="rate"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <>
                    {" "}
                    <TextField
                      size="small"
                      label="Rate"
                      placeholder="rate"
                      value={field.value}
                      InputProps={{
                        inputComponent: NumericFormatCustom as any,
                      }}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={` ${fieldState.error?.message ?? ""}`}
                      {...field}
                      InputLabelProps={{ shrink: true }}
                    />
                  </>
                );
              }}
            />
          </CardContent>
          <div className="flex justify-end5 m-5 mt-2">
            <NexCiteButton isPadding={isPadding} />
          </div>
        </Card>
      </form>
    </>
  );
}
