import redis from "@db/redis";
import Agenda, { Job } from "agenda";
import env from "@config/mongo";
import { connectDB } from "@db/mongo";
import moment from "moment";

const agenda = new Agenda({
	db: {
		address: env.uri,
		collection: "jobs",
	},
});

agenda.define("do_something", async (job: Job) => {
	try {
		let data = job.attrs.data; // { name : "harsh" }
		// do something

		const time = moment().add(2, "seconds").format();

		await agenda.schedule(time, "do_something", {
			data: { name: "harsh" },
		});
	} catch (err) {
		console.log(err);
	}
});



const main = async () => {
	await connectDB("Cron Thread");
	// await cancelAll();
	await agenda.start();
	await agenda.every("50 seconds", "do_something");
};

const cancelAll = async () => {
	await agenda.cancel({});
	await redis.flushall();
};

setInterval(async () => {
	try {
		// do something
		return;
	} catch (err) {
		console.log(err);
	}
}, 2000);

main();
