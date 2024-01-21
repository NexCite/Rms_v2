"use client";
import { zodResolver } from "@hookform/resolvers/zod";

import Autocomplete from "@mui/joy/Autocomplete";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Table from "@mui/joy/Table";
import TextArea from "@mui/joy/Textarea";
import Typography from "@mui/joy/Typography";

import Alert from "@mui/joy/Alert";
import NexCiteButton from "@rms/components/button/nexcite-button";

import NumericFormatCustom from "@rms/components/input/text-field-number";
import { useToast } from "@rms/hooks/toast-hook";
import { FormatNumber, FormatNumberWithFixed } from "@rms/lib/global";
import {
  createVoucherService,
  updateVoucherService,
} from "@rms/service/voucher-service";
import dayjs from "dayjs";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm, useFormState, useWatch } from "react-hook-form";
import { MdDelete } from "react-icons/md";
import {
  ChartOfAccountSchema,
  CurrencySchema,
  JournalVoucherInputSchema,
} from "../../schema/journal-voucher-schema";
import { Card, CardContent } from "@mui/joy";
type Props = {
  chartOfAccounts: ChartOfAccountSchema[];
  currencies: CurrencySchema[];
  voucher?: JournalVoucherInputSchema;
  id?: number;
};

export default function JournalVoucherForm(props: Props) {
  const form = useForm<JournalVoucherInputSchema>({
    resolver: zodResolver(JournalVoucherInputSchema),
    defaultValues: props.voucher ?? {
      voucher_items: [],
      to_date: new Date(),
    },
  });

  const watch = useWatch({ control: form.control });

  const chartOfAccountClients = useMemo(() => {
    return props.chartOfAccounts.filter((res) => res.account_type);
  }, [props.chartOfAccounts]);
  const chartOfAccounts = useMemo(() => {
    return props.chartOfAccounts.filter(
      (res) =>
        !watch.voucher_items
          .map((res) => res?.chart_of_account?.id)
          .includes(res.id)
    );
  }, [props.chartOfAccounts, watch.voucher_items]);
  console.log(props.voucher);

  const voucherState = useFormState({
    control: form.control,
    name: "voucher_items",
  });
  const toast = useToast();
  const pathName = usePathname();
  const { replace } = useRouter();

  const [isPadding, setTransition] = useTransition();
  const handleSubmit = useCallback(
    (values: JournalVoucherInputSchema) => {
      setTransition(() => {
        values.voucher_items = values.voucher_items.map((res) => {
          if (res.reffrence_chart_of_account?.currency) {
            res.rate = res.reffrence_chart_of_account.currency.rate;
            res.currency = res.reffrence_chart_of_account.currency;
          } else if (res.chart_of_account.currency) {
            res.rate = res.chart_of_account.currency.rate;
            res.currency = res.chart_of_account.currency;
          } else {
            res.rate = values.currency.rate;
            res.currency = values.currency;
          }

          return res;
        });

        let total = values.voucher_items.reduce(
          (a, b) =>
            b.debit_credit === "Debit"
              ? a + b.amount / b.rate
              : a - b.amount / b.rate,
          0
        );

        if (total !== 0) {
          form.setError("voucher_items", {
            message: `Debit and Credit must be equal 0 total is ${FormatNumberWithFixed(
              total,
              2
            )}$`,
            type: "validate",
          });
          return;
        }

        if (props.id) {
          updateVoucherService({ voucher: values, id: props.id }).then(
            (res) => {
              toast.OpenAlert(res);
              if (res.status === 200) {
                replace(pathName + "?id=" + props.id);
              }
            }
          );
        } else {
          createVoucherService({
            voucher: values,
          }).then((res) => {
            toast.OpenAlert(res);
            if (res.status === 200) {
              replace(pathName + "?id=" + res.result.id);
            }
          });
        }
      });
    },
    [props.id, form, toast, replace, pathName]
  );

  return (
    <Card className="border  max-w-[1500px] m-auto p-5 border-md">
      <CardContent>
        <form
          className="gap-5 flex flex-col "
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          {Boolean(voucherState.errors?.voucher_items) && (
            <Alert color="danger" component={"div"}>
              {voucherState.errors?.voucher_items.message ??
                voucherState.errors?.voucher_items.root?.message}
            </Alert>
          )}
          <div className="flex justify-between items-center">
            <Typography fontSize={25}>Journal Voucher Form</Typography>

            <NexCiteButton
              label="Save"
              isPadding={isPadding}
              type="submit"
            ></NexCiteButton>
          </div>
          <div className="flex flex-col gap-5  w-full m-auto ">
            <div className="grid grid-cols-1  gap-5    ">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState, formState }) => (
                  <FormControl error={Boolean(fieldState.error)} required>
                    <FormLabel>Title</FormLabel>
                    <Input
                      fullWidth
                      size="lg"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder={field.name.replaceAll("_", " ")}
                    />
                  </FormControl>
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState, formState }) => (
                  <FormControl error={Boolean(fieldState.error)} required>
                    <FormLabel>Description</FormLabel>
                    <TextArea
                      minRows={3}
                      maxRows={5}
                      size="lg"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder={field.name.replaceAll("_", " ")}
                    />
                  </FormControl>
                )}
              />
              <Controller
                name="note"
                control={form.control}
                render={({ field, fieldState, formState }) => (
                  <FormControl>
                    <FormLabel>Note</FormLabel>
                    <TextArea
                      minRows={3}
                      maxRows={5}
                      size="lg"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder={field.name.replaceAll("_", " ")}
                    />
                  </FormControl>
                )}
              />
              <Controller
                name="to_date"
                control={form.control}
                render={({ field, fieldState, formState }) => (
                  <FormControl error={Boolean(fieldState.error)} required>
                    <FormLabel>Date</FormLabel>
                    <Input
                      fullWidth
                      type="date"
                      size="lg"
                      value={dayjs(field.value).format("YYYY-MM-DD")}
                      onChange={(e) => {
                        field.onChange(e.target.valueAsDate);
                      }}
                      placeholder={field.name.replaceAll("_", " ")}
                    />
                  </FormControl>
                )}
              />
              <Controller
                name="currency"
                control={form.control}
                render={({ field, fieldState, formState }) => (
                  <FormControl error={Boolean(fieldState.error)} required>
                    <FormLabel>Currency</FormLabel>

                    <Autocomplete
                      startDecorator={
                        watch.currency?.rate && (
                          <div>{FormatNumber(watch.currency?.rate, 2)}</div>
                        )
                      }
                      onChange={(e, v) => {
                        field.onChange(v);
                      }}
                      value={field.value ?? null}
                      getOptionKey={(e) => {
                        if (typeof e === "object") {
                          return e.name;
                        }
                      }}
                      isOptionEqualToValue={(e) => e.id === field.value?.id}
                      getOptionLabel={(e: any) => `${e.name}`}
                      multiple={false}
                      options={props.currencies}
                    ></Autocomplete>
                  </FormControl>
                )}
              />
            </div>
            <div className="w-full">
              {/* <MaterialReactTable table={table} /> */}
              <div className="flex justify-between items-center p-1">
                <Button
                  disabled={!watch.currency}
                  className="nexcite-btn m-2"
                  onClick={() => {
                    form.setValue("voucher_items", [
                      ...watch.voucher_items,
                      {
                        amount: 0,
                        debit_credit: null,
                        chart_of_account: null,
                        reffrence_chart_of_account: null,
                      },
                    ]);
                  }}
                >
                  Add New Voucher Item
                </Button>
                {watch.currency?.rate && (
                  <div>
                    <Typography className="text-end">
                      Rate: {watch.currency?.symbol}
                      {FormatNumber(watch.currency?.rate, 2)}
                    </Typography>
                  </div>
                )}
              </div>
              <Table className="border">
                <thead>
                  <tr>
                    <th></th>
                    <th>Amount</th>
                    <th>D/C</th>
                    <th>Account</th>
                    <th>Reffencer Account</th>
                  </tr>
                </thead>
                <tbody>
                  {watch.voucher_items.map((value, index) => (
                    <tr key={index}>
                      <td>
                        <IconButton
                          color="danger"
                          onClick={() => {
                            form.setValue(
                              "voucher_items",
                              watch.voucher_items.filter(
                                (res, i) => i !== index
                              )
                            );
                          }}
                        >
                          <MdDelete />
                        </IconButton>
                        Rate:{" "}
                        {value.reffrence_chart_of_account?.currency?.symbol ??
                          value.chart_of_account?.currency?.symbol ??
                          watch.currency?.symbol}
                        {FormatNumberWithFixed(
                          value.reffrence_chart_of_account?.currency?.rate ??
                            value.chart_of_account?.currency?.rate ??
                            watch.currency?.rate,
                          2
                        )}
                      </td>
                      <td>
                        <Controller
                          control={form.control}
                          name={`voucher_items.${index}.amount`}
                          render={({ fieldState, field }) => (
                            <FormControl error={Boolean(fieldState.error)}>
                              <Input
                                startDecorator={
                                  value.reffrence_chart_of_account?.currency
                                    ?.symbol ??
                                  value.chart_of_account?.currency?.symbol ??
                                  watch.currency?.symbol
                                }
                                value={value.amount}
                                onChange={({ target: { value } }) => {
                                  if (Number.isNaN(value)) {
                                    field.onChange(0);
                                  } else {
                                    field.onChange(parseFloat(value));
                                  }
                                }}
                                placeholder="amount"
                                slotProps={{
                                  input: {
                                    component: NumericFormatCustom,
                                  },
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      </td>
                      <td>
                        <Controller
                          control={form.control}
                          name={`voucher_items.${index}.debit_credit`}
                          render={({ fieldState, field }) => (
                            <FormControl error={Boolean(fieldState.error)}>
                              <Select
                                value={field.value ?? ""}
                                onChange={(e, v) => {
                                  field.onChange(v);
                                }}
                                placeholder="Choose d/c"
                              >
                                {["Debit", "Credit"].map((res) => (
                                  <Option key={res} value={res}>
                                    {res.replaceAll("_", "/")}
                                  </Option>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />
                      </td>
                      <td>
                        <Controller
                          control={form.control}
                          name={`voucher_items.${index}.chart_of_account`}
                          render={({ fieldState, field }) => {
                            return (
                              <Autocomplete
                                startDecorator={
                                  value.chart_of_account?.currency?.symbol ?? ""
                                }
                                options={chartOfAccounts}
                                multiple={false}
                                getOptionLabel={(e) => {
                                  if (typeof e === "object") {
                                    return `${e.id} ${e.name}`;
                                  }
                                }}
                                isOptionEqualToValue={(e) =>
                                  e?.id === value?.chart_of_account?.id
                                }
                                value={field.value}
                                getOptionKey={(e) => {
                                  if (typeof e === "object") {
                                    return parseInt(e.id);
                                  }
                                }}
                                onChange={(e, v) => {
                                  field.onChange(v);
                                }}
                                placeholder="account"
                                error={Boolean(fieldState.error)}
                              />
                            );
                          }}
                        />
                      </td>
                      <td>
                        <Controller
                          control={form.control}
                          name={`voucher_items.${index}.reffrence_chart_of_account`}
                          render={({ fieldState, field }) => {
                            return (
                              <Autocomplete
                                startDecorator={
                                  value.reffrence_chart_of_account?.currency
                                    ?.symbol ?? ""
                                }
                                options={chartOfAccountClients}
                                multiple={false}
                                getOptionLabel={(e) => {
                                  if (typeof e === "object") {
                                    return `${e.id} ${e.name}`;
                                  }
                                }}
                                isOptionEqualToValue={(e) =>
                                  e?.id ===
                                  value?.reffrence_chart_of_account?.id
                                }
                                value={value.reffrence_chart_of_account}
                                getOptionKey={(e) => {
                                  if (typeof e === "object") {
                                    return parseInt(e.id);
                                  }
                                }}
                                onChange={(e, v) => {
                                  field.onChange(v);
                                }}
                                placeholder="reffernce account"
                                error={Boolean(fieldState.error)}
                              />
                            );
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
