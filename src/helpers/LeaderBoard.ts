import ioredis, { Redis } from "ioredis";

interface LeaderboardUser {
	rank: number;
	username: string;
	score: number;
	avatar: string;
}

class Leaderboard {
	private client: Redis;
	public leaderboardName: string;

	constructor(leaderboardName: string) {
		this.leaderboardName = leaderboardName || "Leaderboard";

		const redis = new ioredis({
			// keyPrefix: "ocricketLeader",
		});
		this.client = redis;
	}

	// Add a new user to the leaderboard with a score
	/**
	 * @function adduser
	 * @param userId - _id from User Modal
	 * @param score - score of the user
	 * @returns {void}
	 */
	public async addUser(username: string, score: number): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.client.zadd(this.leaderboardName, score, username, (err, reply) => {
				if (err) {
					reject(err);
					return;
				}
				console.log(`Added ${username} to leaderboard with score ${score}`);
				resolve();
			});
		});
	}

	// Get the leaderboard with user rankings in ascending order

	public async getLeaderboard(
		page: number,
		pageSize: number,
		userid: string,
		skip?: number,
	): Promise<LeaderboardUser[]> {
		return new Promise<LeaderboardUser[]>((resolve, reject) => {
			const startIndex = (page - 1) * pageSize + (skip || 3);
			const endIndex = startIndex + pageSize - 1;
			this.client.zrevrange(
				this.leaderboardName,
				startIndex,
				endIndex,
				"WITHSCORES",
				async (err, reply) => {
					if (err) {
						reject(err);
						return;
					}
					if (!reply) {
						reject("No Data");
						return;
					}
					const leaderboard: LeaderboardUser[] = [];
					let rank = startIndex + 1;
					for (let i = 0; i < reply.length; i += 2) {
						const userId = reply[i];
						if (userId == userid) {
							rank++;

							continue;
						}
						const score = parseInt(reply[i + 1]);
						const userData: any = await this.getUserFields(userId);
						leaderboard.push({ rank, userId, score, ...userData });
						rank++;
					}
					// const totalUsers = await this.getTotalUsers();
					console.log(
						`Leaderboard page ${page} with ${pageSize} items (out of ${"totalUsers"} total users):`,
						leaderboard,
					);
					resolve(leaderboard);
				},
			);
		});
	}

	// Get the total number of users in the leaderboard
	public async getTotalUsers(): Promise<number> {
		return new Promise<number>((resolve, reject) => {
			this.client.zcard(this.leaderboardName, (err, reply: any) => {
				if (err) {
					reject(err);
					return;
				}
				// if (!reply) {
				// 	return console.log("No data");
				// }
				resolve(reply);
			});
		});
	}

	// Get the rank of a user in the leaderboard
	public async getRank(userId: string): Promise<number> {
		return new Promise<number>((resolve, reject) => {
			this.client.zrevrank(this.leaderboardName, userId, (err, reply) => {
				if (err) {
					reject(err);
					return;
				}
				console.log(reply);
				if (!reply && reply != 0) {
					reject("No Data");
					return;
				}
				console.log(
					"🚀 ~ file: LeaderBoard.ts:109 ~ Leaderboard ~ this.client.zrevrank ~ reply:",
					reply,
				);
				const rank = reply + 1;
				console.log(`Rank of ${userId} is ${rank}`);
				resolve(rank);
			});
		});
	}

	// Get the score of a user in the leaderboard
	public async getScore(userId: string): Promise<number> {
		return new Promise<number>((resolve, reject) => {
			this.client.zscore(this.leaderboardName, userId, (err, reply) => {
				if (err) {
					reject(err);
					return;
				}
				const score = parseInt(reply || "0");
				console.log(`Score of ${userId} is ${score}`);
				resolve(score);
			});
		});
	}

	// Get the additional fields for a user
	public async getUserFields(userId: string): Promise<any> {
		// let user = await this.client.hgetall(`userData:${userId}`);
		const fields = ["username", "avatar"];

		let userbyField = await this.client.hmget(`userData:${userId}`, ...fields);

		const result: any = {};

		if (!userbyField) {
			return {};
		}
		let index = 0;

		for (let f of fields) {
			result[f] = userbyField[index];

			index++;
		}

		return result;
	}

	public async getUserPosition(userId: string): Promise<any> {
		try {
			// let user = await this.client.hgetall(`userData:${userId}`);
			const rank = await this.getRank(userId);
			const score = await this.getScore(userId);
			const userData = await this.getUserFields(userId);
			return {
				rank: rank,
				userId: userId || null,
				score: score || 0,
				...userData,
			};
		} catch (err) {
			console.log(err);
			return {};
		}
	}

	public async updateScore(userId: string, score: number): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.client.zadd(this.leaderboardName, score, userId, (err, reply) => {
				if (err) {
					reject(err);
					return;
				}
				console.log(
					`User ${userId} updated score to ${score} in leaderboard ${this.leaderboardName}`,
				);
				resolve();
			});
		});
	}

	public async getUsersByRanks(ranks: number[]): Promise<any> {
		try {
			const multi = this.client.multi();

			for (let r of ranks) {
				multi.zrevrange(this.leaderboardName, r - 1, r - 1, "WITHSCORES");
			}

			const replies = await multi.exec();
			if (!replies) {
				return [];
			}

			const leaderboard: any = {};
			let data = replies.map(async ([err, reply, ...rest]: any, index) => {
				console.log(
					"🚀 ~ file: LeaderBoard.ts:184 ~ Leaderboard ~ replies.forEach ~ reply:",
					reply,
				);
				if (!reply) {
					return {};
				}
				const rank = ranks[index];
				const userId = reply[0];
				const score = parseInt(reply[1]);
				const userData: any = await this.getUserFields(userId);
				leaderboard[rank] = {
					rank: rank,
					userId: userId || null,
					score: score || 0,
					...userData,
				};
				return { rank, userId, score, ...userData };
			});

			console.log(`Users at ranks [${ranks.join(", ")}]:`, leaderboard);
			data = await Promise.all([...data]);
			return leaderboard as any;
		} catch (err) {
			console.error(err);
			return null;
		}
	}
}

export default Leaderboard;
