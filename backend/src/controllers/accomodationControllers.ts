import type { Request, Response } from "express";
import * as accommodationService from "../services/accomodationServices";
import type { new_accomodation } from "../types/app.types";

function parseArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);

  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function uploadedImageUrls(req: Request): string[] {
  const files = req.files;

  if (!files) return [];

  if (Array.isArray(files)) {
    return files
      .map((file) => (file as Express.Multer.File & { path?: string }).path)
      .filter((path): path is string => Boolean(path));
  }

  return Object.values(files)
    .flat()
    .map((file) => (file as Express.Multer.File & { path?: string }).path)
    .filter((path): path is string => Boolean(path));
}

export async function createAccomodationController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      name,
      description,
      address,
      amenities,
      star_rating,
      province,
      rooms,
    } = req.body;

    const imageUrls = uploadedImageUrls(req);
    const parsedAmenities = parseArray(amenities);
    const parsedRooms = parseArray(rooms);
    const rating = Number(star_rating);

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof address !== "string" ||
      !address.trim() ||
      typeof province !== "string" ||
      !province.trim()
    ) {
      res.status(400).json({
        message: "Accommodation name, address and province are required.",
      });
      return;
    }

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      res.status(400).json({
        message: "Star rating must be between 0 and 5.",
      });
      return;
    }

    const payload: new_accomodation = {
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : "",
      address: address.trim(),
      province: province.trim(),
      star_rating: rating,
      amenities: parsedAmenities,
      rooms: parsedRooms,
      pictures: imageUrls,
    };

    const accommodation =
      await accommodationService.createAccomdation(payload);

    res.status(201).json({
      message: "Accommodation created successfully.",
      accommodation,
    });
  } catch (error) {
    console.error("Create accommodation error:", error);
    res.status(500).json({
      message: "Unable to create accommodation.",
    });
  }
}

export async function getAllAccomodationsController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const accommodations =
      await accommodationService.findAllAccomodations();

    res.status(200).json(accommodations);
  } catch (error) {
    console.error("Get accommodations error:", error);
    res.status(500).json({ message: "Unable to retrieve accommodations." });
  }
}

export async function getAccomodationByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: "Invalid accommodation ID." });
    return;
  }

  try {
    const accommodation =
      await accommodationService.findAccomodationById(id);

    if (!accommodation) {
      res.status(404).json({ message: "Accommodation not found." });
      return;
    }

    res.status(200).json(accommodation);
  } catch (error) {
    console.error("Get accommodation error:", error);
    res.status(500).json({ message: "Unable to retrieve accommodation." });
  }
}

export async function getAccomodationByNameController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const name = String(req.query.name ?? "");
    if (!name.trim()) {
      res.status(400).json({ message: "Supply a name query parameter." });
      return;
    }

    res.status(200).json(
      await accommodationService.findAccomodationByName(name),
    );
  } catch (error) {
    console.error("Search accommodations error:", error);
    res.status(500).json({ message: "Unable to search accommodations." });
  }
}

export async function getAccomodationByProvinceController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const province = String(req.params.province ?? "");
    res.status(200).json(
      await accommodationService.findAccomodationByProvince(province),
    );
  } catch (error) {
    console.error("Filter accommodations error:", error);
    res.status(500).json({ message: "Unable to filter accommodations." });
  }
}

export async function updateAccomodationController(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: "Invalid accommodation ID." });
    return;
  }

  try {
    const existing = await accommodationService.findAccomodationById(id);

    if (!existing) {
      res.status(404).json({ message: "Accommodation not found." });
      return;
    }

    const {
      name,
      description,
      address,
      amenities,
      star_rating,
      province,
      rooms,
    } = req.body;

    const newImages = uploadedImageUrls(req);

    const payload: Partial<new_accomodation> = {
      name,
      description,
      address,
      province,
      star_rating: star_rating === undefined ? undefined : Number(star_rating),
      amenities: amenities === undefined ? undefined : parseArray(amenities),
      rooms: rooms === undefined ? undefined : parseArray(rooms),
      pictures: [...(existing.pictures ?? []), ...newImages],
    };

    const updated = await accommodationService.updateAccomodation(id, payload);

    if (!updated) {
      res.status(404).json({ message: "Accommodation not found." });
      return;
    }

    res.status(200).json({
      message: "Accommodation updated successfully.",
      accommodation: updated,
    });
  } catch (error) {
    console.error("Update accommodation error:", error);
    res.status(500).json({ message: "Unable to update accommodation." });
  }
}

export async function deleteAccomodationController(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: "Invalid accommodation ID." });
    return;
  }

  try {
    const deleted = await accommodationService.deleteAccomodation(id);

    if (!deleted) {
      res.status(404).json({ message: "Accommodation not found." });
      return;
    }

    res.status(200).json({ message: "Accommodation deleted successfully." });
  } catch (error) {
    console.error("Delete accommodation error:", error);
    res.status(500).json({ message: "Unable to delete accommodation." });
  }
}