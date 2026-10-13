import { Request, Response } from "express";
import {
    createAccomdation,
    findAllAccomodations,
    findAccomodationById,
    findAccomodationByName,
    findAccomodationByProvince,
    updateAccomodation,
    deleteAccomodation
}
from '../services/accomodationServices'
import * as accomodationServices from '../services/accomodationServices'
import dotenv from 'dotenv'

dotenv.config();

export const createAccomodationController = async (req: Request, res: Response) =>{
    const {name, description, address, amenities, star_rating, pictures, province, rooms} = req.body;
    if (!name || !description || !address || !amenities || !star_rating || !pictures || !province || !rooms){
      return res.status(400).json({ message: "All fields are required" });  
    };
    try{
    const accomodation = await accomodationServices.createAccomdation(req.body)
    return res.status(201).json({
        message: "Accomodation created successfully",
        accomodationId: accomodation.id
    })
    }catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error Creating a User" });
    };
};

export const getAllAccomodationsController = async (req: Request, res: Response) => {
    try {
        const accomodations = await accomodationServices.findAllAccomodations();
        return res.status(200).json(accomodations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving accomodations" });
    }
};

export const getAccomodationByIdController = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const accomodation = await accomodationServices.findAccomodationById(parseInt(id as string));
        if (!accomodation) {
            return res.status(404).json({ message: "Accomodation not found" });
        }
        return res.status(200).json(accomodation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving accomodation" });
    }
};

export const getAccomodationByNameController = async (req: Request, res: Response) => {
    const { name } = req.params;
    try {
        const accomodation = await accomodationServices.findAccomodationByName(name as string);
        if (!accomodation) {
            return res.status(404).json({ message: "Accomodation not found" });
        }
        return res.status(200).json(accomodation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving accomodation" });
    }
};

export const getAccomodationByProvinceController = async (req: Request, res: Response) => {
    const { province } = req.params;
    try {
        const accomodations = await accomodationServices.findAccomodationByProvince(province as string);
        return res.status(200).json(accomodations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving accomodations" });
    }
};

export const updateAccomodationController = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updatedAccomodation = await accomodationServices.updateAccomodation(parseInt(id as string), req.body);
        if (!updatedAccomodation) {
            return res.status(404).json({ message: "Accomodation not found" });
        }
        return res.status(200).json(updatedAccomodation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating accomodation" });
    }
};

export const deleteAccomodationController = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedAccomodation = await accomodationServices.deleteAccomodation(parseInt(id as string));
        if (!deletedAccomodation) {
            return res.status(404).json({ message: "Accomodation not found" });
        }
        return res.status(200).json({ message: "Accomodation deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting accomodation" });
    }
};