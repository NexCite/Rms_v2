"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, Prisma } from "@prisma/client";
import {
  createAccountEntry,
  updateAccountEntry,
} from "@rms/service/account-entry-service";

import { useRouter } from "next/navigation";

import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  Alert,
  AlertTitle,
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { useToast } from "@rms/hooks/toast-hook";
import Countries from "@rms/lib/country";
import NexCiteButton from "@rms/components/button/nexcite-button";
import NexCiteCard from "@rms/components/card/nexcite-card";

export default function Account_EntryForm(props: {
  account?: Prisma.Account_EntryGetPayload<{
    include: {
      more_than_four_digit: { include: { three_digit: true } };
      three_digit: { include: { two_digit: true } };
      two_digit: {};
      currency: true;
    };
  }>;
  node: $Enums.Account_Entry_Type;
  three_digit: Prisma.Three_DigitGetPayload<{ include: { two_digit: true } }>[];
  two_digit: Prisma.Two_DigitGetPayload<{}>[];
  currency: Prisma.CurrencyGetPayload<{}>[];
  more_digit: Prisma.More_Than_Four_DigitGetPayload<{
    include: { three_digit: true };
  }>[];
}) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();

  const formSchema = useMemo(() => {
    return z
      .object({
        id: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
        username: z.string().min(3),
        first_name: z
          .string()
          .min(1, { message: "Name must be at least 1  character" }),
        last_name: z
          .string()
          .min(1, { message: "Name must be at least 1  character" }),
        phone_number: z.string().optional(),
        type: z
          .enum(Object.keys($Enums.Account_Entry_Type) as any)
          .default(props.node),
        info: z.string().optional().nullable(),
        country: z.string(),
        address1: z.string().optional(),
        email: z.string().optional(),
        currency_id: z
          .number()
          .or(z.string().regex(/^\d+$/).transform(Number))
          .optional()
          .nullable(),

        address2: z.string().optional(),
        two_digit_id: z
          .number()

          .optional()
          .nullable(),
        three_digit_id: z
          .number()

          .optional()
          .nullable(),
        more_than_four_digit_id: z
          .number()

          .optional()
          .nullable(),
        gender: z.enum([
          $Enums.Gender.Male,
          $Enums.Gender.Female,
          $Enums.Gender.Other,
        ]),
      })
      .refine(
        (e) => {
          if (
            !e.three_digit_id &&
            !e.more_than_four_digit_id &&
            !e.two_digit_id
          ) {
            return false;
          }
          return true;
        },
        {
          message: "Need to select digit",
          path: ["two_digit_id"],
        }
      );
  }, [props.node]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: props.account,
  });
  const toast = useToast();
  const watch = useWatch({ control: form.control });

  const handleSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      setTransition(async () => {
        if (props.account) {
          await updateAccountEntry(props.account.id, values, props.node).then(
            (res) => {
              toast.OpenAlert(res);
              Object.keys(res?.errors ?? []).map((e) => {
                form.setError(e as any, res[e]);
              });

              if (res.status === 200) {
                back();
              }
            }
          );
        } else {
          await createAccountEntry(values as any, props.node).then((res) => {
            toast.OpenAlert(res);
            Object.keys(res.errors ?? []).map((e) => {
              form.setError(e as any, res[e]);
            });
            if (res.status === 200) {
              back();
            }
          });
        }
      });
    },
    [back, toast, props.account, form, props.node]
  );

  const defualtSelect = useMemo(() => {
    const two_digit =
      props.two_digit.find((res) => res.id === watch.two_digit_id) ?? null;
    const currecny =
      props.currency.find((res) => res.id === watch.currency_id) ?? null;
    const three_digit =
      props.three_digit.find((res) => res.id === watch.three_digit_id) ?? null;
    const more_digit =
      props.more_digit.find(
        (res) => res.id === watch.more_than_four_digit_id
      ) ?? null;
    return {
      two_digit,
      three_digit,
      more_digit,
      currecny,
    };
  }, [
    watch.more_than_four_digit_id,
    watch.three_digit_id,
    watch.two_digit_id,
    watch.currency_id,
  ]);
  return (
    <>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
        className="max-w-[450px] m-auto w-full"
      >
        <NexCiteCard title={props.node + " From"}>
          <CardContent className="grid grid-cols-1 gap-4">
            <Controller
              control={form.control}
              name="id"
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    required
                    label="Id"
                    InputLabelProps={{ shrink: true }}
                    {...field}
                    value={field.value}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState?.error?.message}
                    placeholder="id"
                    type="number"
                    size="small"
                    fullWidth
                  />
                </>
              )}
            />
            <Controller
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    required
                    {...field}
                    value={field.value}
                    InputLabelProps={{ shrink: true }}
                    label="Reference"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState?.error?.message}
                    placeholder="reference"
                    size="small"
                    fullWidth
                  />
                </>
              )}
            />
            <Controller
              control={form.control}
              name="first_name"
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    {...field}
                    value={field.value}
                    InputLabelProps={{ shrink: true }}
                    label="First Name"
                    required
                    error={Boolean(fieldState.error)}
                    helperText={fieldState?.error?.message}
                    placeholder="first name"
                    size="small"
                    fullWidth
                  />
                </>
              )}
            />
            <Controller
              control={form.control}
              name="last_name"
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    required
                    label="Last Name"
                    InputLabelProps={{ shrink: true }}
                    {...field}
                    value={field.value}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState?.error?.message}
                    placeholder="last name"
                    size="small"
                    fullWidth
                  />
                </>
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    label="Email"
                    InputLabelProps={{ shrink: true }}
                    {...field}
                    value={field.value}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState?.error?.message}
                    placeholder="email"
                    size="small"
                    fullWidth
                  />
                </>
              )}
            />
            <Controller
              control={form.control}
              name="info"
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    {...field}
                    value={field.value}
                    InputLabelProps={{ shrink: true }}
                    label="Info"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState?.error?.message}
                    placeholder="info"
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={5}
                  />
                </>
              )}
            />
            <Controller
              control={form.control}
              name="gender"
              render={({ field, fieldState }) => (
                <Autocomplete
                  size="small"
                  isOptionEqualToValue={(e) => e === field.value}
                  onChange={(e, v) => {
                    field.onChange(v);
                  }}
                  defaultValue={field.value}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(fieldState.error)}
                      helperText={fieldState?.error?.message}
                      {...params}
                      label="Gender"
                      placeholder="gender"
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  )}
                  options={Object.keys($Enums.Gender)}
                />
              )}
            />
            <Controller
              control={form.control}
              name="phone_number"
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    label="Phone Number"
                    InputLabelProps={{ shrink: true }}
                    {...field}
                    value={field.value}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState?.error?.message}
                    placeholder="phone number"
                    size="small"
                    fullWidth
                  />
                </>
              )}
            />
            <Controller
              control={form.control}
              name="country"
              render={({ field, fieldState }) => (
                <>
                  <Autocomplete
                    size="small"
                    {...field}
                    value={field.value}
                    options={Countries}
                    onChange={(e, v) => field.onChange(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Country"
                        required
                        placeholder="country"
                        error={Boolean(fieldState.error)}
                        helperText={fieldState?.error?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </>
              )}
            />
            <Controller
              control={form.control}
              name="address1"
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    label="Address 1"
                    InputLabelProps={{ shrink: true }}
                    {...field}
                    value={field.value}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState?.error?.message}
                    placeholder="address 1"
                    size="small"
                    fullWidth
                  />
                </>
              )}
            />
            <Controller
              control={form.control}
              name="address2"
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    required
                    label="Address 2"
                    InputLabelProps={{ shrink: true }}
                    {...field}
                    value={field.value}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState?.error?.message}
                    placeholder="address 2"
                    size="small"
                    fullWidth
                  />
                </>
              )}
            />
            <Controller
              control={form.control}
              name="currency_id"
              render={({ field, fieldState }) => (
                <Autocomplete
                  size="small"
                  isOptionEqualToValue={(e) => e.id === field.value}
                  value={defualtSelect.currecny}
                  getOptionLabel={(e) => `(${e.id}) ${e.name}`}
                  onChange={(e, v) => {
                    field.onChange(v?.id ?? null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Currency"
                      placeholder="currency"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  options={props.currency}
                />
              )}
            />
            <Controller
              control={form.control}
              name="two_digit_id"
              render={({ field, fieldState }) => (
                <Autocomplete
                  size="small"
                  isOptionEqualToValue={(e) => e.id === field.value}
                  value={defualtSelect.two_digit}
                  getOptionLabel={(e) => `(${e.id}) ${e.name}`}
                  onChange={(e, v) => {
                    form.setValue("three_digit_id", null);
                    form.setValue("more_than_four_digit_id", null);
                    field.onChange(v?.id ?? null);
                  }}
                  groupBy={(e) => e.type}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Two Digit And More"
                      placeholder="two digit and more"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  options={props.two_digit}
                />
              )}
            />
            <Controller
              control={form.control}
              name="three_digit_id"
              render={({ field, fieldState }) => (
                <Autocomplete
                  groupBy={(e) => e.type}
                  size="small"
                  isOptionEqualToValue={(e) => e.id === field.value}
                  value={defualtSelect.three_digit}
                  getOptionLabel={(e) => `(${e.id}) ${e.name}`}
                  onChange={(e, v) => {
                    form.setValue("two_digit_id", null);
                    form.setValue("more_than_four_digit_id", null);
                    field.onChange(v?.id ?? null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Three Digit And More"
                      placeholder="three digit and more"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  options={props.three_digit}
                />
              )}
            />
            <Controller
              control={form.control}
              name="more_than_four_digit_id"
              render={({ field, fieldState }) => (
                <Autocomplete
                  groupBy={(e) => e.type}
                  size="small"
                  isOptionEqualToValue={(e) => e.id === field.value}
                  value={defualtSelect.more_digit}
                  onChange={(e, v) => {
                    form.setValue("two_digit_id", null);
                    form.setValue("three_digit_id", null);
                    field.onChange(v?.id ?? null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Four Digit And More"
                      placeholder="four digit and more"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  getOptionLabel={(e) => `(${e.id}) ${e.name}`}
                  options={props.more_digit}
                />
              )}
            />{" "}
            {form.formState.errors.two_digit_id && (
              <Alert severity="error" className="">
                <AlertTitle>
                  {form.formState.errors.two_digit_id.message}
                </AlertTitle>
              </Alert>
            )}
            <NexCiteButton isPadding={isPadding} />
          </CardContent>
        </NexCiteCard>
      </form>
    </>
  );
}
