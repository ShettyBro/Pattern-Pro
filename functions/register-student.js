const sql = require('mssql');
const dbConfig = require('../dbConfig');
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
        const body = JSON.parse(event.body);
        const { fullName, rollNumber, studentClass, division, phoneNumber, schoolName, password } = body;

        if (!fullName || !rollNumber || !studentClass || !division || !phoneNumber || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'All fields are required' })
            };
        }

        const pool = await sql.connect(dbConfig);

        const existingStudent = await pool.request()
            .input('rollNumber', sql.NVarChar, rollNumber)
            .query('SELECT * FROM Students WHERE RollNumber = @rollNumber');

        if (existingStudent.recordset.length > 0) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({ message: 'Student with this roll number already exists.' })
            };
        }

        await pool.request()
            .input('fullName', sql.NVarChar, fullName)
            .input('rollNumber', sql.NVarChar, rollNumber)
            .input('studentClass', sql.NVarChar, studentClass)
            .input('division', sql.NVarChar, division)
            .input('phoneNumber', sql.NVarChar, phoneNumber)
            .input('passwordHash', sql.NVarChar, password) // Using hashed password
            .query(`
                INSERT INTO Students (FullName, RollNumber, Class, Division, PhoneNumber, PasswordHash) 
                VALUES (@fullName, @rollNumber, @studentClass, @division, @phoneNumber, @passwordHash)
            `);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ message: 'Student registered successfully' })
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
