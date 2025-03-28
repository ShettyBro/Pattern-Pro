const sql = require('mssql');
const bcrypt = require('bcryptjs');
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
        console.log("Received Event:", event.body); // Debug log

        const body = JSON.parse(event.body);
        const { fullName, teacherId, email, phoneNumber, schoolName, password } = body;

        console.log("Parsed Body:", body); // Debug log

        if (!fullName || !teacherId || !email || !phoneNumber || !schoolName || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'All fields are required' })
            };
        }

        const pool = await sql.connect(dbConfig);

        // Check if teacher ID already exists
        const existingTeacher = await pool.request()
            .input('teacherId', sql.NVarChar, teacherId)
            .query('SELECT * FROM Teachers WHERE TeacherID = @teacherId');

        if (existingTeacher.recordset.length > 0) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({ message: 'Teacher with this ID already exists.' })
            };
        }

        // Hash password before storing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.request()
            .input('fullName', sql.NVarChar, fullName)
            .input('teacherId', sql.NVarChar, teacherId)
            .input('email', sql.NVarChar, email)
            .input('phoneNumber', sql.NVarChar, phoneNumber)
            .input('schoolName', sql.NVarChar, schoolName)
            .input('passwordHash', sql.NVarChar, hashedPassword)
            .query(`
                INSERT INTO Teachers (FullName, TeacherID, Email, PhoneNumber, SchoolName, PasswordHash) 
                VALUES (@fullName, @teacherId, @email, @phoneNumber, @schoolName, @passwordHash)
            `);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ message: 'Teacher registered successfully' })
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
