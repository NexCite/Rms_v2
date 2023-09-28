"use client";
import { $Enums, Prisma } from "@prisma/client";
import { createUser, updateUser } from "@rms/service/user-service";
import { zodResolver } from "@hookform/resolvers/zod";
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

import React, { useCallback, useMemo, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { z } from "zod";
import { Input } from "@rms/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@rms/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import Countries from "@rms/lib/country";
import LoadingButton from "@rms/components/ui/loading-button";
import { MultiSelect } from "@rms/components/ui/multi-select";

type Props = {
  user?: {
    username: string;
    id: number;
    first_name: string;
    last_name: string;
    permissions: $Enums.UserPermission[];
    type: $Enums.UserType;
  };
  value?: Prisma.UserGetPayload<{
    select: {
      username: true;
      id: true;
      first_name: true;
      last_name: true;
      email: true;
      country: true;
      address1: true;
      address2: true;
      gender: true;
      permissions: true;
      phone_number: true;
    };
  }>;
};

export default function UserFormComponent(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();
  const validation = useMemo(() => {
    return z.object({
      username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters" }),
      password: props.value ? z.string().min(4).optional() : z.string().min(4),
      first_name: z
        .string()
        .min(3, { message: "First Name must be at least 3 characters" }),
      last_name: z
        .string()
        .min(3, { message: "Last Name must be at least 3 characters" }),
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
      gender: z.enum([
        $Enums.Gender.Male,
        $Enums.Gender.Female,
        $Enums.Gender.Other,
      ]),
      address1: z.string().optional().nullable(),
      address2: z.string().optional().nullable(),
      country: z.string(),
      email: z.string().optional().nullable(),
      permissions: z.array(z.enum(Object.keys($Enums.UserPermission) as any)),
      status: z
        .enum([
          $Enums.Status.Enable,
          $Enums.Status.Disable,
          $Enums.Status.Deleted,
        ])
        .optional(),
    });
  }, [props.value]);
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

          await updateUser(props.value.id, value2).then((res) => {
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

          await createUser(value2).then((res) => {
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
    [back, createAlert, form, props.value]
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
                  <h1 className="font-medium text-2xl">User Form</h1>
                </div>
                <hr className="my-12 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
              </CardHeader>

              <CardContent>
                <div className="grid gap-4">
                  <div className="grid-cols-12">
                    <FormField
                      rules={{ required: true }}
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="required">
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
                      name="password"
                      render={({ field }) => (
                        <FormItem className="required">
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="password"
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
                        <FormItem className="required">
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
                        <FormItem className="required">
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
                        <FormItem className="required">
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
                        <FormItem className="required">
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
                      control={form.control}
                      disabled={props.user.type === "User"}
                      name="permissions"
                      render={(value) => {
                        return (
                          <FormItem className="required">
                            <FormLabel>Permissions</FormLabel>
                            <FormControl>
                              <MultiSelect
                                selected={value.field.value ?? []}
                                onChange={(e) => {
                                  form.setValue("permissions", e as string[]);
                                }}
                                options={Object.keys($Enums.UserPermission).map(
                                  (res) => ({
                                    label: res,
                                    value: res,
                                  })
                                )}
                              />
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className="grid-cols-12">
                    <FormField
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
