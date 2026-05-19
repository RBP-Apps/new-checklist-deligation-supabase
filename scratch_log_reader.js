const fs = require('fs');
const logPath = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\b4c7e92d-5a4a-4e8a-ad9d-f95524717788\\.system_generated\\logs\\overview.txt';
try {
    const raw = fs.readFileSync(logPath, 'utf8');
    const firstLine = raw.split('\n')[0];
    const data = JSON.parse(firstLine);
    console.log("=== ORIGINAL USER REQUEST ===");
    console.log(data.content);
    fs.writeFileSync('C:\\Users\\pc\\Desktop\\botivate\\brpind_checklist\\scratch_original_schema.sql', data.content);
    console.log("=== WRITTEN TO scratch_original_schema.sql ===");
} catch (e) {
    console.error("Error reading log:", e);
}
