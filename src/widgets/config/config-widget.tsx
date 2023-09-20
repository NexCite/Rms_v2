"use client";
import React, { useTransition } from "react";

import { Button } from "@rms/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@rms/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { useForm } from "react-hook-form";
import z from "zod";
import { phoneRegex } from "@rms/lib/common";
import UploadWidget from "../upload/upload-widget";
import { createConfig } from "@rms/service/config-service";
import useAlertHook from "@rms/hooks/alert-hooks";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
const formSchema = z.object({
  name: z.string().min(3),
  logo: z.string().min(3),
  phone_number: z.string().regex(phoneRegex, "Invalid Phone Number"),
  email: z.string().email(),
  username: z.string().min(4),
  password: z.string().min(4),
});
export default function ConfigWidget() {
  const [isPadding, setTransition] = useTransition();
  const { createAlert } = useAlertHook();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      logo: "",
      email: "",
      name: "",
      phone_number: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    setTransition(async () => {
      const req = await createConfig(values as any);

      createAlert({ ...req, replace: "/login" });
    });
  }

  return (
    <div className="flex justify-center items-center m-7">
      <Card className="w-[350px]">
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
                <Button disabled={isPadding} type="submit">
                  {isPadding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      loading...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
