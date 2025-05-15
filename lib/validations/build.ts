import { z } from "zod";

// Tipos de build disponíveis
export const buildTypes = [
  "strength",
  "dexterity",
  "quality",
  "intelligence",
  "faith",
  "arcane",
  "hybrid",
  "bleed",
  "frost",
  "poison",
  "lightning",
  "fire",
  "holy",
  "other"
] as const;

// Validation schema for creating/updating a build
export const buildFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must be less than 100 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(1000, { message: "Description must be less than 1000 characters" }),
  level: z
    .number()
    .int()
    .min(1, { message: "Level must be at least 1" })
    .max(713, { message: "Level must be less than 713" }),
  buildType: z
    .enum(buildTypes)
    .optional()
    .nullable(),

  // Character stats
  vigor: z
    .number()
    .int()
    .min(1, { message: "Vigor must be at least 1" })
    .max(99, { message: "Vigor must be less than 99" }),
  mind: z
    .number()
    .int()
    .min(1, { message: "Mind must be at least 1" })
    .max(99, { message: "Mind must be less than 99" }),
  endurance: z
    .number()
    .int()
    .min(1, { message: "Endurance must be at least 1" })
    .max(99, { message: "Endurance must be less than 99" }),
  strength: z
    .number()
    .int()
    .min(1, { message: "Strength must be at least 1" })
    .max(99, { message: "Strength must be less than 99" }),
  dexterity: z
    .number()
    .int()
    .min(1, { message: "Dexterity must be at least 1" })
    .max(99, { message: "Dexterity must be less than 99" }),
  intelligence: z
    .number()
    .int()
    .min(1, { message: "Intelligence must be at least 1" })
    .max(99, { message: "Intelligence must be less than 99" }),
  faith: z
    .number()
    .int()
    .min(1, { message: "Faith must be at least 1" })
    .max(99, { message: "Faith must be less than 99" }),
  arcane: z
    .number()
    .int()
    .min(1, { message: "Arcane must be at least 1" })
    .max(99, { message: "Arcane must be less than 99" }),

  // Equipment
  weapons: z.array(z.string()).min(1, { message: "At least one weapon is required" }),
  armor: z.array(z.string()).min(0),
  talismans: z.array(z.string()).min(0),
  spells: z.array(z.string()).min(0),

  isPublished: z.boolean().default(true),
});

// Type for the build form
export type BuildFormValues = z.infer<typeof buildFormSchema>;

// Validation schema for comments
export const commentFormSchema = z.object({
  content: z
    .string()
    .min(3, { message: "Comment must be at least 3 characters" })
    .max(500, { message: "Comment must be less than 500 characters" }),
  buildId: z.string(),
});

// Type for the comment form
export type CommentFormValues = z.infer<typeof commentFormSchema>;
