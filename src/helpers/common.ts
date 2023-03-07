import { Request, Response } from "express";
import { R } from "./response-helpers";
import env from "@config/env";
import axios from "axios";
import {
	uniqueNamesGenerator,
	Config,
	adjectives,
	colors,
	names,
	starWars,
	animals,
} from "unique-names-generator";

export const sendSms = (mobile: String) => {
	return true;
};

export function youtubeId(url: any) {
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);

	return match && match[2].length === 11 ? match[2] : null;
}

export function isNumeric(str: any) {
	// if (typeof str != "string") return false; // we only process strings!
	return (
		!isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str))
	); // ...and ensure strings of whitespace fail
}

export function ordinal_suffix_of(i: any) {
	var j = i % 10,
		k = i % 100;
	if (j == 1 && k != 11) {
		return i + "st";
	}
	if (j == 2 && k != 12) {
		return i + "nd";
	}
	if (j == 3 && k != 13) {
		return i + "rd";
	}
	return i + "th";
}

export function generateRandomUserName() {
	const customConfig: Config = {
		dictionaries: [adjectives, colors, animals, names, starWars],
		separator: "",
		length: 2,
		style: "capital",
	};

	const randomName: string = uniqueNamesGenerator(customConfig);

	return randomName;
}

export const randomInRange = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min)) + min;

export function formatTime(seconds: number) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;
	const timeString = `${hours}:${minutes
		.toString()
		.padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
	return timeString;
}

export interface AppRequest extends Request {
	userId: string;
}
