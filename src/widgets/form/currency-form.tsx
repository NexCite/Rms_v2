"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";

import { usePathname, useRouter } from "next/navigation";

import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Typography,
} from "@mui/joy";
import NexCiteButton from "@nexcite/components/button/NexCiteButton";
import NumericFormatCustom from "@nexcite/components/input/TextFieldNumber";
import { useToast } from "@nexcite/hooks/toast-hook";
import {
  createCurrency,
  updateCurrency,
} from "@nexcite/service/currency-service";
type Props = { value: Prisma.CurrencyGetPayload<{}> };
export default function CurrencyForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back, replace } = useRouter();
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
        .min(0.01)

        .or(
          z
            .string()

            .regex(/^\d+(\.\d{2})?$/)

            .transform(Number)
        ),
    });
  }, []);
  const pathName = usePathname();

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
            updateCurrency(props.value.id, values as any).then((res) => {
              res?.error?.map((res) => {
                form.setError(res as any, { message: "already exists" });
              });

              toast.OpenAlert(res);
            });
          });
        } else {
          setTransition(async () => {
            await createCurrency(values as any).then((res) => {
              res?.error?.map((res) => {
                form.setError(res as any, { message: "already exists" });
              });

              toast.OpenAlert(res);
              replace(pathName + "?id=" + res.result.id);
            });
          });
        }
      });
    },
    [props.value, toast, form, replace, pathName]
  );
  return (
    <>
      <form
        className="max-w-[450px] m-auto"
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
      >
        <Card variant="outlined">
          <CardContent className="flex flex-col gap-5">
            <Typography>Currency Form</Typography>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <FormControl error={Boolean(fieldState.error)}>
                    <FormLabel required>Name</FormLabel>
                    <Input
                      placeholder="name"
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.target.value);
                      }}
                    />
                    <FormHelperText>
                      {" "}
                      {fieldState.error?.message}
                    </FormHelperText>
                  </FormControl>
                );
              }}
            />

            <Controller
              name="symbol"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <FormControl error={Boolean(fieldState.error)}>
                    <FormLabel required>Symbol</FormLabel>
                    <Input
                      placeholder="symbol"
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.target.value);
                      }}
                    />
                    <FormHelperText>
                      {" "}
                      {fieldState.error?.message}
                    </FormHelperText>
                  </FormControl>
                );
              }}
            />
            <Controller
              name="rate"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <FormControl required error={Boolean(fieldState.error)}>
                    <FormLabel required>Rate</FormLabel>
                    <Input
                      value={field.value}
                      onChange={({ target: { value } }) => {
                        if (Number.isNaN(value)) {
                          field.onChange(0);
                        } else {
                          field.onChange(parseFloat(value));
                        }
                      }}
                      placeholder="amount"
                      slotProps={{
                        input: {
                          component: NumericFormatCustom,
                        },
                      }}
                    />{" "}
                    <FormHelperText>
                      {" "}
                      {fieldState.error?.message}
                    </FormHelperText>
                  </FormControl>
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
