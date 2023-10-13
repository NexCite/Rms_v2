"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, DebitCreditType, DidgitType, Prisma } from "@prisma/client";

import { useRouter } from "next/navigation";

import styled from "@emotion/styled";
import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import LoadingButton from "@mui/lab/LoadingButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import {
  createMoreDigit,
  createThreeDigit,
  createTwoDigit,
  updateMoreDigit,
  updateThreeDigit,
  updateTwoDigit,
} from "@rms/service/digit-service";
import { useStore } from "@rms/hooks/toast-hook";
type Props = {
  relations?:
    | Prisma.More_Than_Four_DigitGetPayload<{}>[]
    | Prisma.Two_DigitGetPayload<{}>[];
} & (
  | {
      node: "three";
      value?: Prisma.Three_DigitGetPayload<{}>;
    }
  | {
      node: "two";

      value?: Prisma.Two_DigitGetPayload<{}>;
    }
  | {
      node: "more";

      value?: Prisma.More_Than_Four_DigitGetPayload<{
        include: { three_digit: true };
      }>;
    }
);
export default function DigitForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();
  const formSchema = useMemo(() => {
    switch (props.node) {
      case "two":
        return z.object({
          id: z.number().min(2).or(z.string().regex(/^\d+$/).transform(Number)),
          type: z
            .enum([
              DidgitType.Assets,
              DidgitType.Liabilities,
              DidgitType.Owner_Equity,
              DidgitType.Expensive,
              DidgitType.Income,
            ])
            .optional()
            .nullable(),
          debit_credit: z
            .enum([DebitCreditType.Debit, DebitCreditType.Credit])
            .optional()
            .nullable(),
          name: z
            .string()
            .min(1, { message: "Name must be at least 1  character" }),
        });
      case "three":
        return z.object({
          id: z.number().min(3).or(z.string().regex(/^\d+$/).transform(Number)),
          name: z
            .string()
            .min(1, { message: "Name must be at least 1  character" }),
          type: z
            .enum([
              DidgitType.Assets,
              DidgitType.Liabilities,
              DidgitType.Owner_Equity,
              DidgitType.Expensive,
              DidgitType.Income,
            ])
            .optional()
            .nullable(),
          debit_credit: z
            .enum([DebitCreditType.Debit, DebitCreditType.Credit])
            .optional()
            .nullable(),
          two_digit_id: z
            .number()
            .or(z.string().regex(/^\d+$/).transform(Number)),
        });

      case "more":
        return z.object({
          id: z.number().min(4).or(z.string().regex(/^\d+$/).transform(Number)),
          name: z
            .string()
            .min(1, { message: "Name must be at least 1  character" }),
          type: z
            .enum([
              DidgitType.Assets,
              DidgitType.Liabilities,
              DidgitType.Owner_Equity,
              DidgitType.Expensive,
              DidgitType.Income,
            ])
            .optional()
            .nullable(),
          debit_credit: z
            .enum([DebitCreditType.Debit, DebitCreditType.Credit])
            .optional()
            .nullable(),
          three_digit_id: z
            .number()
            .or(z.string().regex(/^\d+$/).transform(Number)),
        });
    }
  }, [props.node]);

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
            switch (props.node) {
              case "three":
                var value2 = JSON.parse(
                  JSON.stringify(values)
                ) as Prisma.Three_DigitUncheckedUpdateInput;
                value2.two_digit_id = +(value2.two_digit_id + "");
                await updateThreeDigit(props.value.id, value2).then((res) => {
                  store.OpenAlert(res);
                  Object.keys(res.errors ?? []).map((e) => {
                    form.setError(e as any, res[e]);
                  });
                  if (res.status === 200) {
                    back();
                  }
                });
                break;
              case "two":
                var value1 = JSON.parse(
                  JSON.stringify(values)
                ) as Prisma.Two_DigitUncheckedUpdateInput;

                await updateTwoDigit(props.value.id, value1).then((res) => {
                  store.OpenAlert(res);
                  Object.keys(res.errors ?? []).map((e) => {
                    form.setError(e as any, res[e]);
                  });
                  if (res.status === 200) {
                    back();
                  }
                });

                break;
              case "more":
                var value3 = JSON.parse(
                  JSON.stringify(values)
                ) as Prisma.More_Than_Four_DigitUncheckedUpdateInput;
                value3.three_digit_id = +(value3.three_digit_id + "");

                await updateMoreDigit(props.value.id, value3).then((res) => {
                  store.OpenAlert(res);
                  Object.keys(res.errors ?? []).map((e) => {
                    form.setError(e as any, res[e]);
                  });
                  if (res.status === 200) {
                    back();
                  }
                });

                break;
              default:
                break;
            }
          });
        } else {
          setTransition(async () => {
            switch (props.node) {
              case "three":
                var value2 = JSON.parse(
                  JSON.stringify(values)
                ) as Prisma.Three_DigitUncheckedCreateInput;
                value2.two_digit_id = +(value2.two_digit_id + "");
                await createThreeDigit(value2).then((res) => {
                  store.OpenAlert(res);
                  Object.keys(res.errors ?? []).map((e) => {
                    form.setError(e as any, res[e]);
                  });
                  if (res.status === 200) {
                    back();
                  }
                });
                break;
              case "two":
                var value1 = JSON.parse(
                  JSON.stringify(values)
                ) as Prisma.Two_DigitUncheckedCreateInput;

                await createTwoDigit(value1).then((res) => {
                  store.OpenAlert(res);
                  Object.keys(res.errors ?? []).map((e) => {
                    form.setError(e as any, res[e]);
                  });
                  if (res.status === 200) {
                    back();
                  }
                });

                break;
              case "more":
                var value3 = JSON.parse(
                  JSON.stringify(values)
                ) as Prisma.More_Than_Four_DigitUncheckedCreateInput;
                value3.three_digit_id = +(value3.three_digit_id + "");

                await createMoreDigit(value3).then((res) => {
                  store.OpenAlert(res);
                  Object.keys(res.errors ?? []).map((e) => {
                    form.setError(e as any, res[e]);
                  });
                  if (res.status === 200) {
                    back();
                  }
                });

                break;
              default:
                break;
            }
          });
        }
      });
    },
    [back, store, props.node, props.value, form]
  );
  return (
    <>
      <Style onSubmit={form.handleSubmit(handleSubmit)}>
        <form autoComplete="off" noValidate>
          <Card>
            <CardHeader
              className="capitalize"
              title={
                <>
                  <div className="flex justify-between items-center">
                    <h1
                      className="font-medium text-2xl"
                      style={{ textTransform: "capitalize" }}
                    >
                      {" "}
                      {props.node} Digit And More Form
                    </h1>
                  </div>
                  <hr className=" h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
                </>
              }
            >
              <hr className="my-12 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
            </CardHeader>

            <CardContent>
              <div className="grid gap-4">
                <div className="grid-cols-12">
                  <Controller
                    name={"id"}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        error={Boolean(fieldState?.error?.message)}
                        size="small"
                        required
                        helperText={fieldState.error?.message}
                        fullWidth
                        label="ID"
                        placeholder="id"
                      />
                    )}
                  />
                </div>

                <div className="grid-cols-12">
                  <Controller
                    name={"name"}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        error={Boolean(fieldState?.error?.message)}
                        size="small"
                        required
                        helperText={fieldState.error?.message}
                        fullWidth
                        label="Name"
                        placeholder="name"
                      />
                    )}
                  />
                </div>

                <div className="grid-cols-12">
                  <Controller
                    name="type"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <FormControl
                        fullWidth
                        size="small"
                        error={Boolean(fieldState?.error?.message)}
                      >
                        <InputLabel id="demo-simple-select-label">
                          Type
                        </InputLabel>

                        <Select
                          {...field}
                          size="small"
                          fullWidth
                          label="Type"
                          placeholder="type"
                          defaultValue={field.value}
                        >
                          <MenuItem key={-1} value={undefined}>
                            None
                          </MenuItem>

                          {Object.keys($Enums.DidgitType).map((res) => (
                            <MenuItem key={res} value={res}>
                              {" "}
                              {res}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>
                          {fieldState.error?.message}
                        </FormHelperText>
                      </FormControl>
                    )}
                  />
                </div>
                <div className="grid-cols-12">
                  <Controller
                    name="debit_credit"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <FormControl
                        fullWidth
                        size="small"
                        error={Boolean(fieldState?.error?.message)}
                      >
                        <InputLabel className="mb-3">Debit/Credit</InputLabel>
                        <Select
                          {...field}
                          label="Debit/Credit"
                          size="small"
                          fullWidth
                          defaultValue={field.value}
                        >
                          <MenuItem key={-1} value={undefined}>
                            None
                          </MenuItem>

                          {Object.keys($Enums.DebitCreditType).map((res) => (
                            <MenuItem key={res} value={res}>
                              {" "}
                              {res}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>
                          {fieldState.error?.message}
                        </FormHelperText>
                      </FormControl>
                    )}
                  />
                </div>
                {props.node !== "two" && (
                  <div className="grid-cols-12">
                    <Controller
                      name={
                        props.node === "three"
                          ? "two_digit_id"
                          : ("three_digit_id" as any)
                      }
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <FormControl
                          fullWidth
                          required
                          size="small"
                          error={Boolean(fieldState?.error?.message)}
                        >
                          <InputLabel className="mb-3">
                            {props.node === "three"
                              ? "Two Digit"
                              : "Three Digit"}
                          </InputLabel>
                          <Select
                            {...field}
                            size="small"
                            fullWidth
                            label={
                              props.node === "three"
                                ? "Two Digit"
                                : "Three Digit"
                            }
                            defaultValue={field.value}
                          >
                            {props.relations.map(
                              (res: Prisma.Two_DigitGetPayload<{}>) => (
                                <MenuItem key={res.id} value={res.id}>
                                  ({res.id}) {res.name}
                                </MenuItem>
                              )
                            )}
                          </Select>
                          <FormHelperText>
                            {fieldState.error?.message}
                          </FormHelperText>
                        </FormControl>
                      )}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <div className="flex justify-end5 m-5 mt-2">
              <LoadingButton
                fullWidth
                variant="contained"
                className="hover:bg-blue-gray-900   hover:text-brown-50 capitalize bg-black text-white"
                disableElevation
                loading={isPadding}
                type="submit"
              >
                Save
              </LoadingButton>
            </div>
          </Card>
        </form>
      </Style>
    </>
  );
}
const Style = styled.div`
  margin: auto;
  margin-top: 5px;
  max-width: 420px;
`;
