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
