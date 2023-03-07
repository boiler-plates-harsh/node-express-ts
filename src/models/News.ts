import { Schema, model, Document } from "mongoose";

export interface News extends Document {
	heading: string;
	intro: string;
	image: string;
	seo_headline: string;
	paragraph: string;
	series_id: string;
	match_id: string;
}

const NewsSchema: Schema = new Schema(
	{
		heading: { type: String },
		intro: { type: String },
		image: { type: String },
		seo_headline: { type: String },
		paragraph: { type: String },
		series_id: { type: String },
		match_id: { type: String },
	},
	{ timestamps: true },
);

export default model<News>("News", NewsSchema);
