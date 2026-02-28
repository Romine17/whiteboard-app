import { z } from "zod";

export const intakeSchema = z.object({
  taxpayerFullName: z.string().min(2),
  taxpayerDob: z.string().min(8),
  taxpayerSsn: z.string().min(9),
  taxpayerCellPhone: z.string().min(10),
  taxpayerEmail: z.string().email(),
  currentStreetAddress: z.string().min(3),
  currentCity: z.string().min(2),
  currentState: z.string().min(2),
  currentZip: z.string().min(5),
  spouseName: z.string().optional(),
  spouseDob: z.string().optional(),
  spouseSsn: z.string().optional(),
  directDepositRefund: z.boolean(),
  bankAccountType: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankRoutingNumber: z.string().optional(),
  referredBy: z.string().optional(),
});

export type IntakePayload = z.infer<typeof intakeSchema>;
