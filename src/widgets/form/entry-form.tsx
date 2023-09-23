"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, EntryType, Prisma, Status } from "@prisma/client";
import { Alert } from "@rms/components/ui/alert";
import { Button } from "@rms/components/ui/button";
import { Card, CardContent, CardHeader } from "@rms/components/ui/card";
import DatePicker from "@rms/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@rms/components/ui/form";
import { Input } from "@rms/components/ui/input";
import { Label } from "@rms/components/ui/label";
import SearchSelect from "@rms/components/ui/search-select";
import SelectMenu from "@rms/components/ui/select-menu";
import { Textarea } from "@rms/components/ui/textarea";
import useAlertHook from "@rms/hooks/alert-hooks";
import { FormatNumber, FormatNumberWithFixed } from "@rms/lib/global";
import { createEntry, updateEntry } from "@rms/service/entry-service";
import { DeleteIcon, Loader2, PlusSquare, Text, X } from "lucide-react";

import moment from "moment";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { number, z } from "zod";
import UploadWidget from "../upload/upload-widget";
import LoadingButton from "@rms/components/ui/loading-button";

interface Props {
  id?: number;
  entry?: Prisma.EntryGetPayload<{ include: { media: true } }>;
  isEditMode?: boolean;
  more_than_four_digit: {
    three_digit: {
      id: number;
      name: string;
    };
    id: number;
    name: string;
  }[];
  two_digit: {
    id: number;
    name: string;
    create_date: Date;
    modified_date: Date;
    status: $Enums.Status;
    user_id: number;
    type: $Enums.DidgitType;
    debit_credit: $Enums.DebitCreditType;
  }[];
  three_digit: {
    id: number;
    name: string;
    two_digit: {
      id: number;
      name: string;
    };
  }[];
  account_entry: {
    id: number;
    username: string;
  }[];
  currencies: Prisma.CurrencyGetPayload<{}>[];
}
type Type = {
  title?: string;
  description: string;
  note?: string;
  to_date?: Date;
  sub_entries?: Prisma.SubEntryCreateManyInput[];
  media?: Prisma.MediaCreateNestedOneWithoutEntryInput;
  currency_id: number;
};

