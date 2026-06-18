module.exports = {
  apps: [
    {
      name: "mimo-tts",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: process.cwd(),
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      kill_timeout: 10000,
      listen_timeout: 30000,
    },
  ],
};
