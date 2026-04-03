import { Router } from "express";
import { 
    addColumn, 
    listAttributes, 
    updateAttribute, 
    deleteAttribute 
} from "../../controllers/database.controller/attribute.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const attributeRouter = new Router();


attributeRouter.route("/:collection_id/attributes").post(authMiddleware, addColumn);


attributeRouter.route("/:collection_id/attributes").get(authMiddleware, listAttributes);

attributeRouter.route("/:collection_id/attributes/:attribute_id").put(authMiddleware, updateAttribute);


attributeRouter.route("/:collection_id/attributes/:attribute_id").delete(authMiddleware, deleteAttribute);

export default attributeRouter;
