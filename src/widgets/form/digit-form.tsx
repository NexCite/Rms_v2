"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, DidgitType, DebitCreditType, Prisma } from "@prisma/client";
import useAlertHook from "@rms/hooks/alert-hooks";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@rms/components/ui/form";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@rms/components/ui/card";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { z } from "zod";
import { Button } from "@rms/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@rms/components/ui/input";
import SearchSelect from "@rms/components/ui/search-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@rms/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";

import LoadingButton from "@rms/components/ui/loading-button";
import {
  createMoreDigit,
  createThreeDigit,
  createTwoDigit,
  updateMoreDigit,
  updateThreeDigit,
  updateTwoDigit,
} from "@rms/service/digit-service";
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
          id: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
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
          id: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
          name: z
            .string()
            .min(1, { message: "Name must be at least 1  character" }),
          type: z.enum([
            DidgitType.Assets,
            DidgitType.Liabilities,
            DidgitType.Owner_Equity,
            DidgitType.Expensive,
            DidgitType.Income,
          ]),
          debit_credit: z.enum([DebitCreditType.Debit, DebitCreditType.Credit]),
          two_digit_id: z
            .number()
            .or(z.string().regex(/^\d+$/).transform(Number)),
        });

      case "more":
        return z.object({
          id: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
          name: z
            .string()
            .min(1, { message: "Name must be at least 1  character" }),
          type: z.enum([
            DidgitType.Assets,
            DidgitType.Liabilities,
            DidgitType.Owner_Equity,
            DidgitType.Expensive,
            DidgitType.Income,
          ]),
          debit_credit: z.enum([DebitCreditType.Debit, DebitCreditType.Credit]),
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
  const { createAlert } = useAlertHook();

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
                  createAlert(res);
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
                  createAlert(res);
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
                  createAlert(res);
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
                  createAlert(res);
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
                  createAlert(res);
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
                  createAlert(res);
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
    [back, createAlert, props.node, props.value, form]
  );
  return (
    <>
      <Style className="card" onSubmit={form.handleSubmit(handleSubmit)}>
        <Form {...form}>
          <form className="card" autoComplete="off">
            <Card>
              <CardHeader>
                {" "}
                <div className="flex justify-between items-center">
                  <h1 className="font-medium text-2xl">Entry Form</h1>
                </div>
                <hr className="my-12 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
              </CardHeader>

              <CardContent>
                <div className="grid gap-4">
                  <div className="grid-cols-12">
                    <FormField
                      rules={{ required: true }}
                      control={form.control}
                      name="id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="id"
                              onChange={(e) => {
                                field.onChange(
                                  parseInt(
                                    Number.isNaN(e)
                                      ? 0
                                      : (parseInt(e as any) as any)
                                  )
                                );
                              }}
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid-cols-12">
                    <FormField
                      rules={{ required: true }}
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="name"
                              onChange={(e) => {}}
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid-cols-12">
                    <FormField
                      rules={{ required: true }}
                      control={form.control}
                      name={"type"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="type" />
                              </SelectTrigger>
                              <SelectContent className="w-full p-0  max-h-[200px] overflow-y-auto">
                                {Object.keys($Enums.DidgitType).map((res) => (
                                  <SelectItem key={res} value={res}>
                                    {res}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid-cols-12">
                    <FormField
                      rules={{ required: true }}
                      control={form.control}
                      name={"debit_credit"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Debit/Credit</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="debit/credit" />
                              </SelectTrigger>
                              <SelectContent className="w-full p-0  max-h-[200px] overflow-y-auto">
                                {Object.keys($Enums.DebitCreditType).map(
                                  (res) => (
                                    <SelectItem key={res} value={res}>
                                      {res}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {props.node === "three" && (
                    <div className="grid-cols-12">
                      <FormField
                        control={form.control}
                        name="two_digit_id"
                        render={(renderValue) => (
                          <FormItem>
                            <FormLabel>Two Digit</FormLabel>
                            <SearchSelect
                              default={renderValue.field.value}
                              data={props.relations}
                              hit="select two digit"
                              label="Two Digit"
                              onChange={(e) => {
                                renderValue.field.onChange(e);
                              }}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  {props.node === "more" && (
                    <div className="grid-cols-12">
                      <FormField
                        control={form.control}
                        name="three_digit_id"
                        render={(renderValue) => (
                          <FormItem>
                            <FormLabel>Three Digit</FormLabel>
                            <SearchSelect
                              default={renderValue.field.value}
                              data={props.relations}
                              hit="select three digit"
                              label="Three Digit"
                              onChange={(e) => {
                                renderValue.field.onChange(e);
                              }}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <LoadingButton
                  type="submit"
                  label={props.value ? "Update" : "Add"}
                  loading={isPadding}
                />
              </CardFooter>
            </Card>
          </form>
        </Form>
      </Style>
    </>
  );
}
const Style = styled.div`
  margin: auto;
  margin-top: 5px;
  max-width: 720px;
`;
