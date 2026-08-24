import { Router } from "express";
import {
    addColumn,
    listAttributes,
    updateAttribute,
    deleteAttribute
} from "../controllers/AttributeController.js";
import { authMiddleware } from "../../../shared/middleware/auth.middleware.js";
import { validate } from "../../../shared/middleware/validate.js";
import { addColumnSchema, listAttributesSchema, updateAttributeSchema, deleteAttributeSchema } from "../../../shared/validation/attribute.js";

const attributeRouter = new Router();

attributeRouter.route("/:collection_id/attributes")
    .post(authMiddleware, validate(addColumnSchema), addColumn);

attributeRouter.route("/:collection_id/attributes")
    .get(authMiddleware, validate(listAttributesSchema), listAttributes);

attributeRouter.route("/:collection_id/attributes/:attribute_id")
    .put(authMiddleware, validate(updateAttributeSchema), updateAttribute);

attributeRouter.route("/:collection_id/attributes/:attribute_id")
    .delete(authMiddleware, validate(deleteAttributeSchema), deleteAttribute);

export default attributeRouter;