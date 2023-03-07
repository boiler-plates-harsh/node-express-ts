import { AppRequest } from "@helpers/common";
import express, { Response, Request } from "express";
import env from "@config/aws";
import { R } from "./response-helpers";
import path from "path";
import { UploadedFile } from "express-fileupload";
import aws from "aws-sdk";
import AppErr from "./AppErr";

aws.config.update({
	accessKeyId: env.accessKeyId,
	secretAccessKey: env.secretAccessKey,
	region: env.region,
});

const s3 = new aws.S3({});

export const uploadFile = async (
	req: AppRequest,
	res: Response,
	_path: string,
) => {
	try {
		let publicPath = _path;

		if (!req.files) {
			return R(res, false, "No file uploaded!");
		}

		const file = req.files.file;
		const data: any = [];

		const move = (image: any, i: any) => {
			const file = image;
			let filename = file?.name;
			let index = i + 1;
			try {
				const extensionName = path?.extname(filename ?? "");

				// const allowedExtension = [".png", ".jpg", ".jpeg"];

				// if (!allowedExtension.includes(extensionName)) {
				// 	return res.json({ message: "Invalid Image", status: false });
				// }

				filename = filename.substring(0, 3) + Date.now() + extensionName;

				file.mv(`${publicPath}${filename}`);
			} catch (e) {
				return R(res, false, "File upload failed");
			}

			data.push(filename);
		};

		Array.isArray(file)
			? file.forEach((file, i) => move(file, i))
			: move(file, 0);

		return data;
	} catch (e) {
		return R(res, false, "File upload failed");
	}
};

export const uploadOneFile = async (
	req: AppRequest,
	res: Response,
	_path: string,
	ignore?: Boolean,
	fileKey?: string,
) => {
	try {
		let publicPath = _path;

		if (!req.files) {
			if (ignore) {
				return false;
			}
			throw new AppErr("No file uploaded!");
		}

		const file = req.files[fileKey || "file"] as UploadedFile;

		let filename = file?.name;

		const extensionName = path?.extname(filename ?? "");

		const allowedExtension = [".png", ".jpg", ".jpeg", ".gif"];

		if (!allowedExtension.includes(extensionName)) {
			return res.json({ message: "Invalid Image", status: false });
		}

		filename = "" + Date.now() + extensionName;

		const params = {
			Bucket: env.bucketName,
			Key: filename,
			Body: file?.data,
		};

		let s3File = await s3.upload(params).promise();

		console.log(s3File);

		// file.mv(`${publicPath}${filename}`);

		return s3File?.Location;
	} catch (e) {
		return R(res, false, "File upload failed");
	}
};
