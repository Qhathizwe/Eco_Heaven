import { Router } from "express";
import { upload } from '../middleware/uploadMiddleware';
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

// Routes handling image arrays matching your React FormData keys
router.post('/accomodation', upload.array('pictures', 10), createAccomodationController);
router.put('/accomodations/:id', upload.array('pictures', 10), updateAccomodationController);

// Standard data pipeline routes
router.get('/accomodations', getAllAccomodationsController);
router.get('/accomodations/:id', getAccomodationByIdController);
router.get('/accomodations/name/:name', getAccomodationByNameController);
router.get('/accomodations/province/:province', getAccomodationByProvinceController);
router.delete('/accomodations/:id', deleteAccomodationController);

export default router;
