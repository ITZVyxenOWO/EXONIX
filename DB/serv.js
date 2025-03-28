const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json()); // Parse JSON requests
app.use(express.static('public')); // Serve static files (e.g., your frontend)

const JSON_PATH = "./data/Volume1.json"; // Path to your JSON file

// Read JSON file
function readJsonFile() {
    try {
        const data = fs.readFileSync(JSON_PATH);
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading JSON file:", error);
        return {};
    }
}

// Write to the JSON file
function writeJsonFile(data) {
    try {
        fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error("Error writing JSON file:", error);
    }
}

// Endpoint to get the current data (to fetch mods, blogs, etc.)
app.get("/api/data", (req, res) => {
    const data = readJsonFile();
    res.json(data);
});

// Endpoint to add a mod to the JSON
app.post("/api/add-mod", (req, res) => {
    const { mod } = req.body;
    if (!mod) return res.status(400).json({ message: "Mod data is required" });

    const data = readJsonFile();
    const mods = data.mods || [];
    mods.push(mod);
    data.mods = mods;

    writeJsonFile(data);

    res.json({ message: "Mod added successfully", mod });
});

// Endpoint to add a blog post to the JSON
app.post("/api/add-blog", (req, res) => {
    const { blog } = req.body;
    if (!blog) return res.status(400).json({ message: "Blog data is required" });

    const data = readJsonFile();
    const blogPosts = data.blogPosts || {};
    blogPosts[blog.id] = blog;
    data.blogPosts = blogPosts;

    writeJsonFile(data);

    res.json({ message: "Blog post added successfully", blog });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
