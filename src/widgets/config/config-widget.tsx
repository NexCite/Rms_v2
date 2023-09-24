"use client";
import React, { useTransition } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@rms/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@rms/components/ui/form";
import { Input } from "@rms/components/ui/input";
import { useForm } from "react-hook-form";
import z from "zod";
import UploadWidget from "../upload/upload-widget";
import { createConfig } from "@rms/service/config-service";
import useAlertHook from "@rms/hooks/alert-hooks";
import LoadingButton from "@rms/components/ui/loading-button";
const formSchema = z.object({
  name: z.string().min(3),
  logo: z.string().min(3),
  first_name: z.string().min(3),
  last_name: z.string().min(3),
  phone_number: z
    .string()
    .regex(
      new RegExp(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/),
      {
        message: "Invalid phone number",
      }
    ),
  email: z.string().email(),
  username: z.string().min(4),
  password: z.string().min(4),
});
export default function ConfigWidget() {
  const [isPadding, setTransition] = useTransition();
  const { createAlert } = useAlertHook();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    setTransition(async () => {
      const req = await createConfig(values as any);

      createAlert({ ...req, replace: "/login" });
    });
  }

  return (
    <div className="flex justify-center items-center">
      <Card className="w-[350px] overflow-y-auto mt-3  max-h-[100vh] ">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>Setup for new project </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              autoComplete="off"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Name</FormLabel>
                    <FormControl>
                      <Input placeholder="app name" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
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
              <FormField
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
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="new-password"
                        type="password"
                        placeholder="password"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
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
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Image</FormLabel>
                    <FormControl>
                      <UploadWidget
                        onSave={(e) => {
                          form.setValue("logo", e ?? "");
                          form.clearErrors("logo");
                        }}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <LoadingButton
                  type="submit"
                  label="Create"
                  loading={isPadding}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