export default function EntryForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();
  const [forms, setForms] = useState<Type>({
    title: props.entry?.title,
    description: props.entry?.description,
    note: props.entry?.note,
    currency_id: props.entry?.currency_id,
    sub_entries: [],
    to_date: new Date(),
  });

  const formSchema = props.isEditMode
    ? z.object({
        title: z.string().min(3),
        description: z.string().min(3),
        note: z.string().optional(),
        currency: z.object({
          connect: z.object({ id: z.number() }),
        }),
      })
    : z.object({
        title: z.string().min(3),
        description: z.string().min(3),
        note: z.string().optional(),
        currency: z.object({ connect: z.object({ id: z.number() }) }),
        sub_entries: z.object({
          createMany: z.object({
            data: z
              .array(
                z.object({
                  type: z.enum([
                    $Enums.DebitCreditType.Debit,
                    $Enums.DebitCreditType.Credit,
                  ]),
                  amount: z.number().min(0),
                  account_entry_id: z.number().optional(),
                  three_digit_id: z.number().optional(),
                  two_digit_id: z.number().optional(),
                  reference_id: z.number().optional(),

                  more_than_four_digit_id: z.number().optional(),
                })
              )
              .min(2),
          }),
        }),
        media: z
          .object({
            create: z.object({
              path: z.string(),
              type: z.enum([$Enums.MediaType.Pdf]).default("Pdf"),
              title: z.string(),
            }),
          })
          .optional(),
        to_date: z.date(),
      });

  const [errors, setErrors] = useState<{ index?: number; message: string }[]>(
    []
  );

  const { createAlert } = useAlertHook();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: props.entry,
  });

  useEffect(() => {
    if (props.isEditMode) {
      setForms(props.entry as any);
    }
  }, [props.isEditMode, props.entry]);

  const [media, setMedia] = useState<Prisma.MediaGetPayload<{}>>();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLButtonElement>) => {
      var m: Prisma.EntryCreateInput;
      m = {
        description: forms.description,
        title: forms.title,
        to_date: forms.to_date,
        note: forms.note,
        currency: { connect: { id: forms.currency_id } },
        sub_entries: props.isEditMode
          ? undefined
          : {
              createMany: {
                data: forms.sub_entries.map((res) => ({
                  amount: res.amount,
                  status: res.status,
                  type: res.type,
                  account_entry_id:
                    res.account_entry_id === 0
                      ? undefined
                      : res.account_entry_id,
                  two_digit_id:
                    res.two_digit_id === 0 ? undefined : res.two_digit_id,
                  three_digit_id:
                    res.three_digit_id === 0 ? undefined : res.three_digit_id,
                  more_than_four_digit_id:
                    res.more_than_four_digit_id === 0
                      ? undefined
                      : res.more_than_four_digit_id,
                  reference_id:
                    res.reference_id === 0 ? undefined : res.reference_id,
                })),
              },
            },
        media: media
          ? {
              create: {
                path: media.path,
                title: media.title,
                type: "Pdf",
              },
            }
          : undefined,
      };
      const result = formSchema.safeParse(m);
      console.log(m);
      form.clearErrors([
        "currency",
        "description",
        "currency.connect.id",
        "description",
        "currency",
        "note",
        "title",
      ]);
      const error = [];
      var debit = 0;
      var credit = 0;
      if (!props.isEditMode) {
        forms.sub_entries.map((res, i) => {
          if (res.type === "Debit") debit += res.amount;
          else if (res.type === "Credit") credit += res.amount;
          if (
            !res.three_digit_id &&
            !res.more_than_four_digit_id &&
            !res.account_entry_id &&
            !res.two_digit_id
          ) {
            error.push({ index: i + 1, message: "Missing  client or level" });
          }
          if (!res.type) {
            error.push({ index: i + 1, message: "Missing  type" });
          }
        });

        if (debit - credit !== 0)
          error.push({
            index: undefined,
            message: "Debit must be equal Credit",
          });
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
      } else {
        form.clearErrors([
          "currency",
          "description",
          "currency.connect.id",
          "description",
          "currency",
          "note",
          "title",
        ]);
        setTransition(async () => {
          if (props.isEditMode) {
            const result = await updateEntry(props.id, {
              title: m.title,
              currency: m.currency,
              description: m.description,
              note: m.note,
            });
            createAlert(result);
            if (result.status === 200) {
              back();
            }
          } else {
            const result = await createEntry(m);
            createAlert(result);
            console.log(result.status);
            if (result.status === 200) {
              back();
            }
          }
        });
      }
    },
    [props, forms]
  );

  return (
    <Style className="max-h-full  rounded-lg p-5">
      <Form {...form}>
        <form className="card" autoComplete="off">
          <Card>
            <CardHeader>
              {" "}
              <div className="flex justify-between items-center">
                <h1 className="font-medium text-2xl">Entry Form</h1>
                <LoadingButton
                  label={props.isEditMode ? "Update" : "Add"}
                  type="submit"
                  loading={isPadding}
                />
              </div>
              <hr className="my-12 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
            </CardHeader>

            <CardContent>
              {errors.length > 0 && (
                <Alert color="red" className="mb-10" variant="destructive">
                  {errors.map((res) => (
                    <h4 key={res.index}>
                      {res.message} SubEntry{" "}
                      {res.index && <span>{res.index}</span>}
                    </h4>
                  ))}
                </Alert>
              )}
              <div>
                <div className="grid">
                  <div className="grid-cols-12">
                    <FormField
                      rules={{ required: true }}
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl
                            onChange={(e) => {
                              setForms((prev) => ({
                                ...prev,
                                title: (e.target as any).value,
                              }));
                            }}
                          >
                            <Input
                              placeholder="title"
                              onChange={(e) => {
                                setForms((prev) => ({
                                  ...prev,
                                  title: e.target.value,
                                }));
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
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl
                            onChange={(e) => {
                              setForms((prev) => ({
                                ...prev,
                                description: (e.target as any).value,
                              }));
                            }}
                          >
                            <Textarea placeholder="description" {...field} />
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
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note (Admin)</FormLabel>
                          <FormControl
                            onChange={(e) => {
                              setForms((prev) => ({
                                ...prev,
                                note: (e.target as any).value,
                              }));
                            }}
                          >
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
                      name={"currency_id " as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <SearchSelect
                              default={forms?.currency_id}
                              data={props.currencies}
                              hit="select currency"
                              label="Currencies"
                              onChange={(e) => {
                                setForms((prev) => ({
                                  ...prev,
                                  currency_id: e,
                                }));
                              }}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {!props.isEditMode && (
                    <div className="grid-cols-12">
                      <FormField
                        name={"" as any}
                        rules={{ required: true }}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <DatePicker
                                name="to_date"
                                default={forms?.to_date}
                                onChange={(e) => {
                                  setForms((prev) => ({
                                    ...prev,
                                    to_date: e,
                                  }));
                                }}
                                maxDate={moment().endOf("day").toDate()}
                                minDate={moment().subtract(9, "day").toDate()}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  {!props.isEditMode && (
                    <div className="grid-cols-12">
                      {
                        <UploadWidget
                          onSave={(e) => {
                            setMedia({ path: e, title: e, type: "Pdf" } as any);
                          }}
                        />
                      }
                    </div>
                  )}
                </div>
                {!props.isEditMode && (
                  <>
                    <div style={{ margin: "20px 0px 8px" }}>
                      <h1 className="text-2xl">Entries</h1>
                    </div>
                    <hr className=" h-[0.3px] border-t-0 bg-gray-600 opacity-25 dark:opacity-50 mt-5 mb-4" />
                    {forms?.sub_entries?.map((res, i) => (
                      <div className="mb-5 ">
                        <div className="flex justify-between items-center">
                          <h1>SubEntry: {i + 1}</h1>
                          <Button
                            onClick={() => {
                              setErrors([]);

                              setForms((prev) => ({
                                ...prev,
                                sub_entries: prev.sub_entries.filter(
                                  (res, ii) => i !== ii
                                ),
                              }));
                            }}
                            size="sm"
                            className="bg-black"
                            color="dark"
                            type="button"
                          >
                            <X size="15" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            name="amount"
                            render={() => (
                              <FormItem>
                                <FormLabel>Amount</FormLabel>

                                <Input
                                  id={`amount-${i}`}
                                  defaultValue={1.0}
                                  type="number"
                                  onChange={(e) => {
                                    if (Number.isNaN(e.target.value)) {
                                      forms.sub_entries[i].amount = 1;
                                    } else {
                                      forms.sub_entries[i].amount =
                                        +e.target.value;
                                    }

                                    setForms((prev) => ({
                                      ...prev,
                                      sub_entries: prev.sub_entries,
                                    }));
                                  }}
                                  placeholder="amount"
                                  step=".01"
                                />
                                <FormDescription>
                                  {
                                    props.currencies.find(
                                      (res) => forms.currency_id === res.id
                                    )?.symbol
                                  }{" "}
                                  {FormatNumberWithFixed(res.amount)}
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <div>
                            <FormField
                              name="type"
                              render={() => (
                                <FormItem>
                                  <FormLabel>Type</FormLabel>
                                  <SelectMenu
                                    default={
                                      i == 0
                                        ? "Debit"
                                        : i == 1
                                        ? "Credit"
                                        : undefined
                                    }
                                    data={[
                                      $Enums.DebitCreditType.Debit,
                                      $Enums.DebitCreditType.Credit,
                                    ]}
                                    hit="select type"
                                    label="Type"
                                    onChange={(e) => {
                                      forms.sub_entries[i].type = e as any;
                                      setForms((prev) => ({
                                        ...prev,
                                        sub_entries: prev.sub_entries,
                                      }));
                                    }}
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1  md:grid-cols-2 gap-4 mt-3">
                          <FormField
                            name="two_digit"
                            render={() => (
                              <FormItem>
                                <FormLabel>Two Digit</FormLabel>
                                <SearchSelect
                                  disabled={
                                    res.three_digit_id
                                      ? true
                                      : res.more_than_four_digit_id
                                      ? true
                                      : res.account_entry_id
                                      ? true
                                      : false
                                  }
                                  data={props.two_digit}
                                  hit="select two digit"
                                  label="Two Digit"
                                  onChange={(e) => {
                                    forms.sub_entries[i].two_digit_id =
                                      e as any;
                                    setForms((prev) => ({
                                      ...prev,
                                      sub_entries: prev.sub_entries,
                                    }));
                                  }}
                                />
                              </FormItem>
                            )}
                          />
                          <FormField
                            name="three_digit"
                            render={() => (
                              <FormItem>
                                <FormLabel>There Digit</FormLabel>
                                <SearchSelect
                                  disabled={
                                    res.two_digit_id
                                      ? true
                                      : res.more_than_four_digit_id
                                      ? true
                                      : res.account_entry_id
                                      ? true
                                      : false
                                  }
                                  data={props.three_digit}
                                  hit="select three digit"
                                  label="Three Digit"
                                  onChange={(e) => {
                                    forms.sub_entries[i].three_digit_id = e;
                                    setForms((prev) => ({
                                      ...prev,
                                      sub_entries: prev.sub_entries,
                                    }));
                                  }}
                                />
                              </FormItem>
                            )}
                          />
                          <FormField
                            name="more_digit"
                            render={() => (
                              <FormItem>
                                <FormLabel>More Digit</FormLabel>
                                <SearchSelect
                                  disabled={
                                    res.three_digit_id
                                      ? true
                                      : res.two_digit_id
                                      ? true
                                      : res.account_entry_id
                                      ? true
                                      : false
                                  }
                                  data={props.more_than_four_digit}
                                  hit="select two digit"
                                  label="Two Digit"
                                  onChange={(e) => {
                                    forms.sub_entries[
                                      i
                                    ].more_than_four_digit_id = e as any;
                                    setForms((prev) => ({
                                      ...prev,
                                      sub_entries: prev.sub_entries,
                                    }));
                                  }}
                                />
                              </FormItem>
                            )}
                          />
                          <FormField
                            name="account"
                            render={() => (
                              <FormItem>
                                <FormLabel>Account</FormLabel>
                                <SearchSelect
                                  disabled={
                                    res.three_digit_id
                                      ? true
                                      : res.two_digit_id
                                      ? true
                                      : res.reference_id
                                      ? true
                                      : false
                                  }
                                  data={props.account_entry}
                                  hit="select account"
                                  label="Account"
                                  onChange={(e) => {
                                    forms.sub_entries[i].account_entry_id =
                                      e as any;
                                    setForms((prev) => ({
                                      ...prev,
                                      sub_entries: prev.sub_entries,
                                    }));
                                  }}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <FormField
                            name="ref_account"
                            render={() => (
                              <FormItem>
                                <FormLabel>Refrence</FormLabel>
                                <SearchSelect
                                  disabled={res.account_entry_id ? true : false}
                                  data={props.account_entry}
                                  hit="select refrence"
                                  label="Refrence"
                                  onChange={(e) => {
                                    forms.sub_entries[i].reference_id =
                                      e as any;
                                    setForms((prev) => ({
                                      ...prev,
                                      sub_entries: prev.sub_entries,
                                    }));
                                  }}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                        {i !== forms.sub_entries.length - 1 && (
                          <hr className="my-5 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
              {!props.isEditMode && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 10,
                  }}
                >
                  <Button
                    type="button"
                    className="bg-black"
                    color="dark"
                    onClick={() => {
                      setForms((prev) => ({
                        ...prev,

                        sub_entries: prev.sub_entries.concat({
                          type:
                            forms.sub_entries.length === 0
                              ? "Debit"
                              : forms.sub_entries.length === 1
                              ? "Credit"
                              : undefined,
                          entry_id: undefined,

                          amount: 1,
                          two_digit_id: undefined,
                          reference_id: undefined,
                          three_digit_id: undefined,
                          more_than_four_digit_id: undefined,
                          account_entry_id: undefined,
                        }),
                      }));
                    }}
                  >
                    <PlusSquare />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </Style>
  );
}

const Style = styled.div`
  margin: auto;
  max-width: 720px;
`;
//  <ActionIcon
// variant="filled"
// color="dark"
// size={"lg"}
// onClick={() => {
//   setForms(forms.filter((res, ii) => i !== ii));
// }}
// >
// <MdDelete size={25} />
// </ActionIcon>
