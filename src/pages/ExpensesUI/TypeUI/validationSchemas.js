// TypeUI/validationSchemas.js
import * as z from "zod";

export const TypeFormSchema = z.object({
  range: z.string().nonempty("Please select a range"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});