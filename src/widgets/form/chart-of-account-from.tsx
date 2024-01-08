"use client";
import { $Enums, Prisma } from "@prisma/client";
import Countries from "@rms/lib/country";

import { zodResolver } from "@hookform/resolvers/zod";
import Accordion from "@mui/joy/Accordion";
import AccordionDetails from "@mui/joy/AccordionDetails";
import AccordionGroup from "@mui/joy/AccordionGroup";
import AccordionSummary from "@mui/joy/AccordionSummary";
import Autocomplete from "@mui/joy/Autocomplete";
import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import FormLabel from "@mui/joy/FormLabel";

import NexCiteButton from "@rms/components/button/nexcite-button";
import NumericFormatCustom from "@rms/components/ui/text-field-number";
import { useToast } from "@rms/hooks/toast-hook";
import {
  createChartOfAccountService,
  updateChartOfAccountService,
} from "@rms/service/chart-of-account-service";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ChartOfAccountInputSchema } from "../schema/chart-of-account";
import Typography from "@mui/joy/Typography";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
type Props = {
  canEdit?: boolean;
  currencies: Prisma.CurrencyGetPayload<{}>[];
  parents: Prisma.ChartOfAccountGetPayload<{}>[];
  chart_of_account?: Prisma.ChartOfAccountGetPayload<{}>;
};

// .refine(
//   (values) => {
//     values.id = values.id.toString();

//     if (values.id.length <= 2) {
//       return true;
//     }
//     if (!values.parent_id) {
//       return false;
//     } else {
//       return true;
//     }
//   },
//   { message: "parent requied", path: ["parent_id"] }
// )
// .refine(
//   (values) => {
//     values.id = values.id.toString();

//     if (values.id.length <= 2) {
//       return true;
//     }
//     if (!values.id?.startsWith(values.parent_id)) {
//       return false;
//     } else {
//       return true;
//     }
//   },
//   (values) => ({
//     message: `id must be start with  ${values.parent_id}`,
//     path: ["id"],
//   })
// )
// .refine(
//   (values) => {
//     values.id = values.id.toString();

//     if (values.id.length <= 2) {
//       return true;
//     }
//     if (values.id <= values.parent_id) {
//       return false;
//     } else {
//       return true;
//     }
//   },
//   (values) => ({
//     path: ["id"],
//     message: `id must be grater then parent ${values.parent_id}`,
//   })
// );

