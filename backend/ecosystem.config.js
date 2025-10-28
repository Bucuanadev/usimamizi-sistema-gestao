module.exports = {
  apps: [{
    name: 'usimamizi-backend',
    script: 'server.js',
    cwd: '/var/www/usimamizi/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/usimamizi/backend-error.log',
    out_file: '/var/log/usimamizi/backend-out.log',
    log_file: '/var/log/usimamizi/backend-combined.log',
    time: true
  }]
};
