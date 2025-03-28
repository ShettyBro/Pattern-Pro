const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = require('../dbConfig');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret";

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
    const { rollno, password } = body;

    if (!rollno || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Rollno and password are required' })
      };
    }

    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('RollNumber', sql.VarChar, rollno) // Corrected input name
      .query('SELECT * FROM Students WHERE RollNumber = @RollNumber');

    if (result.recordset.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid username or password' })
      };
    }

    const user = result.recordset[0];

    // Debugging: Check if PasswordHash exists
    console.log("Fetched user:", user);

    if (!user.PasswordHash) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Error: Password not found in database' })
      };
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash); // Fixed field name

    if (isMatch) {
      const token = jwt.sign(
        { id: user.StudentID, rollno: user.RollNumber },
        JWT_SECRET,
        { expiresIn: '5h' }
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Login successful', token })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid username or password' })
      };
    }
  } catch (err) {
    console.error("Login Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Error during login', error: err.message })
    };
  }
};
