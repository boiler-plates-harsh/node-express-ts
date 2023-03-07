import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}

	res.status(err.statusCode || 200).json({
		status: false,
		message: err.message || "An Unknown Error",
		data: null,
	});
};
