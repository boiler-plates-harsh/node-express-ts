import { Schema, model, Document } from "mongoose";

export interface Example extends Document {
	name: string;
	id: string;
}

const ExampleSchema: Schema = new Schema(
	{
		name: { type: String },
		id: { type: String },
	},
	{ timestamps: true },
);

export default model<Example>("Example", ExampleSchema);
