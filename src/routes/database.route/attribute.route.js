import { Router } from "express";
import { 
    addColumn, 
    listAttributes, 
    updateAttribute, 
    deleteAttribute 
} from "../../controllers/database.controller/attribute.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const attributeRouter = new Router();

/**
 * @route POST /:collection_id/attributes
 * @description Add a new attribute (column) to a collection
 * @access Private
 */
attributeRouter.route("/:collection_id/attributes").post(authMiddleware, addColumn);

/**
 * @route GET /:collection_id/attributes
 * @description List all attributes for a collection
 * @access Private
 */
attributeRouter.route("/:collection_id/attributes").get(authMiddleware, listAttributes);

/**
 * @route PUT /:collection_id/attributes/:attribute_id
 * @description Update an attribute (name, type, or required field)
 * @access Private
 */
attributeRouter.route("/:collection_id/attributes/:attribute_id").put(authMiddleware, updateAttribute);

/**
 * @route DELETE /:collection_id/attributes/:attribute_id
 * @description Delete an attribute from a collection
 * @access Private
 */
attributeRouter.route("/:collection_id/attributes/:attribute_id").delete(authMiddleware, deleteAttribute);

export default attributeRouter;
