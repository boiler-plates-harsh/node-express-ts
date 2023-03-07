import ioredis, { Redis } from "ioredis";

export interface CustomRedis extends Redis {
	getJson?: any;
	setJson?: any;
}

const redis: any = new ioredis();

const getJson = async function (key: string) {
	let data: any = await redis.get(key);
	return JSON.parse(data);
};

const setJson = async function (key: string, value: any) {
	return await redis.set(key, JSON.stringify(value));
};

redis.getJson = getJson;
redis.setJson = setJson;

export default redis as CustomRedis;
