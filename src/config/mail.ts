import dotenv from "dotenv";

dotenv.config();

export default {
	mailhostname: process.env.MAIL_HOSTNAME,
	mailport: process.env.MAIL_PORT,
	mailuseremail: process.env.MAIL_USERNAME,
	mailuserpwd: process.env.MAIL_PASSWORD,
	mailfrom: process.env.MAIL_FROM,
	logoImage: process.env.APP_LOGO,
	appName: process.env.APP_NAME,
	infoMail: process.env.MAIL_USERNAME_INFO,
	contactNumber: process.env.APP_CONTACT,
};
