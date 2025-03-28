const sql = require('mssql');
const bcrypt = require('bcryptjs');
const dbConfig = require('../dbConfig');
require('dotenv').config();

console.log('Database Configuration:', {
  user: process.env.DB_USER,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
});

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { fullName, rollNumber, studentClass, division, phoneNumber, SchoolName, password } = body;

    // Check for missing fields
    if (!fullName || !rollNumber || !studentClass || !division || !phoneNumber || !SchoolName || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'All fields are required' })
      };
    }

    const pool = await sql.connect(dbConfig);

    // Check if student already exists
    const existingStudent = await pool.request()
      .input('rollNumber', sql.VarChar, rollNumber)
      .query('SELECT * FROM Students WHERE rollNumber = @rollNumber');

    if (existingStudent.recordset.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ message: 'Student with this roll number already exists.' })
      };
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new student into database
    await pool.request()
      .input('fullName', sql.VarChar, fullName)
      .input('rollNumber', sql.VarChar, rollNumber)
      .input('studentClass', sql.VarChar, studentClass)
      .input('division', sql.VarChar, division)
      .input('phoneNumber', sql.VarChar, phoneNumber)
      .input('SchoolName', sql.VarChar, SchoolName)
      .input('password', sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO Students (fullName, rollNumber, studentClass, division, phoneNumber, SchoolName, password) 
        VALUES (@fullName, @rollNumber, @studentClass, @division, @phoneNumber,@SchoolName, @password)
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
