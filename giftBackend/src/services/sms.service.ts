import twilio from "twilio";
import { ENV } from "../config/env";
import { logger } from "../config/logger";

const client = twilio(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);

export const sendOTPViaSMS = async (phone: string, otp: string) => {
  if (!ENV.TWILIO_ACCOUNT_SID || !ENV.TWILIO_AUTH_TOKEN || !ENV.TWILIO_PHONE_NUMBER) {
    logger.error("Twilio is not configured properly");
    throw new Error("SMS service not configured");
  }

  const messageBody = `Your verification code is ${otp}. Do not share this with anyone.`;

  try {
    const msg = await client.messages.create({
      to: phone,
      from: ENV.TWILIO_PHONE_NUMBER,
      body: messageBody
    });

    logger.info("OTP SMS sent", msg.sid);
  } catch (error) {
    logger.error("Failed to send OTP SMS", error);
    throw error;
  }
};
