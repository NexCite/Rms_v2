"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, DebitCreditType, Prisma } from "@prisma/client";
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
import SearchSelect from "@rms/components/ui/search-select";
import { Textarea } from "@rms/components/ui/textarea";
import useAlertHook from "@rms/hooks/alert-hooks";

import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { z } from "zod";
import LoadingButton from "@rms/components/ui/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rms/components/ui/select";
import { createPayment, updatePayment } from "@rms/service/payment-service";
import UploadWidget from "../upload/upload-widget";
import { Alert } from "@rms/components/ui/alert";

interface Props {
  id?: number;
  isEditMode?: boolean;
  invoices?: Prisma.InvoiceGetPayload<{}>[];
  value: Prisma.PaymentGetPayload<{ include: { media: true } }>;
}

export default function PaymentForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();
  const validation = useMemo(() => {
    return z.object({
      title: z
        .string()
        .min(1, { message: "Title must be at least 1 characters" }),
      description: z
        .string()
        .min(1, { message: "Description must be at least 1 characters" }),
      note: z.string().optional().nullable(),
      amount: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
      type: z.enum(Object.keys($Enums.PaymentType) as any),
      invoice_id: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
    });
  }, [props.value]);

  const form = useForm<z.infer<typeof validation>>({
    resolver: zodResolver(validation),
    defaultValues: props.value,
  });

  const [errors, setErrors] = useState<{ index?: number; message: string }[]>(
    []
  );

  const [media, setMedia] = useState<Prisma.MediaGetPayload<{}>>();
  const { createAlert } = useAlertHook();

  const handleSubmit = useCallback(
    (values: z.infer<any>) => {
      const result = validation.safeParse(values);
      const error = [];
      if (!props.isEditMode) {
        if (!form.getValues().type) {
          error.push({ message: "Missing  type" });
        }
        if (!form.getValues().amount) {
          error.push({ message: "Missing  amount" });
        }

        setErrors(error);
      }

      if (result.success === false) {
        return Object.keys(result.error.formErrors.fieldErrors).map((res) => {
          form.setError(res as any, {
            message: result.error.formErrors.fieldErrors[res][0],
          });
        });
      } else if (error.length > 0) {
        return;
      }

      // form.clearErrors([
      //   "title",
      //   "description",
      //   "amount",
      //   "type",
      //   "note",
      //   "invoice_id",
      // ]);

      values.amount = parseInt(values.amount);
      values.media = media
        ? {
            create: {
              path: media.path,
              title: media.title,
              type: "Pdf",
            },
          }
        : undefined;

      if (props.value) {
        setTransition(async () => {
          var value2 = JSON.parse(JSON.stringify(values));

          await updatePayment(props.value.id, value2).then((res) => {
            createAlert(res);
            Object.keys(res.errors ?? []).map((e) => {
              form.setError(e as any, res[e]);
            });

            if (res.status === 200) {
              back();
            }
          });
        });
      } else {
        setTransition(async () => {
          var value2 = JSON.parse(JSON.stringify(values));

          await createPayment(value2).then((res) => {
            createAlert(res);
            Object.keys(res.errors ?? []).map((e) => {
              form.setError(e as any, res[e]);
            });

            if (res.status === 200) {
              back();
            }
          });
        });
      }
    },
    [back, createAlert, form, media, props.value]
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
                  <h1 className="font-medium text-2xl">Invoice Form</h1>
                </div>
                <hr className="my-12 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
              </CardHeader>

              <CardContent>
                {errors.length > 0 && (
                  <Alert color="red" className="mb-10" variant="destructive">
                    {errors.map((res, index) => (
                      <h4 key={index}>{res.message} Invoice</h4>
                    ))}
                  </Alert>
                )}
                <div className="grid gap-4">
                  <div className="grid-cols-12">
                    <FormField
                      rules={{ required: true }}
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="required">
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="title"
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
                      name="description"
                      render={({ field }) => (
                        <FormItem className="required">
                          <FormLabel>Description</FormLabel>
                          <FormControl onChange={(e) => {}}>
                            <Textarea placeholder="description" {...field} />
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
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note (Admin)</FormLabel>
                          <FormControl onChange={(e) => {}}>
                            <Textarea placeholder="note" {...field} />
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
                      name="amount"
                      render={({ field }) => (
                        <FormItem className="required">
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="amount"
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
                  <div className="grid-cols-12">
                    <FormField
                      rules={{ required: true }}
                      control={form.control}
                      name={"type"}
                      render={({ field }) => (
                        <FormItem className="required">
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
                                {Object.keys($Enums.PaymentType).map((res) => (
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
                      name={"invoice_id"}
                      render={({ field }) => (
                        <FormItem className="required">
                          <FormLabel>Invoice</FormLabel>
                          <FormControl>
                            <SearchSelect
                              hit="search invoice"
                              label="invoice"
                              default={field.value as number}
                              data={props.invoices}
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
                    <UploadWidget
                      isPdf
                      path={props.value?.media?.path}
                      onSave={(e) => {
                        setMedia(
                          e
                            ? { path: e, title: e, type: "Pdf" }
                            : (undefined as any)
                        );
                      }}
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
