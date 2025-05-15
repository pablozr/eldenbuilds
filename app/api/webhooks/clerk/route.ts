import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Define Zod schema for Clerk webhook data
const userDataSchema = z.object({
  id: z.string(),
  email_addresses: z.array(
    z.object({
      email_address: z.string().email(),
    })
  ).optional(),
  username: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  // Get the headers
  const headersList = headers();
  const svix_id = (await headersList).get("svix-id");
  const svix_timestamp = (await headersList).get("svix-timestamp");
  const svix_signature = (await headersList).get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers");
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Verify webhook secret is set
  if (!process.env.CLERK_WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // Get the body
  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    console.error("Error parsing request body:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Error verifying webhook" },
      { status: 400 }
    );
  }

  // Get the event type
  const eventType = evt.type;

  // Handle the event
  try {
    switch (eventType) {
      case "user.created": {
        // Validate user data
        const validationResult = userDataSchema.safeParse(evt.data);
        if (!validationResult.success) {
          console.error("Invalid user data:", validationResult.error);
          return NextResponse.json(
            { error: "Invalid user data" },
            { status: 400 }
          );
        }

        const { id, email_addresses, username, image_url, first_name, last_name } = validationResult.data;

        const primaryEmail = email_addresses?.[0]?.email_address;
        const name = [first_name, last_name].filter(Boolean).join(" ");

        if (!primaryEmail) {
          console.error("No email found for user:", id);
          return NextResponse.json(
            { error: "No email found" },
            { status: 400 }
          );
        }

        // Gera um nome de usuário a partir do email se não estiver definido
        const generatedUsername = primaryEmail.split("@")[0];

        const user = await prisma.user.create({
          data: {
            clerkId: id,
            email: primaryEmail,
            username: username || generatedUsername,
            name: name || null,
            imageUrl: image_url || null,
          },
        });

        console.log(`User created: ${id} (${primaryEmail})`);
        return NextResponse.json({ success: true, user: { id: user.id } });
      }

      case "user.updated": {
        // Validate user data
        const validationResult = userDataSchema.safeParse(evt.data);
        if (!validationResult.success) {
          console.error("Invalid user data:", validationResult.error);
          return NextResponse.json(
            { error: "Invalid user data" },
            { status: 400 }
          );
        }

        const { id, email_addresses, username, image_url, first_name, last_name } = validationResult.data;

        const primaryEmail = email_addresses?.[0]?.email_address;
        const name = [first_name, last_name].filter(Boolean).join(" ");

        if (!primaryEmail) {
          console.error("No email found for user:", id);
          return NextResponse.json(
            { error: "No email found" },
            { status: 400 }
          );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: id },
        });

        if (!existingUser) {
          console.error(`User not found for update: ${id}`);
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        // Gera um nome de usuário a partir do email se não estiver definido
        const generatedUsername = primaryEmail.split("@")[0];

        const user = await prisma.user.update({
          where: { clerkId: id },
          data: {
            email: primaryEmail,
            username: username || generatedUsername,
            name: name || null,
            imageUrl: image_url || null,
          },
        });

        console.log(`User updated: ${id} (${primaryEmail})`);
        return NextResponse.json({ success: true, user: { id: user.id } });
      }

      case "user.deleted": {
        const { id } = evt.data;

        if (!id || typeof id !== 'string') {
          console.error("Invalid user ID for deletion");
          return NextResponse.json(
            { error: "Invalid user ID" },
            { status: 400 }
          );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: id },
        });

        if (!existingUser) {
          console.log(`User already deleted or not found: ${id}`);
          return NextResponse.json({ success: true });
        }

        await prisma.user.delete({
          where: { clerkId: id },
        });

        console.log(`User deleted: ${id}`);
        return NextResponse.json({ success: true });
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
        return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error(`Error handling webhook (${eventType}):`, error);
    return NextResponse.json(
      { error: "Error handling webhook" },
      { status: 500 }
    );
  }
}
