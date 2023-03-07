import mongoose from "mongoose";
import env from "@config/mongo";

export async function connectDB(thread: any) {
	try {
		mongoose.set("strict", false);
		mongoose.set("strictQuery", false);
		const db = await mongoose.connect(env.uri);
		// console.log(
		// 	`Database is connected from ${thread} to: `,
		// 	db.connection.name,
		// );
	} catch (error) {
		console.error(error);
	}
}
