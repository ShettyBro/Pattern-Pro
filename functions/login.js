const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = require('../dbConfig');
const crypto = require('crypto');
require('dotenv').config();

// Generate a secure secret key
const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Replace with a secure secret key
const JWT_SECRET = generateSecretKey();

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

  const body = JSON.parse(event.body);
  const { rollno, password } = body;

  if (!rollno || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Rollno and password are required' })
    };
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('RollNumber', sql.VarChar, rollno)
      .query('SELECT * FROM Students WHERE RollNumber = @RollNumber');

    if (result.recordset.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid username or password' })
      };
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Generate JWT token with 5-hour expiry
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '5h' }
      );

      // Return token to client
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Error during login', error: err.message })
    };
  }
};
