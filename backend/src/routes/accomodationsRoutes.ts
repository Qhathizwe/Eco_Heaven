import { Router } from "express";
import {upload} from '../middleware/uploadMiddleware'
import {
    createAccomodationController,
    getAllAccomodationsController,
    getAccomodationByIdController,
    getAccomodationByNameController,
    getAccomodationByProvinceController,
    updateAccomodationController,
    deleteAccomodationController
} from '../controllers/accomodationControllers';

const router = Router();


router.post('/accomodation', upload.array('pictures', 5), createAccomodationController);
router.get('/accomodations', getAllAccomodationsController);
router.get('/accomodations/:id', getAccomodationByIdController);
router.get('/accomodations/name/:name', getAccomodationByNameController);
router.get('/accomodations/province/:province', getAccomodationByProvinceController);
router.put('/accomodations/:id', updateAccomodationController);
router.delete('/accomodations/:id', deleteAccomodationController);

export default router;
