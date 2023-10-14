"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, Prisma } from "@prisma/client";
import {
  createAccount_Entry,
  updateAccount_Entry,
} from "@rms/service/account-entry-service";

import { useRouter } from "next/navigation";

import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import LoadingButton from "@mui/lab/LoadingButton";
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
import Countries from "@rms/lib/country";
import { useStore } from "@rms/hooks/toast-hook";

export default function Account_EntryForm(props: {
  account?: Prisma.Account_EntryGetPayload<{
    include: {
      more_than_four_digit: { include: { three_digit: true } };
      three_digit: { include: { two_digit: true } };
      two_digit: {};
    };
  }>;
  node: $Enums.Account_Entry_Type;
  three_digit: Prisma.Three_DigitGetPayload<{ include: { two_digit: true } }>[];
  two_digit: Prisma.Two_DigitGetPayload<{}>[];
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
        username: z
          .string()
          .min(1, { message: "Name must be at least 1  character" }),
        first_name: z
          .string()
          .min(1, { message: "Name must be at least 1  character" }),
        last_name: z
          .string()
          .min(1, { message: "Name must be at least 1  character" }),
        phone_number: z
          .string()

          .optional(),
        type: z
          .enum(Object.keys($Enums.Account_Entry_Type) as any)
          .default(props.node),
        country: z.string(),
        address1: z.string().optional(),
        email: z.string().optional(),

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
          // form.setError("two_digit_id", {
          //   message: "Must be select digit",
          //   type: "required",
          //   types: {},
          // });

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
  const store = useStore();

  const handleSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      setTransition(async () => {
        if (props.account) {
          await updateAccount_Entry(props.account.id, values, props.node).then(
            (res) => {
              store.OpenAlert(res);
              Object.keys(res.errors ?? []).map((e) => {
                form.setError(e as any, res[e]);
              });

              if (res.status === 200) {
                back();
              }
            }
          );
        } else {
          await createAccount_Entry(values as any, props.node).then((res) => {
            store.OpenAlert(res);
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
    [back, store, props.account, form]
  );
  return (
    <>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
        className="max-w-[450px] m-auto"
      >
        <Card>
          <CardHeader
            title={
              <div className="flex justify-between items-center flex-row">
                <Typography variant="h5">{props.node} From</Typography>
              </div>
            }
          ></CardHeader>
          <Divider />

          <CardContent>
            <div className="grid grid-cols-1 gap-4">
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
                      {...field}
                      value={field.value}
                      InputLabelProps={{ shrink: true }}
                      label="Reference"
                      required
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
              />{" "}
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
                name="two_digit_id"
                render={({ field, fieldState }) => (
                  <Autocomplete
                    disabled={
                      form.watch("more_than_four_digit_id")
                        ? true
                        : form.watch("three_digit_id")
                        ? true
                        : false
                    }
                    size="small"
                    isOptionEqualToValue={(e) => e.value === field.value}
                    defaultValue={(() => {
                      const result = props.two_digit.find(
                        (res) => res.id === field.value
                      );

                      return result
                        ? {
                            label: `(${result.id}) ${result.name}`,
                            value: result.id,
                          }
                        : undefined;
                    })()}
                    onChange={(e, v) => {
                      form.setValue("three_digit_id", undefined);
                      form.setValue("more_than_four_digit_id", undefined);
                      field.onChange(v?.value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Two Digit And More"
                        placeholder="two digit and more"
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                    options={props.two_digit.map((res) => ({
                      label: `(${res.id}) ${res.name}`,
                      value: res.id,
                    }))}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="three_digit_id"
                render={({ field, fieldState }) => (
                  <Autocomplete
                    size="small"
                    isOptionEqualToValue={(e) => e.value === field.value}
                    defaultValue={(() => {
                      const result = props.three_digit.find(
                        (res) => res.id === field.value
                      );

                      return result
                        ? {
                            label: `(${result.id}) ${result.name}`,
                            value: result.id,
                          }
                        : undefined;
                    })()}
                    disabled={
                      form.watch("two_digit_id")
                        ? true
                        : form.watch("more_than_four_digit_id")
                        ? true
                        : false
                    }
                    onChange={(e, v) => {
                      form.setValue("two_digit_id", undefined);
                      form.setValue("more_than_four_digit_id", undefined);
                      field.onChange(v?.value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Three Digit And More"
                        placeholder="three digit and more"
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                    options={props.three_digit.map((res) => ({
                      label: `(${res.id}) ${res.name}`,
                      value: res.id,
                    }))}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="more_than_four_digit_id"
                render={({ field, fieldState }) => (
                  <Autocomplete
                    size="small"
                    disabled={
                      form.watch("two_digit_id")
                        ? true
                        : form.watch("three_digit_id")
                        ? true
                        : false
                    }
                    isOptionEqualToValue={(e) => e.value === field.value}
                    defaultValue={(() => {
                      const result = props.more_digit.find(
                        (res) => res.id === field.value
                      );

                      return result
                        ? {
                            label: `(${result.id}) ${result.name}`,
                            value: result.id,
                          }
                        : undefined;
                    })()}
                    onChange={(e, v) => {
                      form.setValue("two_digit_id", undefined);
                      form.setValue("three_digit_id", undefined);
                      field.onChange(v?.value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Four Digit And More"
                        placeholder="four digit and more"
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                    options={props.more_digit.map((res) => ({
                      label: `(${res.id}) ${res.name}`,
                      value: res.id,
                    }))}
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
              <LoadingButton
                variant="contained"
                fullWidth
                className="hover:bg-blue-gray-900  hover:text-brown-50 capitalize bg-black text-white "
                disableElevation
                type="submit"
                loading={isPadding}
              >
                Save
              </LoadingButton>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
