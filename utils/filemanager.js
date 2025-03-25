const fs = require('fs');
const path = require('path');
const {
    autoroleSettingsPath,
    ticketSettingsPath,
    jtcSettingsPath,
    welcomeSettingsPath,
    serverInfoPath,
    moderationLogsPath,
    botSettingsPath,
    configDir
} = require('./paths');

// 📁 Stelle sicher, dass das config-Verzeichnis existiert
if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    console.log("📁 Ordner 'data/config' wurde erstellt.");
}

// ✅ JSON-Dateien bei Bedarf automatisch erstellen
[
    autoroleSettingsPath,
    ticketSettingsPath,
    jtcSettingsPath,
    welcomeSettingsPath,
    serverInfoPath,
    moderationLogsPath,
    botSettingsPath
].forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 4));
        console.log(`📂 Datei erstellt: ${filePath}`);
    }
});

function loadJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`📂 Datei nicht gefunden, erstelle neu: ${filePath}`);
            fs.writeFileSync(filePath, JSON.stringify({}, null, 4));
        }

        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`❌ Fehler beim Laden der Datei: ${filePath}`, err);
        return {};
    }
}

function saveJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        console.log(`✅ JSON gespeichert: ${filePath}`);
    } catch (err) {
        console.error(`❌ Fehler beim Speichern der Datei: ${filePath}`, err);
    }
}

function deleteGuildData(filePath, guildId) {
    if (!fs.existsSync(filePath)) return;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (data[guildId]) {
        delete data[guildId];
        saveJSON(filePath, data);
        console.log(`🗑️ Daten für Guild ${guildId} aus ${filePath} entfernt.`);
    }
}

module.exports = {
    loadJSON,
    saveJSON,
    deleteGuildData
};