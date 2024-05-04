const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

let fetch;

(async () => {
  fetch = (await import("node-fetch")).default;
})();

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Serve the index.html file when a GET request is made to the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// // Replace 'YOUR_OPENAI_API_KEY' with your OpenAI API key
// const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";

// Read the OpenAI API key from the environment variables
const OPENAI_API_KEY = process.env.TERRA_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.");
  process.exit(1);
}

// Read the OpenAI model version from the environment variables
// Make sure to use a model that supports chat
const OPENAI_MODEL = process.env.TERRA_OPENAI_MODEL

if (!OPENAI_MODEL) {
  console.error("OpenAI model not found. Please set the OPENAI_MODEL environment variable.");
  process.exit(1);
}

app.post("/generate-trail", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorDetail = await response.json(); // Parsing JSON to get the detailed error message
      console.error("OpenAI response error:", errorDetail);
      throw new Error(`Error from OpenAI API: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("OpenAI API Response:", JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
