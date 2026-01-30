import admin from "../../backend/firebaseAdmin.js";
import PushToken from "../models/pushToken.model.js";
import mongoose from "mongoose";

export async function sendPushToUser({
  userId,
  title,
  body,
  link,
  data = {},
}) {
  try {
    const normalizedUserId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const records = await PushToken.find({ userId: normalizedUserId });
    if (!records.length) return { ok: false, reason: "NO_TOKENS" };

    const tokens = records.map((r) => r.token);

    // FCM requires STRING values
    const payloadData = { ...data, link: link || "/" };
    Object.keys(payloadData).forEach(
      (k) => (payloadData[k] = String(payloadData[k]))
    );

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: payloadData,
    });

    // 🔥 Auto cleanup invalid tokens
    const invalidTokens = [];
    response.responses.forEach((res, i) => {
      if (!res.success) {
        const code = res.error?.code;
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-argument"
        ) {
          invalidTokens.push(tokens[i]);
        }
      }
    });

    if (invalidTokens.length) {
      await PushToken.deleteMany({ token: { $in: invalidTokens } });
    }

    return {
      ok: true,
      sent: response.successCount,
      removed: invalidTokens.length,
    };
  } catch (err) {
    console.error("FCM send error:", err?.message || err);
    return { ok: false, error: err?.message || "FCM_ERROR" };
  }
}
