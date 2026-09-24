import { Router } from "express";
import {
    addColumn,
    listAttributes,
    updateAttribute,
    deleteAttribute
} from "../controllers/AttributeController.js";
import { authMiddleware } from "../../../shared/middleware/auth.middleware.js";
import { requireProjectAccess } from "../../../shared/middleware/index.js";
import { validate } from "../../../shared/middleware/validate.js";
import { addColumnSchema, listAttributesSchema, updateAttributeSchema, deleteAttributeSchema } from "../../../shared/validation/attribute.js";

const attributeRouter = new Router();

attributeRouter.route("/projects/:project_id/collections/:collection_id/attributes")
    .post(authMiddleware, requireProjectAccess, validate(addColumnSchema), addColumn)
    .get(authMiddleware, requireProjectAccess, validate(listAttributesSchema), listAttributes);

attributeRouter.route("/projects/:project_id/collections/:collection_id/attributes/:attribute_id")
    .put(authMiddleware, requireProjectAccess, validate(updateAttributeSchema), updateAttribute)
    .delete(authMiddleware, requireProjectAccess, validate(deleteAttributeSchema), deleteAttribute);

export default attributeRouter;