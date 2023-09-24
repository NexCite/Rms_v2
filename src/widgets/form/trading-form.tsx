"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, Gender, Prisma } from "@prisma/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@rms/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@rms/components/ui/form";
import { Input } from "@rms/components/ui/input";
import LoadingButton from "@rms/components/ui/loading-button";
import SearchSelect from "@rms/components/ui/search-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rms/components/ui/select";
import useAlertHook from "@rms/hooks/alert-hooks";
import Countries from "@rms/lib/country";
import { createBroker, updateBroker } from "@rms/service/broker-service";
import { createTrader, updateTrader } from "@rms/service/trader-service";
import {
  createAccount,
  updateAccount,
} from "@rms/service/trading-account-service";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { z } from "zod";

type Props = {
  node: "account" | "broker" | "trader";
  relations?: {
    traders: Prisma.TraderGetPayload<{}>[];
    currencies: Prisma.CurrencyGetPayload<{}>[];
    brokers: Prisma.BrokerGetPayload<{}>[];
  };
  value?:
    | Prisma.AccountGetPayload<{}>
    | Prisma.BrokerGetPayload<{}>
    | Prisma.TraderGetPayload<{}>;
};

export default function TradingForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();
  const validation = useMemo(() => {
    switch (props.node) {
      case "trader":
      case "broker": {
        return z.object({
          first_name: z
            .string()
            .min(3, { message: "First Name must be at least 3 characters" }),
          last_name: z
            .string()
            .min(3, { message: "Last Name must be at least 3 characters" }),
          username: z
            .string()
            .min(3, { message: "Username must be at least 3 characters" }),
          phone_number: z
            .string()
            .regex(
              new RegExp(
                /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
              ),
              {
                message: "Invalid phone number",
              }
            ),
          gender: z.enum([Gender.Male, Gender.Female]),
          address1: z.string().optional().nullable(),
          address2: z.string().optional().nullable(),
          country: z.string(),
          email: z.string().optional().nullable(),
          [props.node === "trader" ? "broker_id" : "id"]: z.number(),
        });
      }
      case "account": {
        return z.object({
          id: z.number(),
          username: z
            .string()
            .min(3, { message: "Username must be at least 3 characters" }),
          trader_id: z.number(),
          currency_id: z.number(),
        });
      }
    }
  }, [props.node]);

  const form = useForm<z.infer<typeof validation>>({
    resolver: zodResolver(validation),
    defaultValues: props.value,
  });
  const { createAlert } = useAlertHook();

  const handleSubmit = useCallback(
    (values: z.infer<any>) => {
      if (props.value) {
        setTransition(async () => {
          var value2 = JSON.parse(JSON.stringify(values));
          switch (props.node) {
            case "broker": {
              await updateBroker(props.value.id, value2).then((res) => {
                createAlert(res);
                Object.keys(res.errors ?? []).map((e) => {
                  form.setError(e as any, res[e]);
                });

                if (res.status === 200) {
                  back();
                }
              });
              break;
            }
            case "account": {
              await updateAccount(props.value.id, value2).then((res) => {
                createAlert(res);
                Object.keys(res.errors ?? []).map((e) => {
                  form.setError(e as any, res[e]);
                });

                if (res.status === 200) {
                  back();
                }
              });
              break;
            }
            case "trader": {
              await updateTrader(props.value.id, value2).then((res) => {
                createAlert(res);
                Object.keys(res.errors ?? []).map((e) => {
                  form.setError(e as any, res[e]);
                });

                if (res.status === 200) {
                  back();
                }
              });
              break;
            }
          }
        });
      } else {
        setTransition(async () => {
          var value2 = JSON.parse(JSON.stringify(values));
          switch (props.node) {
            case "broker": {
              await createBroker(value2).then((res) => {
                createAlert(res);
                Object.keys(res.errors ?? []).map((e) => {
                  form.setError(e as any, res[e]);
                });

                if (res.status === 200) {
                  back();
                }
              });
              break;
            }
            case "account": {
              await createAccount(value2).then((res) => {
                createAlert(res);
                Object.keys(res.errors ?? []).map((e) => {
                  form.setError(e as any, res[e]);
                });

                if (res.status === 200) {
                  back();
                }
              });
              break;
            }
            case "trader": {
              await createTrader(value2).then((res) => {
                createAlert(res);
                Object.keys(res.errors ?? []).map((e) => {
                  form.setError(e as any, res[e]);
                });

                if (res.status === 200) {
                  back();
                }
              });
              break;
            }
          }
        });
      }
    },
    [form, back, props.node, props.value, createAlert]
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
                  <h1 className="font-medium text-2xl">
                    Form{" "}
                    {props.node === "broker"
                      ? "Broker"
                      : props.node === "account"
                      ? "Account"
                      : "Trader"}
                  </h1>
                </div>
                <hr className="my-12 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
              </CardHeader>

              <CardContent>
                <div className="grid gap-4">
                  {(props.node === "account" || props.node === "broker") && (
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
                                placeholder="id"
                                type="number"
                                onChange={(e) => {}}
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
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
                  {(props.node === "trader" || props.node === "broker") && (
                    <>
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
                          rules={{ required: false }}
                          control={form.control}
                          name="address1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address 1</FormLabel>
                              <FormControl>
                                <Input placeholder="address 1" {...field} />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid-cols-12">
                        <FormField
                          rules={{ required: false }}
                          control={form.control}
                          name="address2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address2</FormLabel>
                              <FormControl>
                                <Input placeholder="address2" {...field} />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                  {props.node === "account" && (
                    <>
                      <div className="grid-cols-12">
                        <FormField
                          rules={{ required: true }}
                          control={form.control}
                          name={"trader_id"}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Traders</FormLabel>
                              <FormControl>
                                <SearchSelect
                                  hit="search traders"
                                  label="Traders"
                                  default={field.value as number}
                                  data={props.relations[props.node]}
                                  onChange={(e) => {
                                    field.onChange(e);
                                  }}
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
                          name={"currency_id"}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Traders</FormLabel>
                              <FormControl>
                                <SearchSelect
                                  hit="search currencies"
                                  label="Currencies"
                                  default={field.value as number}
                                  data={props.relations[props.node]}
                                  onChange={(e) => {
                                    field.onChange(e);
                                  }}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                  {props.node === "trader" && (
                    <div className="grid-cols-12">
                      <FormField
                        rules={{ required: true }}
                        control={form.control}
                        name={"broker_id"}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brokers</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value as any}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="select broker" />
                                </SelectTrigger>
                                <SelectContent className="w-full p-0  max-h-[200px] overflow-y-auto">
                                  {props.relations?.brokers?.map((res) => (
                                    <SelectItem
                                      key={res.id}
                                      value={res.id.toString()}
                                    >
                                      {`(${res.id}) ${res.username} `}
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
  max-width: 100%;
  margin: auto;
  margin-top: 10px;
  text-transform: capitalize;
  h3 {
    font-weight: bold;
    font-size: 18pt;
    margin-bottom: 10px;
  }
  max-width: 450px;
`;
