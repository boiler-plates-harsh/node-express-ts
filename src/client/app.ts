import express from "express";
import figlet from "figlet";
import { errorHandler } from "@middleware/errorHanlder";
import cors from "cors";
import env from "@config/env";
import routes from "./routes";
import morgan from "@middleware/morgan";
import { connectDB } from "@db/mongo";
import { AppRequest } from "@helpers/common";

const app = express();

async function main() {
	await connectDB("app");

	//cors
	app.use(function (req: any, res, next) {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type");
		res.setHeader("Access-Control-Allow-Credentials", "true");
		console.log("🚀 ~ file: app.ts:22 ~ req.headers?.user:", req.headers?.user);
		if (req.headers?.user) {
			req.userId = req.headers?.user as string;
		}
		next();
	});

	app.use(cors({ origin: "*" }));

	app.use(express.json());

	app.use("/v1", routes.public);

	//logger
	app.use(morgan);

	app.use("/v1/user/news", routes.news);

	app.use(errorHandler);

	app.listen(env.port, () => {
		figlet.text(
			"Harsh . js",
			{
				font: "Big",
			},
			function (err, data) {
				if (err) {
					console.log("Something went wrong...");
					console.dir(err);
					return;
				}

				console.log(data);
				console.log(`Listening 🤙 On PORT ${env.port} 🚀`);
			},
		);
	});
}
main();
