const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const formData = JSON.parse(event.body);
    const { studentName, rollNumber, assignmentTitle, fileData, fileType } = formData;

    // Convert base64 file data to Buffer
    const fileBuffer = Buffer.from(fileData, "base64");
    const fileName = `${rollNumber}-${Date.now()}.${fileType}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("assignments").upload(fileName, fileBuffer, {
      contentType: `application/${fileType}`,
    });

    if (error) throw error;

    // Get the public URL
    const { data: urlData } = supabase.storage.from("assignments").getPublicUrl(fileName);
    const fileUrl = urlData.publicUrl;

    // Store file URL in Supabase Database
    const { error: dbError } = await supabase
      .from("assignments")
      .insert([{ studentName, rollNumber, assignmentTitle, fileUrl }]);

    if (dbError) throw dbError;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "File uploaded successfully", fileUrl }),
    };
  } catch (error) {
    console.error("Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
