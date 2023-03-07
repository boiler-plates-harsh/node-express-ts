module.exports = {
  apps: [
    {
      name: "Socket",
      script: "dist/socket/app.js",
    },
    {
      name: "Cron",
      script: "dist/socket/cron.js",
    },
    {
      name: "App",
      script: "dist/client/app.js",
    },
  ],
};
