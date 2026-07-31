module.exports = {
  apps: [
    {
      name: 'cafe-marketplace',
      script: 'start.js',
      cwd: './',
      exec_mode: 'fork',
      instances: 1,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 10000,
      min_uptime: 30000,
      listen_timeout: 30000,
      kill_timeout: 10000,
      exp_backoff_restart_delay: 100,
      max_reloads: 3,
    },
  ],
}
