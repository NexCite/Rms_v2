"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, Prisma } from "@prisma/client";

import { usePathname, useRouter } from "next/navigation";

import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import NexCiteButton from "@rms/components/button/nexcite-button";
import { useToast } from "@rms/hooks/toast-hook";
import { createRole, updateRole } from "@rms/service/role-service";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import {
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  MenuItem,
  Option,
  Select,
  Typography,
} from "@mui/joy";

type Props = { value?: Prisma.RoleGetPayload<{}> };
export default function RoleForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { replace } = useRouter();
  const formSchema = useMemo(() => {
    return z.object({
      name: z.string(),

      permissions: z
        .array(z.enum(Object.keys($Enums.UserPermission) as any))
        .min(1)
        .default([]),
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: props.value ?? {
      name: "",
      permissions: [],
    },
  });
  const toast = useToast();
  const pathName = usePathname();

  const handleSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      setTransition(async () => {
        if (props.value) {
          setTransition(async () => {
            const result = await updateRole(props.value.id, values);
            toast.OpenAlert(result);

            Object.keys(result.errors ?? []).map((e) => {
              form.setError(e as any, result[e]);
            });
          });
        } else {
          setTransition(async () => {
            const result = await createRole(values as any);
            toast.OpenAlert(result);
            if (result.status === 200)
              replace(pathName + "?id=" + result.result.id);
            Object.keys(result.errors ?? []).map((e) => {
              form.setError(e as any, result[e]);
            });
          });
        }
      });
    },
    [replace, pathName, props.value, form, toast]
  );
  return (
    <>
      <form
        className="max-w-[500px] m-auto"
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
      >
        <Card>
          <Typography>Role Form</Typography>
          <CardContent className="flex flex-col gap-5">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <FormControl error={Boolean(fieldState.error)}>
                    <FormLabel required>Name</FormLabel>
                    <Input
                      {...field}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    <FormHelperText>{fieldState.error?.message}</FormHelperText>
                  </FormControl>
                );
              }}
            />
            <Controller
              name={"permissions"}
              control={form.control}
              render={({ field, fieldState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel required>Permissions</FormLabel>
                  <div className="flex flex-col gap-5">
                    {permissions.map((perant, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 items-center justify-between">
                          <Typography>{perant.name}</Typography>{" "}
                          <Checkbox
                            name={perant.value}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...field.value, perant.value]);
                              } else {
                                field.value.splice(
                                  field.value.indexOf(perant.value),
                                  1
                                ),
                                  field.onChange(field.value);
                              }
                            }}
                            checked={
                              field.value?.find((ress) => ress === perant.value)
                                ? true
                                : false
                            }
                          />
                        </div>
                        <Divider />
                        <div className="flex gap-5 justify-between ">
                          {perant.childrens.map((res, i) => (
                            <div key={i} className="flex flex-col gap-2">
                              <div className="flex gap-5">
                                <Typography>{res.name}</Typography>
                              </div>
                              {res.childrens.map((res, i) => (
                                <div key={i} className="flex gap-2">
                                  <Checkbox
                                    disabled={
                                      !field.value.includes(perant.value)
                                    }
                                    name={res.value}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        field.onChange([
                                          ...field.value,
                                          res.value,
                                        ]);
                                      } else {
                                        field.value.splice(
                                          field.value.indexOf(res.value),
                                          1
                                        ),
                                          field.onChange(field.value);
                                      }
                                    }}
                                    checked={
                                      field.value?.find(
                                        (ress) => ress === res.value
                                      )
                                        ? true
                                        : false
                                    }
                                  />{" "}
                                  <label htmlFor={res.value}>{res.name}</label>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </CardContent>
          <div className="flex justify-end5 m-5 mt-2">
            <NexCiteButton isPadding={isPadding} />
          </div>
        </Card>
      </form>
    </>
  );
}

const permissions: Permissions[] = [
  {
    name: "Accounting",
    value: "Accounting",
    childrens: [
      {
        name: "Chart Of Account",
        childrens: [
          {
            name: "View All",
            value: "View_Chart_Of_Accounts",
          },
          {
            name: "View By Id",
            value: "View_Chart_Of_Account",
          },
          {
            name: "Create",
            value: "Create_Chart_Of_Account",
          },
          {
            name: "Update",
            value: "Update_Chart_Of_Account",
          },
        ],
        value: "View_Chart_Of_Accounts",
      },
      {
        name: "Journal Voucher",
        childrens: [
          {
            name: "View All",
            value: "View_Vouchers",
          },
          {
            name: "View By Id",
            value: "View_Voucher",
          },
          {
            name: "Create",
            value: "Create_Voucher",
          },
          {
            name: "Update",
            value: "Update_Voucher",
          },
        ],
      },
      {
        name: "Activity",
        childrens: [
          {
            name: "View All",
            value: "View_Activities",
          },

          {
            name: "Update",
            value: "Update_Activity",
          },
        ],
      },
    ],
  },
  {
    name: "Setting",
    value: "Setting",
    childrens: [
      {
        name: "Currency",
        childrens: [
          {
            name: "View All",
            value: "View_Currencies",
          },
          {
            name: "View By Id",
            value: "View_Currency",
          },
          {
            name: "Create",
            value: "Create_Currency",
          },
          {
            name: "Update",
            value: "Update_Currency",
          },
        ],
      },
      {
        name: "User",
        childrens: [
          {
            name: "View All",
            value: "View_Users",
          },
          {
            name: "View By Id",
            value: "View_User",
          },
          {
            name: "Create",
            value: "Create_User",
          },
          {
            name: "Update",
            value: "Update_User",
          },
        ],
      },
      {
        name: "Role",
        childrens: [
          {
            name: "View All",
            value: "View_Roles",
          },
          {
            name: "View By Id",
            value: "View_Role",
          },
          {
            name: "Create",
            value: "Create_Role",
          },
          {
            name: "Update",
            value: "Update_Role",
          },
          {
            name: "Delete",
            value: "Delete_Role",
          },
        ],
      },
      {
        name: "Profile",
        childrens: [
          {
            name: "View",
            value: "View_Profile",
          },
        ],
      },
    ],
  },
];
type Permissions = {
  name?: string;
  childrens?: Permissions[];
  value?: $Enums.UserPermission;
};
// Remove the line below to fix the circular reference problem
// type Permissions = typeof Permissions
