import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(140),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(200).optional(),
});

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };
    const gatewayKey = process.env["LOVABLE_API_KEY"];
    const connectionKey = process.env["RESEND_API_KEY"];
    if (!gatewayKey || !connectionKey)
      return {
        ok: false as const,
        error: "Email delivery is not available right now. Please use the email link instead.",
      };

    try {
      const response = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gatewayKey}`,
          "X-Connection-Api-Key": connectionKey,
        },
        body: JSON.stringify({
          from: "Pooja's Portfolio <onboarding@resend.dev>",
          to: ["poojabhagwat2525@gmail.com"],
          reply_to: data.email,
          subject: `Portfolio contact: ${data.subject}`,
          text: `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\n\n${data.message}`,
        }),
      });
      if (!response.ok) {
        const details = await response.text();
        console.error(`Contact email failed [${response.status}]: ${details}`);
        return {
          ok: false as const,
          error:
            "Your message could not be sent. Please email Pooja directly using the link below.",
        };
      }
      return { ok: true as const };
    } catch (error) {
      console.error("Contact email unavailable", error);
      return {
        ok: false as const,
        error: "Your message could not be sent. Please email Pooja directly using the link below.",
      };
    }
  });
