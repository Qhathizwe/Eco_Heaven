import { Router } from "express";
import {
    createAccomodationController,
    getAllAccomodationsController,
    getAccomodationByIdController,
    getAccomodationByNameController,
    getAccomodationByProvinceController,
    updateAccomodationController,
    deleteAccomodationController
}
from '../controllers/accomodationControllers'

const router = Router()

router.post('/accomodation', createAccomodationController)
router.get('/accomodations', getAllAccomodationsController)
router.get('/accomodations/:id', getAccomodationByIdController)
router.get('/accomodations/name/:name', getAccomodationByNameController)
router.get('/accomodations/province/:province', getAccomodationByProvinceController)
router.put('/accomodation/:id', updateAccomodationController)
router.delete('/accomodation/:id', deleteAccomodationController)

export default router