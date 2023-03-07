import { connectDB } from "@db/mongo";
import redis from "@db/redis";
import { generateRandomUserName, randomInRange } from "@helpers/common";
import { AddUserSession, updateUserSession } from "@helpers/session";
import { Server, Socket } from "socket.io";

// create socket server
const io = new Server({
	transports: ["websocket", "polling"],
	cors: {
		origin: "*",
	},
});

// connect to mongodb
connectDB("Socket IO ");

interface UserType { }

// adding properties to existing socket instance
export interface CustomSocket extends Socket {
	user?: UserType; // or any other type
}

/**
 * User Id Lists
 * @example { ["mongodb objectId"]: "socketId" }
 *
 * getUserById - function to retrieve user's socket id from MongoDB Object Id
 *
 * setUserId - function to set user's socket id with MongoDB Object Id
 */
let userIdList = new Map();

const getUserId = (userId: any) => {
	return userIdList.get(`${userId}`) || "";
};

const setUserId = (userId: any, socketId: any) => {
	userIdList.set(`${userId}`, socketId);
};
/* END */

// Interval variable
var interVal: any;

// count of connected users
var connectedClients = 0;

/**
 * @Array - userNames
 * Contains all existing usernames
 */
const usersNames = new Set();

/**
 * @function sendMessage
 * @param socket
 * @param message
 * @param status
 */
const sendMessage = (socket: CustomSocket, message = "", status = false) => {
	socket.emit("message-request", {
		status: status,
		message: message,
	});
	return true;
};

// socket io connnection
io.on("connection", (socket: CustomSocket) => {
	connectedClients++;
	console.log("Socket Connection Received");
	// sendMessage(socket, "Connected to Socket Server", true);

	//set user data when connected
	socket.on("set-user", async (d) => {
		console.log("set User called");
		const user: any = {}
		socket.user = user;
		setUserId(user._id.toString(), socket.id);
		// await AddUserSession(user._id.toString(), _state._id);

		socket.emit("get-user", user);
	});

	// io.emit("first-event", "hello new user connected");

	socket.on("test-ping", (d) => {
		console.log("test pong sent	");
		io.emit("test-pong", d);
	});

	if (!interVal) {
		interVal = setInterval(async () => {
			let data = await redis.getJson("matched_matches:");

			if (data) {
				io.emit("get-odds", data);
				for (let d of data) {
					io.emit(`get-match-detail-${d?.id}`, d);
				}
			}
		}, 100);
	}

	/*
	 * Users' Events
	 */

	socket.on("do-something", async (d) => {
		// do something 
	});

	socket.on("send-vote", async (d) => {
		console.log("🚀 ~ file: app.ts:127 ~ socket.on ~ d:", d);

		const {
			match_id,
			team_a_id,
			team_b_id,
			voted_team_id,
			device_id,
			actual_vote,
		} = d;

		async function sendVotes() {
			const teamAKey = `team_${match_id}:${team_a_id}`;
			const teamBKey = `team_${match_id}:${team_b_id}`;

			let teamAVotes = parseInt((await redis.get(teamAKey)) || "0");
			console.log("🚀 ~ file: app.ts:63 ~ sendVotes ~ teamAVotes:", teamAVotes);
			let teamBVotes = parseInt((await redis.get(teamBKey)) || "0");
			console.log("🚀 ~ file: app.ts:65 ~ sendVotes ~ teamBVotes:", teamBVotes);
			let totalVotes = teamAVotes + teamBVotes;
			let vote = {
				team_a_vote_percent: parseFloat(
					((teamAVotes * 100) / totalVotes).toFixed(2),
				),
				team_b_vote_percent: parseFloat(
					((teamBVotes * 100) / totalVotes).toFixed(2),
				),
				total_vote: totalVotes,
			};
			console.log("🚀 ~ file: app.ts:85 ~ sendVotes ~ vote:", vote);

			io.emit(`get-votes-${match_id}`, vote);
			return true;
		}

		if (!actual_vote) {
			return await sendVotes();
		}
		//
		const votedKey = `team:${match_id + "_" + voted_team_id}:voters`;
		const otherKey = `team:${match_id}_${voted_team_id == team_a_id ? team_b_id : team_a_id
			}:voters`;
		console.log("🚀 ~ file: app.ts:98 ~ socket.on ~ otherKey:", otherKey);
		console.log("🚀 ~ file: app.ts:98 ~ socket.on ~ votedKey:", votedKey);

		//
		const userId = device_id;

		//
		let voted = await redis.sismember(votedKey, userId);
		console.log("🚀 ~ file: app.ts:89 ~ socket.on ~ voted:", voted);
		let otherVoted = await redis.sismember(otherKey, userId);
		console.log("🚀 ~ file: app.ts:91 ~ socket.on ~ otherVoted:", otherVoted);

		//
		if (voted || otherVoted) {
			await sendVotes();
			console.log("You already voted");
			return;
		} else {
			console.log("You already did not vote");
			//
			const VoteCountKey = `team_${match_id}:${voted_team_id}`;

			//
			const voteSet = await redis.setnx(VoteCountKey, 0);

			//
			redis
				.multi()
				.sadd(votedKey, userId)
				.incr(VoteCountKey)
				.exec(async function (err, result) {
					console.log("🚀 ~ file: app.ts:88 ~ result:", result);
					if (err) return err;
					return await sendVotes();
				});
		}
	});

	socket.on("disconnect", (history) => {
		connectedClients--;
		// updateUserSession(socket.user?._id, socket.user?.state).then();
		console.log("disconnected", connectedClients);
		if (connectedClients <= 0) {
			clearInterval(interVal);
			interVal = null;
		}
		io.emit("disconnected", "user gone");
	});
});

io.listen(4009);
