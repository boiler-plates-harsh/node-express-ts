import { AppRequest } from "@helpers/common";
import express, { Response, Request } from "express";
import cn from "@client/controller/news";
import fileUpload from "express-fileupload";

const router = express.Router();

router.get("/test", cn.test);

router.get("/", cn.list);

router.get("/:id", cn.detail);

router.delete("/", cn.delete);

/**
 * Upload Middleware
 */
router.use(fileUpload());

router.post("/", cn.add);

router.put("/", cn.update);

export default router;
