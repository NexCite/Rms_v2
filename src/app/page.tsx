import { Button } from "@rms/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@rms/components/ui/card";
import { Input } from "@rms/components/ui/input";
import { Label } from "@rms/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rms/components/ui/select";
import prisma from "@rms/prisma/prisma";
import ConfigWidget from "@rms/widgets/config/config-widget";
import { redirect } from "next/navigation";

export default async function Index() {
  const config = await prisma.config.findFirst();

  if (config !== null) redirect("/login");

  return <ConfigWidget />;
}
