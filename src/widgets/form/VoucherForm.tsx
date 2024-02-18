"use client";
import { zodResolver } from "@hookform/resolvers/zod";

import DeleteIcon from "@mui/icons-material/DeleteRounded";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Table from "@mui/joy/Table";
import TextArea from "@mui/joy/Textarea";
import Typography from "@mui/joy/Typography";

import NexCiteButton from "@nexcite/components/button/NexCiteButton";

import { Alert, Autocomplete, Card, CardContent, Stack } from "@mui/joy";
import IChartOfAccount from "@nexcite/Interfaces/IChartOfAccount";
import NumericFormatCustom from "@nexcite/components/input/TextFieldNumber";
import { useToast } from "@nexcite/hooks/toast-hook";
import { FormatNumber, FormatNumberWithFixed } from "@nexcite/lib/global";

import {
  VocuherItemSchema,
  VoucherInputSchema,
  VoucherItemInputSchema,
} from "@nexcite/schema/VoucherSchema";
import { createVoucher, updateVoucher } from "@nexcite/service/VoucherService";
import dayjs from "dayjs";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm, useFormState, useWatch } from "react-hook-form";
import { CurrencySchema } from "../../schema/JournalVoucherSchema";
type Props = {
  chartOfAccounts: IChartOfAccount[];
  currencies: CurrencySchema[];
  voucher?: VoucherInputSchema;
  voucherItems?: VoucherItemInputSchema;
  id?: number;
};

