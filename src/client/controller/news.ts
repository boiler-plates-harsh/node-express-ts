import { AppRequest } from "@helpers/common";
import express, { Response, Request } from "express";
import { asyncWrapper, R } from "@helpers/response-helpers";
import Joi from "joi";
import env from "@config/env";
import { Validate } from "@validation/utils";
import schema from "@validation/schema";
import moment from "moment";
import redis from "@db/redis";
import News from "@models/News";
import { uploadOneFile } from "@helpers/upload";
import path from "@config/path";

export default {
	test: asyncWrapper(async (req: AppRequest, res: Response) => {
		return R(res, true, "Test Route from News");
	}),

	list: asyncWrapper(async (req: AppRequest, res: Response) => {
		let list = await News.find({});
		return R(res, true, "News List", list);
	}),

	detail: asyncWrapper(async (req: AppRequest, res: Response) => {
		let detail = await News.findById(req.params.id);
		if (!detail) {
			return R(res, false, "No News found");
		}

		return R(res, true, "News Detail", detail);
	}),

	add: asyncWrapper(async (req: AppRequest, res: Response) => {
		let data = await Validate(
			res,
			[
				"heading",
				"intro",
				"seo_headline",
				"paragraph",
				"series_id",
				"match_id",
			],
			schema.news.add,
			req.body,
			{},
		);

		// file upload
		let file = await uploadOneFile(req, res, path.news);

		data["image"] = file;

		let entry = await News.create(data);

		return R(res, true, "News Added", entry);
	}),

	update: asyncWrapper(async (req: AppRequest, res: Response) => {
		let data = await Validate(res, [], schema.news.add, req.body, {});

		// file upload
		let file = await uploadOneFile(req, res, path.news, true);

		if (file) {
			data["image"] = file;
		}

		let _id = data._id;

		delete data._id;

		let entry = await News.findByIdAndUpdate(_id, data);

		return R(res, true, "News Updated", entry);
	}),

	delete: asyncWrapper(async (req: AppRequest, res: Response) => {
		let data = await Validate(res, ["_id"], schema.news.add, req.query, {});

		let _id = data._id;

		let entry = await News.findByIdAndDelete(_id);

		return R(res, true, "News Deleted", entry);
	}),
};
