const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require("discord.js");

const moderationLogsPath = path.join(__dirname, '../config/moderationLogs.json');
const logSettingsPath = path.join(__dirname, '../config/logSettings.json');

function logModerationAction(guildId, userId, action, moderator, reason, client) {
    if (!fs.existsSync(moderationLogsPath)) {
        fs.writeFileSync(moderationLogsPath, JSON.stringify({}, null, 4));
    }

    const logs = JSON.parse(fs.readFileSync(moderationLogsPath, "utf8"));
    if (!logs[guildId]) logs[guildId] = [];

    const logEntry = {
        userId,
        action,
        moderator,
        reason,
        timestamp: new Date().toISOString()
    };

    logs[guildId].push(logEntry);
    fs.writeFileSync(moderationLogsPath, JSON.stringify(logs, null, 4));

    console.log(`✅ [LOG] ${action} für ${userId} von ${moderator}`);

    sendLogMessage(guildId, logEntry, client);
}

function sendLogMessage(guildId, logEntry, client) {
    if (!fs.existsSync(logSettingsPath)) return;

    const settings = JSON.parse(fs.readFileSync(logSettingsPath, 'utf8'));
    if (!settings[guildId] || !settings[guildId].logChannel) return;

    const logChannelId = settings[guildId].logChannel;
    const logChannel = client.channels.cache.get(logChannelId);

    if (!logChannel) {
        console.log(`⚠️ Log-Channel ${logChannelId} für ${guildId} nicht gefunden.`);
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(logEntry.action === "ban" ? "#ff0000" :
                  logEntry.action === "kick" ? "#ff9900" :
                  "#ffaa00")
        .setTitle(`⚡ Moderationsaktion: ${logEntry.action.toUpperCase()}`)
        .addFields(
            { name: "👤 Benutzer", value: logEntry.userId === "Mehrere Nachrichten" ? "----" : `<@${logEntry.userId}>`, inline: true },
            { name: "👮 Moderator", value: logEntry.moderator !== "Unbekannt" ? `<@${logEntry.moderator}>` : "Unbekannt", inline: true },
            { name: "📜 Grund", value: logEntry.reason, inline: false }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(console.error);
}

module.exports = { logModerationAction };