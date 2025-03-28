const sql = require('mssql');
const dbConfig = require('../dbConfig');
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    try {
        console.log("Received Event:", event.body); // Debug log

        const body = JSON.parse(event.body);
        const { email, password } = body;

        console.log("Parsed Body:", body); // Debug log

        if (!email || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Email and Password are required' })
            };
        }

        const pool = await sql.connect(dbConfig);

        // Check if teacher exists
        const teacherResult = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Teachers WHERE Email = @email');

        if (teacherResult.recordset.length === 0) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ message: 'Invalid Email or Password' })
            };
        }

        const teacher = teacherResult.recordset[0];

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(password, teacher.PasswordHash);

        if (!isPasswordValid) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ message: 'Invalid Email or Password' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Login successful', teacherId: teacher.TeacherID })
        };
    } catch (err) {
        console.error("Database connection error:", err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Database error', error: err.message })
        };
    }
};
ss