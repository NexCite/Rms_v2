import { fileZod } from "@nexcite/lib/common";
import { z } from "zod";

const ConfigInputSchema = z.object({
  config: z.object({
    name: z.string().min(3),
    first_name: z.string().min(3),
    last_name: z.string().min(3),
    logo: z.string().optional().nullable(),
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
  }),

  file: fileZod,
});
const ConfigInputUpdateSchema = z.object({
  config: z.object({
    name: z.string().min(3),
    logo: z.string().optional().nullable(),
    phone_number: z
      .string()
      .regex(
        new RegExp(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/),
        {
          message: "Invalid phone number",
        }
      ),
    email: z.string().email(),
  }),

  file: fileZod.optional().nullable(),
});

type ConfigInputSchema = z.infer<typeof ConfigInputSchema>;
type ConfigInputUpdateSchema = z.infer<typeof ConfigInputUpdateSchema>;

export { ConfigInputSchema, ConfigInputUpdateSchema };
