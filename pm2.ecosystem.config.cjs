module.exports = {
  apps: [
    {
      name: 'cafe-marketplace',
      script: 'start.js',
      cwd: './',
      exec_mode: 'fork',
      instances: 1,
      // IMPORTANTE: antes 800M. El reinicio por memoria cortaba respuestas
      // streamed en mitad del envío (página en blanco con el payload RSC a
      // medias). Subido a 1G; ajústalo según la RAM del VPS. Si el proceso se
      // mata a 1G, o bien faltan SWAP/plan mayor, o hay un leak que hay que cazar.
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Heap de Node: sube el tope de memoria para builds/render pesados.
        // No superes ~70% de la RAM física del VPS.
        NODE_OPTIONS: '--max-old-space-size=1024',
        // Con las páginas ya estáticas (ISR) este umbral casi no se toca.
        KEEP_ALIVE_TIMEOUT: '65000',
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