export default function VoucherForm(props: Props) {
  const form = useForm<VoucherInputSchema>({
    resolver: zodResolver(VoucherInputSchema),
    defaultValues: props.voucher ?? {
      to_date: new Date(),
    },
  });
  const voucherItemsForm = useForm<VocuherItemSchema>({
    resolver: zodResolver(VocuherItemSchema),
    defaultValues: {
      items: props.voucherItems,
    },
  });
  const formWatch = useWatch({ control: form.control });

  const watch = useWatch({ control: voucherItemsForm.control });
  const currency = useMemo(
    () => props.currencies.find((res) => res.id === formWatch.currency_id),
    [formWatch.currency_id, props.currencies]
  );

  const toast = useToast();
  const pathName = usePathname();
  const { replace } = useRouter();
  const selectedChartOfAccount = useMemo<IChartOfAccount[]>(() => {
    return watch.items.map((res) =>
      props.chartOfAccounts.find((ress) => res.chart_of_account_id === ress.id)
    );
  }, [watch.items, props.chartOfAccounts]);

  const [isPadding, setTransition] = useTransition();
  const handleSubmit = useCallback(
    (values: VoucherInputSchema) => {
      const groupedBy = {};
      voucherItemsForm.getValues().items.forEach((item) => {
        const key = item.groupBy.toString();
        groupedBy[key] = (groupedBy[key] || 0) + 1;
      });
      const groups = [];
      Object.keys(groupedBy).map((key) => {
        if (groupedBy[key] === 1) {
          groups.push(key);
        }
      }).length === 1;
      if (groups.length > 0) {
        voucherItemsForm.setError("items", {
          message: `Group By must be the same (${groups.join(",")})`,
          type: "validate",
        });
        return;
      }
      voucherItemsForm.handleSubmit((voucherItems) => {
        setTransition(() => {
          voucherItems.items = voucherItemsForm
            .getValues()
            .items.map((res, index) => {
              if (selectedChartOfAccount[index].currency) {
                res.rate = selectedChartOfAccount[index].currency.rate;
                res.currency_id = selectedChartOfAccount[index].currency.id;
              } else {
                res.rate = currency.rate;
                res.currency_id = currency?.id;
              }
              return res;
            });
          let totalDebit = voucherItems.items.reduce(
            (a, b) =>
              b.debit_credit === "Debit" ? a + b.amount / (b?.rate ?? 1) : a,
            0
          );
          let totalCredit = voucherItems.items.reduce(
            (a, b) =>
              b.debit_credit === "Credit" ? a + b.amount / (b?.rate ?? 1) : a,
            0
          );
          if (totalDebit !== totalCredit) {
            voucherItemsForm.setError("items", {
              message: `Debit and Credit must be equal 0 total is ${FormatNumberWithFixed(
                totalDebit - totalCredit,
                2
              )}$`,
              type: "validate",
            });
            return;
          }
          const channel = new BroadcastChannel("voucher");
          if (props.id) {
            updateVoucher({
              voucher: values,
              id: props.id,
              voucherItems: voucherItems.items,
            }).then((res) => {
              toast.OpenAlert(res);
              if (res.status === 200) {
                replace(pathName + "?id=" + props.id);
                channel.postMessage("update");
                channel.close();
              }
            });
          } else {
            createVoucher({
              voucher: values,
              voucherItems: voucherItems.items,
            }).then((res) => {
              toast.OpenAlert(res);
              if (res.status === 200) {
                channel.postMessage("update");
                channel.close();
                replace(pathName + "?id=" + res.body.id);
              }
            });
          }
        });
      })(document.querySelector("form") as any);
    },
    [
      props.id,
      toast,
      replace,
      pathName,
      currency,
      selectedChartOfAccount,
      voucherItemsForm,
    ]
  );
  const voucherState = useFormState({
    control: voucherItemsForm.control,
  });
  return (
    <Card>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          {Boolean(voucherState.errors?.items?.message) && (
            <Alert color="danger" component={"div"}>
              {voucherState.errors?.items.message ??
                voucherState.errors?.items.root?.message}
            </Alert>
          )}
          <Stack direction={"column"} spacing={2}>
            <Stack
              alignContent={"center"}
              justifyContent={"space-between"}
              direction={"row"}
            >
              <Typography fontSize={25}>Voucher Form</Typography>

              <NexCiteButton
                label="Save"
                isPadding={isPadding}
                type="submit"
              ></NexCiteButton>
            </Stack>
            <Stack direction={"column"} spacing={2}>
              <>
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
                  name="currency_id"
                  control={form.control}
                  render={({ field, fieldState, formState }) => (
                    <FormControl error={Boolean(fieldState.error)} required>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        value={field.value}
                        onChange={(e, v) => {
                          field.onChange(v);
                        }}
                        placeholder="Choose currency"
                      >
                        {props.currencies.map((res) => (
                          <Option key={res.id} value={res.id}>
                            {res.name}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </>

              <Stack
                alignItems={"center"}
                direction={"row"}
                justifyContent={"space-between"}
              >
                {currency?.rate ? (
                  <div>
                    <Typography className="text-end">
                      Rate: $1 = {currency?.symbol}
                      {FormatNumber(currency?.rate, 2)}
                    </Typography>
                  </div>
                ) : (
                  <div></div>
                )}{" "}
                <NexCiteButton
                  sx={{
                    width: 150,
                  }}
                  disabled={!currency}
                  type="button"
                  onClick={() => {
                    watch.items.push({
                      amount: 0,
                      currency_id: form.getValues("currency_id"),
                      groupBy: 1,

                      rate: currency.rate ?? 1,
                    });
                    voucherItemsForm.setValue("items", watch.items);
                  }}
                >
                  Add Voucher Item
                </NexCiteButton>
              </Stack>

              <Table className="border">
                <thead>
                  <tr>
                    <th></th>
                    <th>Amount</th>
                    <th>D/C</th>
                    <th>Account</th>
                    <th>Group By</th>
                  </tr>
                </thead>
                <tbody>
                  {watch.items.map((value, index) => (
                    <tr key={index}>
                      <td>
                        <Stack alignItems={"end"} direction={"row"}>
                          <IconButton
                            size="sm"
                            color="danger"
                            onClick={() => {
                              voucherItemsForm.setValue(
                                "items",
                                watch.items.filter((res, i) => i !== index)
                              );
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                          <Typography level="body-lg">
                            Rate:{" "}
                            {selectedChartOfAccount[index]?.currency?.symbol ??
                              currency.symbol ??
                              ""}
                            {FormatNumberWithFixed(
                              selectedChartOfAccount[index]?.currency?.rate ??
                                currency.rate ??
                                1,
                              2
                            )}
                          </Typography>
                        </Stack>
                      </td>
                      <td>
                        <Controller
                          control={voucherItemsForm.control}
                          name={`items.${index}.amount`}
                          render={({ fieldState, field }) => (
                            <FormControl error={Boolean(fieldState.error)}>
                              <Input
                                startDecorator={
                                  <>
                                    $
                                    {FormatNumberWithFixed(
                                      field.value /
                                        (selectedChartOfAccount[index]?.currency
                                          ?.rate ??
                                          currency.rate ??
                                          1),
                                      2
                                    )}
                                  </>
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
                          control={voucherItemsForm.control}
                          name={`items.${index}.debit_credit`}
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
                          control={voucherItemsForm.control}
                          name={`items.${index}.chart_of_account_id`}
                          render={({ fieldState, field }) => {
                            return (
                              <Autocomplete
                                startDecorator={
                                  selectedChartOfAccount[index]?.currency
                                    ?.symbol ?? ""
                                }
                                options={props.chartOfAccounts}
                                multiple={false}
                                getOptionLabel={(e) => {
                                  if (typeof e === "object") {
                                    return `${e.id} ${e.name}`;
                                  }
                                }}
                                isOptionEqualToValue={(e) =>
                                  e?.id === value?.chart_of_account_id
                                }
                                value={selectedChartOfAccount[index] ?? null}
                                getOptionKey={(e) => {
                                  if (typeof e === "object") {
                                    return parseInt(e.id);
                                  }
                                }}
                                onChange={(e, v) => {
                                  if (v) {
                                    if (typeof v === "object") {
                                      field.onChange(v.id);
                                    }
                                  } else {
                                    field.onChange(null);
                                  }
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
                          control={voucherItemsForm.control}
                          name={`items.${index}.groupBy`}
                          render={({ fieldState, field }) => (
                            <FormControl error={Boolean(fieldState.error)}>
                              <Input
                                value={value.groupBy}
                                onChange={({ target: { value } }) => {
                                  if (Number.isNaN(value)) {
                                    field.onChange(0);
                                  } else {
                                    field.onChange(parseFloat(value));
                                  }
                                }}
                                placeholder="group by"
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
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Stack>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
