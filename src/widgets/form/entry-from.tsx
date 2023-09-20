"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, EntryType, Prisma, Status } from "@prisma/client";
import { Alert } from "@rms/components/ui/alert";
import { Button } from "@rms/components/ui/button";
import DatePicker from "@rms/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@rms/components/ui/form";
import { Input } from "@rms/components/ui/input";
import { Label } from "@rms/components/ui/label";
import SearchSelect from "@rms/components/ui/search-select";
import SelectMenu from "@rms/components/ui/select-menu";
import useAlertHook from "@rms/hooks/alert-hooks";
import { createEntry, updateEntry } from "@rms/service/entry-service";
import { DeleteIcon, Loader2, PlusSquare, Text } from "lucide-react";

import moment from "moment";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { z } from "zod";

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
  const searchParams = useSearchParams();
  const { back } = useRouter();
  const [forms, setForms] = useState<Type>({
    title: undefined,
    description: undefined,
    note: undefined,
    currency_id: undefined,
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
        currency: z.object({
          connect: z.object({ id: z.number() }),
        }),
        sub_entries: z.object({
          createMany: z.object({
            data: z
              .array(
                z.object({
                  type: z.enum([
                    $Enums.EntryType.Debit,
                    $Enums.EntryType.Credit,
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
    (e: z.infer<typeof formSchema>) => {
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
            error.push({ index: i, message: "Missing  client or level" });
          }
          if (!res.type) {
            error.push({ index: i, message: "Missing  type" });
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
        return Object.keys(result.error.formErrors.fieldErrors).map((res) =>
          form.setError(res as any, result.error.formErrors.fieldErrors[res])
        );
      } else if (error.length > 0) {
        return;
      } else {
        form.clearErrors();
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
            if (result.status === 200) {
              back();
            }
          }
        });
      }
    },
    [props]
  );
  return (
    <Style className="max-h-full">
      {" "}
      <Form {...form}>
        <form
          className="card"
          autoComplete="off"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="flex justify-between items-center">
            <h1>Entry Form</h1>

            <Button
              className="bg-black"
              type="submit"
              disabled={isPadding}
              color="dark"
            >
              {isPadding ? (
                <>
                  <Loader2 /> loading...
                </>
              ) : (
                <>{props.isEditMode ? "Update" : "Add"}</>
              )}
            </Button>
          </div>
          {errors.length > 0 && (
            <Alert color="red" className="mb-10">
              {errors.map((res) => (
                <h4 key={res.index}>
                  {res.message} index{" "}
                  {res.index && <span>{res.index + 1}</span>}
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
                      <FormControl>
                        <Input placeholder="title" {...field} />
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
                      <FormControl>
                        <Input placeholder="description" {...field} />
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
                      <FormControl>
                        <Input placeholder="note" {...field} />
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
                          {...field}
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
                    rules={{ required: true }}
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note (Admin)</FormLabel>
                        <FormControl>
                          <DatePicker
                            default={forms?.to_date}
                            onChange={(e) => {
                              setForms((prev) => ({ ...prev, to_date: e }));
                            }}
                            maxDate={moment().endOf("day").toDate()}
                            minDate={moment().subtract(29, "day").toDate()}
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
                  {/* <UploadMediaWidget
                  onUpload={(e) => {
                    setMedia(e);
                  }}
                /> */}
                </div>
              )}
            </div>
            {!props.isEditMode && (
              <>
                {" "}
                <div style={{ margin: "20px 0px 8px" }}>
                  <Text size={30}>Entries</Text>
                  <div className="divide-x-2"></div>
                </div>
                {forms?.sub_entries?.map((res, i) => (
                  <div className="grid">
                    <div className="grid-cols-12">
                      <Button variant="ghost">
                        <DeleteIcon
                          color="black"
                          onClick={() => {
                            setErrors([]);

                            setForms((prev) => ({
                              ...prev,
                              sub_entries: prev.sub_entries.filter(
                                (res, ii) => i !== ii
                              ),
                            }));
                          }}
                        />
                      </Button>
                    </div>

                    <div className="grid-cols-12">
                      <Label htmlFor={`amount-${i}`}>Amount</Label>
                      <Input
                        id={`amount-${i}`}
                        type="number"
                        onChange={(e) => {
                          if (Number.isNaN(e)) {
                            forms.sub_entries[i].amount = 1;
                          } else {
                            forms.sub_entries[i].amount = +e;
                          }

                          setForms((prev) => ({
                            ...prev,
                            sub_entries: prev.sub_entries,
                          }));
                        }}
                        placeholder="amount"
                        step=".01"
                      />
                    </div>
                    <div className="grid-cols-12">
                      <SelectMenu
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
                    </div>
                    {/* <div className="grid-cols-12" span={{ base: 12, md: 4 }}>
                    <Select
                      searchable
                      rightSection={<IconChevronDown size="1rem" />}
                      rightSectionWidth={30}
                      placeholder="select Two Digit"
                      variant="filled"
                      label="Two Digit"
                      value={res.two_digit_id + ""}
                      size="md"
                      onChange={(e) => {
                        if (Number.isNaN(e) || e === "0" || e === "") {
                          forms.sub_entries[i].two_digit_id = undefined;
                        } else {
                          forms.sub_entries[i].two_digit_id = +e;
                        }

                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries,
                        }));
                      }}
                      data={
                        props.two_digit?.map((res) => ({
                          value: res.id + "",

                          label: `(${res.id}) ${res.name}`,
                        })) ?? []
                      }
                      disabled={
                        res.three_digit_id
                          ? true
                          : res.more_than_four_digit_id
                          ? true
                          : res.account_entry_id
                          ? true
                          : false
                      }
                    />
                  </div>

                  <div className="grid-cols-12" span={{ base: 12, md: 4 }}>
                    <Select
                      searchable
                      rightSection={<IconChevronDown size="1rem" />}
                      rightSectionWidth={30}
                      placeholder="select Three Digit"
                      variant="filled"
                      label="Three Digit"
                      value={res.three_digit_id + ""}
                      disabled={
                        res.two_digit_id
                          ? true
                          : res.more_than_four_digit_id
                          ? true
                          : res.account_entry_id
                          ? true
                          : false
                      }
                      size="md"
                      onChange={(e) => {
                        if (Number.isNaN(e) || e === "0" || e === "") {
                          forms.sub_entries[i].three_digit_id = undefined;
                        } else {
                          forms.sub_entries[i].three_digit_id = +e;
                        }

                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries,
                        }));
                      }}
                      data={
                        props.three_digit?.map((res) => ({
                          value: res.id + "",
                          label: `(${res.id}) ${res.name}`,
                        })) ?? []
                      }
                    />
                  </div>
                  <div className="grid-cols-12" span={{ base: 12, md: 4 }}>
                    <Select
                      searchable
                      disabled={
                        res.two_digit_id
                          ? true
                          : res.three_digit_id
                          ? true
                          : res.account_entry_id
                          ? true
                          : false
                      }
                      rightSection={<IconChevronDown size="1rem" />}
                      rightSectionWidth={30}
                      placeholder="selecct four and more digit"
                      variant="filled"
                      label="Four And More Digit"
                      value={res.more_than_four_digit_id + ""}
                      size="md"
                      onChange={(e) => {
                        if (Number.isNaN(e) || e === "0" || e === "") {
                          forms.sub_entries[i].more_than_four_digit_id =
                            undefined;
                        } else {
                          forms.sub_entries[i].more_than_four_digit_id = +e;
                        }

                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries,
                        }));
                      }}
                      data={
                        props.more_than_four_digit?.map((res) => ({
                          value: res.id + "",
                          group: `${res.three_digit.name} (${res.three_digit.id})`,
                          label: `(${res.id}) ${res.name}`,
                        })) ?? []
                      }
                    />
                  </div>
                  <div className="grid-cols-12" span={{ base: 12, md: 4 }}>
                    <Select
                      searchable
                      disabled={
                        res.two_digit_id
                          ? true
                          : res.three_digit_id
                          ? true
                          : res.more_than_four_digit_id
                          ? true
                          : res.reference_id
                          ? true
                          : false
                      }
                      onChange={(e) => {
                        if (Number.isNaN(e) || e === "0" || e === "") {
                          forms.sub_entries[i].account_entry_id = undefined;
                        } else {
                          forms.sub_entries[i].account_entry_id = +e;
                        }

                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries,
                        }));
                      }}
                      rightSection={<IconChevronDown size="1rem" />}
                      rightSectionWidth={30}
                      placeholder="select account"
                      variant="filled"
                      label="Account"
                      data={
                        props.account_entry?.map((res) => ({
                          value: res.id + "",
                          label: `(${res.id}) ${res.username}`,
                        })) ?? []
                      }
                    />
                  </div>
                  <div className="grid-cols-12" span={{ base: 12, md: 4 }}>
                    <Select
                      searchable
                      disabled={res.account_entry_id ? true : false}
                      onChange={(e) => {
                        if (Number.isNaN(e) || e === "0" || e === "") {
                          forms.sub_entries[i].reference_id = undefined;
                        } else {
                          forms.sub_entries[i].reference_id = +e;
                        }

                        setForms((prev) => ({
                          ...prev,
                          sub_entries: prev.sub_entries,
                        }));
                      }}
                      rightSection={<IconChevronDown size="1rem" />}
                      rightSectionWidth={30}
                      placeholder="select reference account"
                      variant="filled"
                      label="Reference Account"
                      data={
                        props.account_entry?.map((res) => ({
                          value: res.id + "",
                          label: `(${res.id}) ${res.username}`,
                        })) ?? []
                      }
                    />
                  </div> */}
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
