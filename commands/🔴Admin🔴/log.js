const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const logSettingsPath = path.join(__dirname, 'config/logSettings.json'); // 🔥 Log-Settings für /logs
const moderationLogsPath = path.join(__dirname, '../../config/moderationLogs.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Setzt den aktuellen Kanal als Log-Channel für Moderationsaktionen.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const channelId = interaction.channel.id;

        // 📂 JSON-Datei einlesen oder erstellen
        let settings = {};
        if (fs.existsSync(logSettingsPath)) {
            settings = JSON.parse(fs.readFileSync(logSettingsPath, 'utf8'));
        }

        // 📝 Speichere den Log-Channel für den Server
        settings[guildId] = { logChannel: channelId };
        fs.writeFileSync(logSettingsPath, JSON.stringify(settings, null, 4));

        // ✅ Bestätigung für den User
        const embed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("✅ Log-Channel gesetzt!")
            .setDescription(`Alle Moderationslogs werden nun in <#${channelId}> gesendet.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

// 📌 Funktion zum Senden der Logs
function sendLogMessage(guildId, logEntry, client) {
    if (!fs.existsSync(logSettingsPath)) return; // ❗ Korrektur: logSettingsPath statt logSettingsPath

    const settings = JSON.parse(fs.readFileSync(loglogSettingsPath, 'utf8'));
    if (!settings[guildId] || !settings[guildId].logChannel) return;

    const logChannelId = settings[guildId].logChannel;
    const logChannel = client.channels.cache.get(logChannelId);

    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setColor(logEntry.action === "ban" ? "#ff0000" : "#ff9900")
        .setTitle(`⚡ Moderationsaktion: ${logEntry.action.toUpperCase()}`)
        .addFields(
            { name: "👤 Benutzer", value: `<@${logEntry.userId}>`, inline: true },
            { name: "👮 Moderator", value: logEntry.moderator, inline: true },
            { name: "📜 Grund", value: logEntry.reason, inline: false }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] })
        .catch(error => console.error(`❌ Fehler beim Senden des Log-Embeds:`, error));
}