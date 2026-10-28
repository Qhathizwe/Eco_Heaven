import { Request, Response } from "express";
import {
  addFavourite,
  removeFavourite,
  getFavouriteIdsForUser,
  getFavouritesForUser,
} from '../services/favouriteServices'

function currentUserId(req: Request): number | null {
  const id = Number(req.tokenData?.userId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function positiveId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const getMyFavourites = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = currentUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Please sign in." });
      return;
    }

    const [items, ids] = await Promise.all([
      getFavouritesForUser(userId),
      getFavouriteIdsForUser(userId),
    ]);

    res.json({ success: true, data: items, ids });
  } catch (error) {
    console.error("Get favourites:", error);
    res.status(500).json({ message: "Could not load favourites." });
  }
};

export const addMyFavourite = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = currentUserId(req);
    const accommodationId = positiveId(req.params.accommodationId as string);

    if (!userId) {
      res.status(401).json({ message: "Please sign in." });
      return;
    }

    if (!accommodationId) {
      res.status(400).json({ message: "Invalid accommodation ID." });
      return;
    }

    const favourite = await addFavourite(userId, accommodationId);
    res.status(201).json({
      success: true,
      data: favourite,
      message: "Accommodation added to favourites.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save favourite.";

    const status = message === "Accommodation not found." ? 404 : 500;
    console.error("Add favourite:", error);
    res.status(status).json({ message });
  }
};

export const removeMyFavourite = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = currentUserId(req);
    const accommodationId = positiveId(req.params.accommodationId as string);

    if (!userId) {
      res.status(401).json({ message: "Please sign in." });
      return;
    }

    if (!accommodationId) {
      res.status(400).json({ message: "Invalid accommodation ID." });
      return;
    }

    await removeFavourite(userId, accommodationId);
    res.json({
      success: true,
      message: "Accommodation removed from favourites.",
    });
  } catch (error) {
    console.error("Remove favourite:", error);
    res.status(500).json({ message: "Could not remove favourite." });
  }
};