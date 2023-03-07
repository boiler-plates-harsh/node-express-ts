import { AppRequest } from "@helpers/common";
import express, { Response, Request } from "express";
import path from "path";

const router = express.Router();
router.use("/public", express.static(path.join(process.cwd() + "/public")));

router.use("/public/*", (req, res) => {
	res.redirect("/v1/public/404.jpg");
});

export default router;
