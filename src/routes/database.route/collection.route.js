import { Router } from "express";
import { deleteCollection } from "../../controllers/database.controller/collection.controller";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { addColumn } from "../../controllers/database.controller/attribute.controller.js";

const collectionRouter = new Router();
collectionRouter.route("/deleteCollection/:collection_id").delete(authMiddleware, deleteCollection);
collectionRouter.route("/:collection_id/addColumn").post(authMiddleware, addColumn);

export default collectionRouter;