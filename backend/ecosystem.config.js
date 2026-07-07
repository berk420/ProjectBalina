module.exports = {
  apps: [{
    name: 'balina-backend',
    script: 'dist/main.js',
    cwd: '/home/berk/workspace/ProjectBalina/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 8086,
      FRONTEND_URL: 'https://balina.testprocess.com.tr'
    },
    error_file: '/home/berk/workspace/ProjectBalina/backend/logs/error.log',
    out_file: '/home/berk/workspace/ProjectBalina/backend/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
