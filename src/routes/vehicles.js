import express from 'express';
import {
  getVehicles, getVehicle, createVehicle,
  updateVehicle, deleteVehicle, getCurrentLocation
} from '../controllers/vehicleController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getVehicles)
  .post(authorize('hq_admin', 'provincial_admin'), createVehicle);

router.route('/:id')
  .get(getVehicle)
  .put(authorize('hq_admin', 'provincial_admin'), updateVehicle)
  .delete(authorize('hq_admin'), deleteVehicle);

router.get('/:id/location/current', getCurrentLocation);

export default router;