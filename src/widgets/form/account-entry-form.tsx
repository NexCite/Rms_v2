"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, DidgitType, DebitCreditType, Prisma } from "@prisma/client";
import useAlertHook from "@rms/hooks/alert-hooks";
import {
  createAccountEntry,
  updateAccountEntry,
} from "@rms/service/account-entry-service";

import {
  Form,
  FormControl,
  FormDescription,
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
import Countries from "@rms/lib/country";
import { Alert, AlertTitle } from "@rms/components/ui/alert";
import LoadingButton from "@rms/components/ui/loading-button";

export default function AccountEntryForm(props: {
  account?: Prisma.Account_EntryGetPayload<{
    include: {
      more_than_four_digit: { include: { three_digit: true } };
      three_digit: { include: { two_digit: true } };
      two_digit: {};
    };
  }>;
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
        id: z.number(),
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
        country: z.string(),
        address_1: z.string().optional(),
        email: z.string().optional(),

        address_2: z.string().optional(),
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
          return !e.three_digit_id &&
            !e.more_than_four_digit_id &&
            !e.two_digit_id
            ? false
            : true;
        },
        {
          message: "Must be select digit",
          path: ["two_digit_id", "there_digit_id", "more_then_four_digit_id"],
        }
      );
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: props.account,
  });
  const { createAlert } = useAlertHook();

  const handleSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    setTransition(async () => {
      if (props.account) {
        await updateAccountEntry({
          where: {
            id: props.account.id,
          },
          data: {
            username: values.username,
            first_name: values.first_name,
            last_name: values.last_name,
            gender: values.gender,
            phone_number: values.phone_number,
            address1: values.address_1,
            address2: values.address_2,
            country: values.country,
            email: values.email,
            id: values.id,

            three_digit: values.three_digit_id
              ? {
                  connect: {
                    id: +values.three_digit_id,
                  },
                }
              : undefined,
            two_digit: values.two_digit_id
              ? {
                  connect: {
                    id: +values.two_digit_id,
                  },
                }
              : undefined,
            more_than_four_digit: values.more_than_four_digit_id
              ? {
                  connect: {
                    id: +values.more_than_four_digit_id,
                  },
                }
              : undefined,
          },
        } as any).then((res) => {
          createAlert(res);
          Object.keys(res.errors ?? []).map((e) => {
            form.setError(e as any, res[e]);
          });

          if (res.status === 200) {
            back();
          }
        });
      } else {
        await createAccountEntry({
          data: {
            username: values.username,
            first_name: values.first_name,
            last_name: values.last_name,
            gender: values.gender,
            phone_number: values.phone_number,
            address1: values.address_1,
            address2: values.address_2,
            country: values.country,
            email: values.email,
            id: values.id,
            two_digit: values.two_digit_id
              ? {
                  connect: {
                    id: +values.two_digit_id,
                  },
                }
              : undefined,
            three_digit: values.three_digit_id
              ? {
                  connect: {
                    id: +values.three_digit_id,
                  },
                }
              : undefined,
            more_than_four_digit: values.more_than_four_digit_id
              ? {
                  connect: {
                    id: +values.more_than_four_digit_id,
                  },
                }
              : undefined,
          },
        }).then((res) => {
          createAlert(res);
          Object.keys(res.errors ?? []).map((e) => {
            form.setError(e as any, res[e]);
          });
          if (res.status === 200) {
            back();
          }
        });
      }
    });
  }, []);
  const ref = useRef<HTMLFormElement>();
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
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="username"
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
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="first name" {...field} />
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
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="last name" {...field} />
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>{" "}
                  <div className="grid-cols-12">
                    <FormField
                      rules={{ required: true }}
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="phone number" {...field} />
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
                      name={"country"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="country" />
                              </SelectTrigger>
                              <SelectContent className="w-full p-0  max-h-[200px] overflow-y-auto">
                                {Countries.map((res) => (
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
                      name={"gender"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="gender" />
                              </SelectTrigger>
                              <SelectContent className="w-full p-0  max-h-[200px] overflow-y-auto">
                                <SelectItem value={$Enums.Gender.Male}>
                                  {$Enums.Gender.Male}
                                </SelectItem>
                                <SelectItem value={$Enums.Gender.Female}>
                                  {$Enums.Gender.Female}
                                </SelectItem>
                                <SelectItem value={$Enums.Gender.Other}>
                                  {$Enums.Gender.Other}
                                </SelectItem>
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
                      control={form.control}
                      name="two_digit_id"
                      render={(renderValue) => (
                        <FormItem>
                          <FormLabel>Two Digit</FormLabel>
                          <SearchSelect
                            default={renderValue.field.value}
                            disabled={
                              form.getValues("three_digit_id")
                                ? true
                                : form.getValues("more_than_four_digit_id")
                                ? true
                                : false
                            }
                            data={props.two_digit}
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
                  <div className="grid-cols-12">
                    <FormField
                      control={form.control}
                      name="three_digit_id"
                      render={(renderValue) => (
                        <FormItem>
                          <FormLabel>Three Digit</FormLabel>
                          <SearchSelect
                            default={renderValue.field.value}
                            disabled={
                              form.getValues("two_digit_id")
                                ? true
                                : form.getValues("more_than_four_digit_id")
                                ? true
                                : false
                            }
                            data={props.three_digit}
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
                  <div className="grid-cols-12">
                    <FormField
                      name="more_than_four_digit_id"
                      control={form.control}
                      render={(renderValue) => (
                        <FormItem>
                          <FormLabel>More Digit</FormLabel>
                          <SearchSelect
                            default={renderValue.field.value}
                            disabled={
                              form.getValues("three_digit_id")
                                ? true
                                : form.getValues("two_digit_id")
                                ? true
                                : false
                            }
                            data={props.more_digit}
                            hit="select more digit"
                            label="More Digit"
                            onChange={(e) => {
                              renderValue.field.onChange(e);
                            }}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {form.formState.errors.two_digit_id && (
                  <Alert variant="destructive" className="mt-10">
                    <AlertTitle>
                      {form.formState.errors.two_digit_id.message}
                    </AlertTitle>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <LoadingButton
                  type="submit"
                  label={props.account ? "Update" : "Add"}
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
