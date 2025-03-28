const { BlobServiceClient } = require("@azure/storage-blob");
const sql = require("mssql");

exports.handler = async (event) => {
  try {
    // Check for POST method
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Parse form-data
    const formData = JSON.parse(event.body);
    const { studentName, rollNumber, assignmentTitle, assignmentDesc, submissionDateTime, fileType } = formData;
    
    // Azure Blob Storage Configuration
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = "assignments";
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Generate unique filename
    const fileName = `${rollNumber}-${Date.now()}.pdf`;  // Change extension as needed
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Upload file to Blob Storage
    const fileBuffer = Buffer.from(formData.assignmentFile, "base64");
    await blockBlobClient.uploadData(fileBuffer);

    // Get file URL
    const fileUrl = blockBlobClient.url;

    // Azure SQL Connection
    const pool = await sql.connect({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      options: { encrypt: true }
    });

    // Insert record into Azure SQL Database
    await pool.request()
      .input("studentName", sql.VarChar, studentName)
      .input("rollNumber", sql.VarChar, rollNumber)
      .input("assignmentTitle", sql.VarChar, assignmentTitle)
      .input("assignmentDesc", sql.VarChar, assignmentDesc)
      .input("submissionDateTime", sql.DateTime, submissionDateTime)
      .input("fileType", sql.VarChar, fileType)
      .input("fileUrl", sql.VarChar, fileUrl)
      .query(`
        INSERT INTO Assignments (StudentName, RollNumber, AssignmentTitle, AssignmentDesc, SubmissionDateTime, FileType, FileUrl)
        VALUES (@studentName, @rollNumber, @assignmentTitle, @assignmentDesc, @submissionDateTime, @fileType, @fileUrl)
      `);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Assignment uploaded successfully!", fileUrl })
    };
  } catch (error) {
    console.error("Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};
const { BlobServiceClient } = require("@azure/storage-blob");
const sql = require("mssql");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Azure Blob Storage setup
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!AZURE_STORAGE_CONNECTION_STRING) throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING");

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient("assignments");

    // Upload file (Simulating for now, since file isn't passed in event.body)
    const blobName = `assignment_${Date.now()}.txt`; 
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload("Sample file content", "Sample file content".length);

    const downloadUrl = blockBlobClient.url; // This is the file link

    // Azure SQL setup
    const sqlConfig = {
      user: process.env.AZURE_SQL_USER,
      password: process.env.AZURE_SQL_PASSWORD,
      server: process.env.AZURE_SQL_SERVER,
      database: process.env.AZURE_SQL_DATABASE,
      options: { encrypt: true, trustServerCertificate: false }
    };

    if (!sqlConfig.user || !sqlConfig.password || !sqlConfig.server || !sqlConfig.database) {
      throw new Error("Missing Azure SQL Environment Variables");
    }

    await sql.connect(sqlConfig);
    await sql.query`INSERT INTO Assignments (StudentID, FileURL) VALUES (${body.studentId}, ${downloadUrl})`;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "File uploaded successfully", fileUrl: downloadUrl }),
    };

  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
