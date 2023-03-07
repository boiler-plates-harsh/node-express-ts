import { connectDB } from "@db/mongo";
import EventEmitter from "events";
const event = new EventEmitter();

let updatedFixture: any = {};
let updatedOdds: any = {};

event.on("something", async (data) => {
	// do something
	return true;
});



export default event;
