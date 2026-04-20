const { Client } = require('pg');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'student_management',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
};

console.log('Attempting to connect with:', { ...config, password: '****' });

const client = new Client(config);

client.connect()
    .then(() => {
        console.log('Successfully connected to the database!');
        return client.query('SELECT NOW()');
    })
    .then(res => {
        console.log('Current time from DB:', res.rows[0].now);
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed!');
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        process.exit(1);
    });
