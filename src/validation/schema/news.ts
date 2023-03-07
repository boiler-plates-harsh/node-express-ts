import Joi from "joi";

export default {
	add: {
		_id: Joi.string().required(),
		heading: Joi.string().required(),
		intro: Joi.string().required(),
		seo_headline: Joi.string().required(),
		paragraph: Joi.string().required(),
		series_id: Joi.string().optional().allow(null).allow(""),
		match_id: Joi.string().optional().allow(null).allow(""),
	},
};
