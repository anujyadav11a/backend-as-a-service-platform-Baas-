import { Router } from "express";
import { 
    addColumn, 
    listAttributes, 
    updateAttribute, 
    deleteAttribute 
} from "../../controllers/database.controller/attribute.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.js";
import { addColumnSchema, listAttributesSchema, updateAttributeSchema, deleteAttributeSchema } from "../../validation/attribute.js";

const attributeRouter = new Router();

attributeRouter.route("/:collection_id/attributes").post(authMiddleware, validate(addColumnSchema), addColumn);
attributeRouter.route("/:collection_id/attributes").get(authMiddleware, validate(listAttributesSchema), listAttributes);
attributeRouter.route("/:collection_id/attributes/:attribute_id").put(authMiddleware, validate(updateAttributeSchema), updateAttribute);
attributeRouter.route("/:collection_id/attributes/:attribute_id").delete(authMiddleware, validate(deleteAttributeSchema), deleteAttribute);

export default attributeRouter;