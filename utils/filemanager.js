const fs = require('fs');
const path = require('path');

function loadJSON(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 4));
        console.log(`📂 Datei erstellt: ${filePath}`);
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`❌ Fehler beim Laden von ${filePath}:`, error);
        return {};
    }
}

function saveJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error(`❌ Fehler beim Speichern von ${filePath}:`, error);
    }
}

function deleteGuildData(filePath, guildId) {
    const data = loadJSON(filePath);
    if (data[guildId]) {
        delete data[guildId];
        saveJSON(filePath, data);
        console.log(`🗑️ Daten für Guild ${guildId} aus ${path.basename(filePath)} entfernt.`);
    }
}

function startServerInfoScheduler(client, guildId, channelId) {
    setInterval(async () => {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(channelId);
        if (!channel) return;

        try {
            const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle("📊 Serverinfo")
                .setDescription(`**Mitglieder:** ${guild.memberCount}\n**Name:** ${guild.name}`)
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`❌ Fehler beim Senden der Serverinfo in ${guild.name}:`, error);
        }
    }, 60_000); // 60.000ms = 1 Minute
}

module.exports = { loadJSON, saveJSON, deleteGuildData };