"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";

import { useRouter } from "next/navigation";

import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import LoadingButton from "@mui/lab/LoadingButton";
import { Card, CardContent, CardHeader, TextField } from "@mui/material";
import { useStore } from "@rms/hooks/toast-hook";
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
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: props.value,
  });
  const store = useStore();

  const handleSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      setTransition(async () => {
        if (props.value) {
          setTransition(async () => {
            const result = await updateCurrency(props.value.id, values);
            store.OpenAlert(result);
            if (result.status === 200) back();
            Object.keys(result.errors ?? []).map((e) => {
              form.setError(e as any, result[e]);
            });
          });
        } else {
          setTransition(async () => {
            const result = await createCurrency(values as any);
            store.OpenAlert(result);
            if (result.status === 200) back();
            Object.keys(result.errors ?? []).map((e) => {
              form.setError(e as any, result[e]);
            });
          });
        }
      });
    },
    [back, props.value, form, store]
  );
  return (
    <>
      <form
        className="max-w-[450px] m-auto"
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
      >
        <Card>
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
          </CardContent>
          <div className="flex justify-end5 m-5 mt-2">
            <LoadingButton
              fullWidth
              variant="contained"
              className={
                isPadding
                  ? ""
                  : "hover:bg-blue-gray-900   hover:text-brown-50 capitalize bg-black text-white"
              }
              disableElevation
              loading={isPadding}
              type="submit"
            >
              Save
            </LoadingButton>
          </div>
        </Card>
      </form>
    </>
  );
}
