import "server-only";
import { EmailClient } from "@azure/communication-email";
// import {EmailClient} from "@azure/communication-email";

const emailClient = new EmailClient(
  process.env.AZURE_COMMUNICATION_CONNECTION_STRING!,
);

export async function sentOTPEmail(
  toEmail: string,
  otp: string,
): Promise<void> {
  console.log("sender email: ", process.env.AZURE_SENDER_EMAIL);
  console.log(
    "CONNECTION STRING: ",
    process.env.AZURE_COMMUNICATION_CONNECTION_STRING,
  );
  const msg = {
    senderAddress: process.env.AZURE_SENDER_EMAIL!,
    recipients: {
      to: [{ address: toEmail }],
    },
    content: {
      subject: "your login code",
      plainText: `your one-time login code is : ${otp} \n\nThis code expires after 10 minutes.`,
      html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
          <h2 style="font-size: 20px; color: #0c0c0e; margin-bottom: 8px;">Your login code</h2>
          <p style="color: #6b6b72; font-size: 14px; margin-bottom: 24px;">Use the code below to sign in to CV Match:</p>
          <div style="font-size: 36px; font-weight: 600; letter-spacing: 10px; color: #4a7c59; margin: 24px 0;">
            ${otp}
          </div>
          <p style="color: #9b9ba3; font-size: 13px; margin-top: 24px;">
            This code expires in 10 minutes. Do not share it with anyone.
          </p>
        </div>
            `,
    },
  };

  const poller = await emailClient.beginSend(msg);
  await poller.pollUntilDone();
}
