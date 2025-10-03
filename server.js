const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json());

const GITHUB_TOKEN = "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"; // your token
const REPO = "adamowaissi22-boop/Axopo-Hub";
const FILE_PATH = "data.json";
const BRANCH = "main";

async function getData() {
    const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
    const res = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
    const json = await res.json();
    const content = Buffer.from(json.content, 'base64').toString('utf8');
    return { data: JSON.parse(content), sha: json.sha };
}

async function updateData(newData, sha) {
    const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;
    const content = Buffer.from(JSON.stringify(newData, null, 2)).toString('base64');
    await fetch(url, {
        method: "PUT",
        headers: { Authorization: `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            message: "Update scripts from hub",
            content: content,
            sha: sha,
            branch: BRANCH
        })
    });
}

app.get("/scripts", async (req, res) => {
    const { data } = await getData();
    res.json(data);
});

app.post("/upload", async (req, res) => {
    const { Title, Script, Description, Publisher } = req.body;
    if (!Title || !Script || !Description || !Publisher) return res.status(400).send("Missing fields");

    const { data, sha } = await getData();
    data.push({ Title, Script, Description, Publisher, Date: new Date().toISOString() });
    await updateData(data, sha);
    res.send({ success: true });
});

app.listen(3000, () => console.log("Axopo Hub Backend running on port 3000"));
