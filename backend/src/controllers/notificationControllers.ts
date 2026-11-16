import type { Request, Response } from "express";
import * as notificationServices from "../services/notificationServices";

export async function getMyNotificationsController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = Number(req.tokenData?.userId);

    if (!Number.isInteger(userId) || userId < 1) {
      res.status(401).json({
        success: false,
        message: "Please sign in to view notifications.",
      });
      return;
    }

    const notifications =
      await notificationServices.getNotificationsByUser(userId);

    res.status(200).json({
      success: true,
      notifications,
      unreadCount: notifications.filter(
        (item) => !item.is_read,
      ).length,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load notifications.",
    });
  }
}

export async function markNotificationReadController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = Number(req.tokenData?.userId);
    const notificationId = Number(req.params.id);

    if (
      !Number.isInteger(userId) ||
      userId < 1 ||
      !Number.isInteger(notificationId) ||
      notificationId < 1
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid notification request.",
      });
      return;
    }

    const notification =
      await notificationServices.markNotificationAsRead(
        notificationId,
        userId,
      );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update notification.",
    });
  }
}

export async function markAllNotificationsReadController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = Number(req.tokenData?.userId);

    if (!Number.isInteger(userId) || userId < 1) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const updated =
      await notificationServices.markAllNotificationsAsRead(userId);

    res.status(200).json({
      success: true,
      updated,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update notifications.",
    });
  }
}