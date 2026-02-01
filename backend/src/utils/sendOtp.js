export async function sendOtp({ phoneNumber, code, channel }) {
  const destinations =
    channel === "both" ? "sms + whatsapp" : channel === "whatsapp" ? "whatsapp" : "sms";

  console.log(
    `[OTP] Send ${code} to ${phoneNumber} via ${destinations}. Replace this with SMS/WhatsApp provider.`
  );
}
