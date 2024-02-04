"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

import { Controller, useForm } from "react-hook-form";
import z from "zod";

import { createLogin } from "@nexcite/service/login-service";

import {
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Typography,
} from "@mui/joy";
import NexCiteButton from "@nexcite/components/button/NexCiteButton";
import { useToast } from "@nexcite/hooks/toast-hook";
import { useRouter } from "next/navigation";
const formSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
});
export default function ConfigWidget() {
  const [isPadding, setTransition] = useTransition();
  const { replace } = useRouter();
  const toast = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    setTransition(async () => {
      const req = await createLogin(values);

      toast.OpenAlert({ ...req });
      if (req.status == 200) {
        replace("/admin");
      }
    });
  }

  return (
    <div className="flex justify-center items-center m-7">
      <Card className="w-[350px]">
        <Typography fontSize={18}>Login</Typography>
        <Divider />
        <CardContent>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-1 flex flex-col gap-0"
          >
            <Controller
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel required>Username</FormLabel>
                  <Input
                    {...field}
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel required>Password</FormLabel>
                  <Input
                    type="password"
                    {...field}
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />

            <div className="">
              <NexCiteButton
                className="w-full"
                type="submit"
                isPadding={isPadding}
              >
                Login
              </NexCiteButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
