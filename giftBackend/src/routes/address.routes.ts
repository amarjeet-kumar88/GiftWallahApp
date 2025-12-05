import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createAddressController,
  deleteAddressController,
  getAddressesController,
  updateAddressController
} from "../controllers/address.controller";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import {
  createAddressSchema,
  updateAddressSchema,
  addressIdParamSchema
} from "../validation/address.schema";


/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: User shipping addresses
 */

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Get all addresses of current user
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of addresses
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - line1
 *               - city
 *               - state
 *               - pincode
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               line1:
 *                 type: string
 *               line2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               country:
 *                 type: string
 *                 example: "India"
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address created
 */

/**
 * @swagger
 * /api/addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               line1:
 *                 type: string
 *               line2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated
 *       404:
 *         description: Address not found
 */

/**
 * @swagger
 * /api/addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted
 *       404:
 *         description: Address not found
 */


const router = Router();

router.use(authMiddleware);

router.get("/", getAddressesController);
router.post("/", validateRequest(createAddressSchema), createAddressController);
router.put("/:id", validateRequest(updateAddressSchema), updateAddressController);
router.delete(
  "/:id",
  validateRequest(addressIdParamSchema),
  deleteAddressController
);

export default router;
