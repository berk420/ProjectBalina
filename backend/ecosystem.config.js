module.exports = {
  apps: [{
    name: 'balina-api',
    script: 'dist/main.js',
    cwd: 'C:/inetpub/wwwroot/Balina-api',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: 'C:/inetpub/wwwroot/Balina-api/logs/error.log',
    out_file: 'C:/inetpub/wwwroot/Balina-api/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
