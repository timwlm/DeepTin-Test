const fs = require('fs');
const { autoroleSettingsPath } = require('./paths');

// Autorole-Datei automatisch erstellen, falls sie fehlt
if (!fs.existsSync(autoroleSettingsPath)) {
    fs.mkdirSync(require('path').dirname(autoroleSettingsPath), { recursive: true });
    fs.writeFileSync(autoroleSettingsPath, JSON.stringify({}, null, 4));
    console.log(`📂 autoroleSettings.json wurde erstellt.`);
}

function loadJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`📂 Datei nicht gefunden, erstelle neue: ${filePath}`);
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