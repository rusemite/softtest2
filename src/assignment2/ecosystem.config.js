module.exports = {
  apps : [
    {
      name: 'student-mgmt-3000',
      script: './src/assignment2/app.js',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        DB_USER: 'postgres',
        DB_PASSWORD: '12345',
        DB_HOST: 'localhost',
        DB_NAME: 'student_management',
        DB_PORT: 5432
      }
    },
    {
      name: 'student-mgmt-4000',
      script: './src/assignment2/app.js',
      env: {
        PORT: 4000,
        NODE_ENV: 'production',
        DB_USER: 'postgres',
        DB_PASSWORD: '12345',
        DB_HOST: 'localhost',
        DB_NAME: 'student_management',
        DB_PORT: 5432
      }
    }
  ]
};
