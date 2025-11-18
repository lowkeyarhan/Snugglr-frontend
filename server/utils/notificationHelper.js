import { createNotification } from "../controllers/notificationController.js";
import webSocketHub from "../websocket/websocketHub.js";

/**
 * Creates a notification and pushes it over the websocket hub.
 */
export const createAndEmitNotification = async (notificationData) => {
  try {
    const notification = await createNotification(notificationData);
    if (notification?.recipient) {
      webSocketHub.pushNotification(
        notification.recipient.toString(),
        notification
      );
    }

    return notification;
  } catch (error) {
    console.error(`Error in createAndEmitNotification: ${error.message}`);
    throw error;
  }
};

export default createAndEmitNotification;