export default function ChartOfAccountForm(props: Props) {
  const form = useForm<ChartOfAccountInputSchema>({
    resolver: zodResolver(ChartOfAccountInputSchema),
    defaultValues: props.chart_of_account ?? {
      id: null,
      debit_credit: null,
      chart_of_account_type: null,
      account_type: null,
      address: null,
      business_id: null,
      country: null,
      currency_id: null,
      email: null,
      first_name: null,
      last_name: null,
      limit_amount: null,
      parent_id: null,
      name: null,
      phone_number: null,
    },
  });

  const [isPadding, setTransition] = useTransition();
  const toast = useToast();
  const pathName = usePathname();
  const watch = useWatch({
    control: form.control,
  });
  const { replace } = useRouter();
  useEffect(() => {
    if (watch.id?.length < 3 && watch.parent_id) {
      form.setValue("parent_id", null);
    }
  }, [watch.id, form.setValue, watch.parent_id, form]);
  const parentOptions = useMemo(
    () =>
      props.parents.map((res) => ({
        label: `${res.id} ${res.name}`,
        value: res.id,
      })),
    [props.parents]
  );
  const parentValue = useMemo(() => {
    const value = parentOptions.find((e) => watch.parent_id === e.value);

    return value ?? null;
  }, [watch.parent_id, parentOptions]);

  const onSubmit = useCallback(
    (values: ChartOfAccountInputSchema) => {
      if (!values.parent_id && values.id.length > 2) {
        return form.setError("parent_id", {
          message: "Required",
          types: { required: true },
          type: "required",
        });
      }
      if (values.id.length > 2 && !values.id.startsWith(values.parent_id)) {
        return form.setError("id", {
          message: "Id must be start from " + values.parent_id,
          types: { required: true },
          type: "required",
        });
      }
      if (values.id === values.parent_id) {
        return form.setError("id", {
          message: "Id must be not equal  parent id",
          types: { required: true },
          type: "required",
        });
      }
      setTransition(() => {
        if (props.chart_of_account) {
          setTransition(() => {
            updateChartOfAccountService({
              id: props.chart_of_account?.id,
              chartOfAccount: values as any,
            }).then((res) => {
              res?.error?.map((res) => {
                form.setError(res as any, { message: "already exists" });
              });

              toast.OpenAlert(res);
              replace(pathName + "?id=" + res.result.id);
            });
          });
        } else {
          createChartOfAccountService({ chartOfAccount: values as any }).then(
            (res) => {
              res?.error?.map((res) => {
                form.setError(res as any, { message: "already exists" });
              });

              toast.OpenAlert(res);
              if (res.status === 200) {
                replace(pathName + "?id=" + res.result.id);
              }
            }
          );
        }
      });
    },
    [form, props.chart_of_account, toast, replace, pathName]
  );

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      //   onClick={(e) => selectLevelFocus(false)}
    >
      <Tabs sx={{ width: "100%" }}>
        <TabList>
          <Tab>Accounting</Tab>
          <Tab>Account</Tab>
          <Tab>Address</Tab>
        </TabList>
        <TabPanel value={0}>
          <Controller
            name="id"
            control={form.control}
            render={({ field, fieldState, formState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel required>ID</FormLabel>
                <Input
                  placeholder="id"
                  value={field.value}
                  onChange={(event) => {
                    const inputValue = event.target.value.replace(/\D/g, "");

                    field.onChange(inputValue);
                  }}
                />
                <FormHelperText> {fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />
          {watch.id?.length > 2 && (
            <Controller
              name="parent_id"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel required>Parent</FormLabel>
                  <Autocomplete
                    disabled={!props.canEdit}
                    options={parentOptions}
                    multiple={false}
                    onChange={(e, newVale) => {
                      if (typeof newVale === "object") {
                        field.onChange(newVale?.value);
                      }
                    }}
                    handleHomeEndKeys
                    isOptionEqualToValue={(e) => e.value === parentValue.value}
                    value={parentValue}
                  ></Autocomplete>
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          )}
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState, formState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel required>Name</FormLabel>
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={field.name.replaceAll("_", " ")}
                />
                <FormHelperText>{fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="chart_of_account_type"
            control={form.control}
            render={({ field, fieldState, formState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel required>Chart Of Account Type</FormLabel>

                <Select
                  value={field.value}
                  onChange={(e, newValue) => {
                    field.onChange(newValue);
                  }}
                >
                  <Option value={null}>
                    <em>None</em>
                  </Option>
                  {Object.keys($Enums.ChartOfAccountType).map((res) => (
                    <Option key={res} value={res}>
                      {res.replaceAll("_", " ")}
                    </Option>
                  ))}
                </Select>
                <FormHelperText>{fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="debit_credit"
            control={form.control}
            render={({ field, fieldState, formState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel required>D/C</FormLabel>

                <Select
                  value={field.value}
                  onChange={(e, newValue) => {
                    field.onChange(newValue);
                  }}
                >
                  <Option value={null}>
                    <em>None</em>
                  </Option>
                  {Object.keys($Enums.DebitCreditType).map((res) => (
                    <Option key={res} value={res}>
                      {res.replaceAll("_", " ")}
                    </Option>
                  ))}
                </Select>
                <FormHelperText>{fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="currency_id"
            control={form.control}
            render={({ field, fieldState, formState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel>Currency</FormLabel>

                <Select
                  value={field.value}
                  onChange={(e, newValue) => {
                    field.onChange(newValue);
                  }}
                >
                  <Option value={null}>
                    <em>None</em>
                  </Option>
                  {props.currencies.map((res) => (
                    <Option key={res.id} value={res.id}>
                      {res.name} {res.symbol}
                    </Option>
                  ))}
                </Select>
                <FormHelperText>{fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </TabPanel>
        <TabPanel value={1}>
          <div className="flex gap-3 flex-col mt-5 ">
            <Controller
              name="first_name"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={"first name"}
                  />
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
            <Controller
              name="last_name"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={"last name"}
                  />
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={"email"}
                  />
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
            <Controller
              name="phone_number"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={"phone number"}
                  />
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="account_type"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel>Account Type</FormLabel>

                  <Select
                    value={field.value}
                    onChange={(e, newValue) => {
                      field.onChange(newValue);
                    }}
                  >
                    <Option value={null}>
                      <em>None</em>
                    </Option>
                    {Object.keys($Enums.AccountType).map((res) => (
                      <Option key={res} value={res}>
                        {res.replaceAll("_", " ")}
                      </Option>
                    ))}
                  </Select>
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
            <Controller
              name="business_id"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel>Business ID</FormLabel>
                  <Input
                    placeholder="business id"
                    value={field.value}
                    onChange={(event) => {
                      const inputValue = event.target.value.replace(/\D/g, "");

                      field.onChange(inputValue);
                    }}
                  />
                  <FormHelperText> {fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
            <Controller
              name="limit_amount"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel>Limit Amount</FormLabel>
                  <Input
                    placeholder="limit amount"
                    value={field.value}
                    slotProps={{
                      input: {
                        component: NumericFormatCustom,
                      },
                    }}
                    onChange={(event) => {
                      const inputValue = event.target.value.replace(/\D/g, "");

                      field.onChange(inputValue);
                    }}
                  />
                  <FormHelperText> {fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </div>
        </TabPanel>
        <TabPanel value={2}>
          <div className="flex gap-3 flex-col mt-5 ">
            <Controller
              name="country"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormControl>
                  <Controller
                    name="country"
                    control={form.control}
                    render={({ field, fieldState, formState }) => (
                      <FormControl error={Boolean(fieldState.error)}>
                        <FormLabel>Country</FormLabel>
                        <Autocomplete
                          isOptionEqualToValue={(e) => e === field.value}
                          placeholder="country"
                          options={Countries}
                          multiple={false}
                          onChange={(e, newVale) => {
                            field.onChange(newVale);
                          }}
                          value={field.value}
                        ></Autocomplete>
                        <FormHelperText>
                          {fieldState.error?.message}
                        </FormHelperText>
                      </FormControl>
                    )}
                  />
                </FormControl>
              )}
            />
            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel>Address</FormLabel>
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={"address"}
                  />
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </div>
        </TabPanel>

        <NexCiteButton type="submit" isPadding={isPadding}>
          Save
        </NexCiteButton>
      </Tabs>
    </form>
  );
}
