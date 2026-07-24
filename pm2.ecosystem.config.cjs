module.exports = {
  apps: [
    {
      name: 'cafe-marketplace',
      script: 'server.js',
      cwd: './',
      exec_mode: 'fork',
      instances: 1,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      max_restarts: 5,
      restart_delay: 5000,
      min_uptime: 10000,
      listen_timeout: 8000,
      kill_timeout: 5000,
    },
  ],
}
