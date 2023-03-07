import redis from "@db/redis";
import moment from "moment";
import Leaderboard from "./LeaderBoard";
import { formatTime } from "./common";

const Session: any = {} // mongoose model

/**
 * @function AddUserSession
 * @param user_id
 */
export const AddUserSession = async (user_id: any, state_id: any) => {
	const date = moment().startOf("day").format();
	const startTime = moment().unix();
	console.log("🚀 ~ file: index.ts:199 ~ main7 ~ date:", date);
	// console.log("🚀 ~ file: index.ts:201 ~ main7 ~ startTime:", startTime);
	await redis.set(`userLastSessionLog:${user_id}`, startTime);

	// find the document for the user and date
	const query = {
		user: user_id,
		date: date,
		state: state_id,
	};

	const update = {
		$push: { sessions: { start: startTime, end: null } },
	};

	let updateOrCreate = await Session.updateOne(query, update, {
		upsert: true,
		new: true,
	});
	// console.log(
	// 	"🚀 ~ file: index.ts:218 ~ main7 ~ updateOrCreate:",
	// 	updateOrCreate,
	// );
	return true;
};

/**
 * @function updateUserSession
 * @param user_id
 */
export const updateUserSession = async (user_id: any, state_id: any) => {
	const today = moment();

	const date = moment().startOf("day").format();
	console.log("🚀 ~ file: session.ts:46 ~ updateUserSession ~ date:", date);
	const endTime = moment().unix();
	// console.log("🚀 ~ file: index.ts:199 ~ main7 ~ date:", date);
	// console.log("🚀 ~ file: index.ts:201 ~ main7 ~ startTime:", endTime);
	const startTime = await redis.get(`userLastSessionLog:${user_id}`);

	// find the document for the user and date
	const query = {
		user: user_id,
		date: date,
		state: state_id,
		sessions: {
			$elemMatch: { ...(startTime && { start: startTime }), end: null },
		},
	};

	const update = {
		$set: { "sessions.$.end": endTime },
	};

	let updated = await Session.findOneAndUpdate(query, update, { new: true });

	if (!updated) {
		return false;
	}

	updated.time = updated.sessions
		.map((s: any) => (s.end || s.start) - s.start)
		.reduce((a: any, b: any) => a + b, 0);

	await updated.save();

	console.log(
		"🚀 ~ file: session.ts:64 ~ updateUserSession ~ updated.time:",
		updated.time,
	);

	const lb = new Leaderboard(`LeaderboardWatchTime2:${date}`);

	await lb.updateScore(updated?.user?.toString(), updated?.time);

	let lists = await redis.smembers("activeLeaderboardList");
	console.log("🚀 ~ file: session.ts:90 ~ updateUserSession ~ lists:", lists);

	if (lists) {
		for (let l of lists) {
			const dates = l.split("_");
			console.log(
				"🚀 ~ file: session.ts:95 ~ updateUserSession ~ dates:",
				dates,
			);
			if (dates.length > 1) {
				const from = moment(dates[0]);
				const to = moment(dates[1]);

				console.log(
					"🚀 ~ file: session.ts:98 ~ updateUserSession ~ from.isSame(today):",

					today.isSameOrAfter(from),
				);
				console.log(
					"🚀 ~ file: session.ts:98 ~ updateUserSession ~ to.isSame(today):",

					today.isSameOrBefore(to),
				);
				if (today.isSameOrAfter(from) && today.isSameOrBefore(to)) {
					const lb = new Leaderboard(`LeaderboardWatchTime2:${l}`);

					await lb.updateScore(updated?.user?.toString(), updated?.time);
				}
			}
		}
	}

	// console.log("🚀 ~ file: index.ts:218 ~ main7 ~ updateOrCreate:", udpate);
	return true;
};
