"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";
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

import { Input } from "@rms/components/ui/input";

import LoadingButton from "@rms/components/ui/loading-button";

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
  const { createAlert } = useAlertHook();

  const handleSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      setTransition(async () => {
        if (props.value) {
          setTransition(async () => {
            const result = await updateCurrency(props.value.id, values);
            createAlert(result);
            if (result.status === 200) back();
            Object.keys(result.errors ?? []).map((e) => {
              form.setError(e as any, result[e]);
            });
          });
        } else {
          setTransition(async () => {
            const result = await createCurrency(values as any);
            createAlert(result);
            if (result.status === 200) back();
            Object.keys(result.errors ?? []).map((e) => {
              form.setError(e as any, result[e]);
            });
          });
        }
      });
    },
    [back, createAlert, props.value, form]
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
                  <h1 className="font-medium text-2xl">Currency Form</h1>
                </div>
                <hr className="my-12 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
              </CardHeader>

              <CardContent>
                <div className="grid gap-4">
                  <div className="grid-cols-12">
                    <FormField
                      rules={{ required: true }}
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="required">
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
                      name="symbol"
                      render={({ field }) => (
                        <FormItem className="required">
                          <FormLabel>Symbol</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="symbol"
                              onChange={(e) => {}}
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
