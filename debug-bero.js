const fs = require('fs');
const { ticketSettingsPath } = require('./utils/paths');

console.log("Current Working Directory:", process.cwd());
console.log("ticketSettingsPath:", ticketSettingsPath);

if (!fs.existsSync(ticketSettingsPath)) {
    console.log("❌ Datei existiert NICHT!");
} else {
    console.log("✅ Datei gefunden!");
    const content = fs.readFileSync(ticketSettingsPath, 'utf8');
    console.log("📂 Inhalt:", content);
}