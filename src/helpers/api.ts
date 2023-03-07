import axios, {
	AxiosRequestConfig,
	AxiosRequestHeaders,
	AxiosResponse,
} from "axios";
import env from "../config/env";

class Client {
	public BaseURL: string;
	public headers: any;
	public params: any;
	public ignorePaths: any;
	public token: string;

	constructor(options: any = {}) {
		this.BaseURL = env.odds_api.base_url || "http://localhost:4000/";
		this.headers = options.headers || {};
		this.headers["Content-Type"] = "application/json";
		axios.defaults.timeout = 12000;
		this.params = options.params || {};
		this.ignorePaths = ["auth/login"];
		this.token = options.token || "";
	}

	setHeader(key: string, value: any) {
		this.headers[key] = value;
		return this;
	}

	setAuth() {
		this.headers["Authorization"] = "Bearer " + "token";
	}

	async get(url: any, params: any) {
		try {
			this.headers = {};

			url = env.odds_api.base_url + url + `/${this.token}`;
			params = { ...this.params, ...params } || {};

			const response = await axios.get(url, {
				params: params,
				headers: this.headers,
			});
			const status = response.status == 200;
			if (status) {
				// console.log(response.data);
				return response.data;
			}
		} catch (e) {
			return e;
		}
	}

	async post(url: string, body: any, params: any) {
		try {
			this.headers = {};

			url = env.odds_api.base_url + url + `/${this.token}`;
			params = { ...this.params, ...params } || {};
			body = body || {};
			const response = await axios.post(url, body, {
				params: params,
				headers: this.headers,
			});
			const status = response.status == 200;

			if (status) {
				return response.data;
			}
		} catch (e) {
			return e;
		}
	}
}

export default Client;
