const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const moderationLogsPath = path.join(__dirname, '../../config/moderationLogs.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kickt einen User vom Server.')
        .addUserOption(option => option.setName('user').setDescription('Der User, der gekickt werden soll.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Der Grund für den Kick.').setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return await interaction.editReply({ content: "❌ Du hast keine Berechtigung, Benutzer zu kicken." });
        }

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "Kein Grund angegeben";

        if (!user) return await interaction.editReply({ content: "❌ Benutzer nicht gefunden." });

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) return await interaction.editReply({ content: "❌ Der Benutzer ist nicht auf diesem Server." });

        try {
            // 📩 Embed für den Server
            const serverEmbed = new EmbedBuilder()
                .setColor("#ff9900")
                .setTitle("🚪 Benutzer wurde gekickt!")
                .setDescription(`Der Benutzer **${user.tag}** wurde vom Server entfernt.`)
                .addFields(
                    { name: "👮 Gekickt von:", value: `${interaction.user.tag}`, inline: true },
                    { name: "📜 Grund:", value: reason, inline: true }
                )
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            // 🔨 Benutzer kicken
            await member.kick(reason);

            // 📂 In den Logs speichern
            logModerationAction(interaction.guild.id, user.id, "kick", interaction.user.tag, reason);

            // 📩 Nachricht im Server-Channel senden
            await interaction.channel.send({ embeds: [serverEmbed] });

            // ✅ Erfolgsmeldung im Chat
            await interaction.editReply({ content: `✅ **${user.tag}** wurde gekickt!`, ephemeral: true });

        } catch (error) {
            console.error("❌ Fehler beim Kicken:", error);
            await interaction.editReply({ content: "❌ Fehler beim Kicken des Benutzers." });
        }
    }
};

// 📌 Funktion zur Speicherung der Logs
function logModerationAction(guildId, userId, action, moderator, reason) {
    const logs = fs.existsSync(moderationLogsPath) ? JSON.parse(fs.readFileSync(moderationLogsPath, "utf8")) : {};

    if (!logs[guildId]) logs[guildId] = [];

    logs[guildId].push({
        userId: userId,
        action: action,
        moderator: moderator,
        reason: reason,
        timestamp: new Date().toISOString()
    });

    fs.writeFileSync(moderationLogsPath, JSON.stringify(logs, null, 4));
    console.log(`✅ [LOG] ${action} für User ${userId} durch ${moderator}`);
}