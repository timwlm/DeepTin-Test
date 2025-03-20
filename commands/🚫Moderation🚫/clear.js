const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { sendLogMessage } = require("../../utils/logging.js"); // Pfad entsprechend anpassen

console.log("logModerationAction:", typeof logModerationAction);
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Löscht eine bestimmte Anzahl von Nachrichten.')
        .addIntegerOption(option =>
            option.setName('anzahl')
                .setDescription('Anzahl der zu löschenden Nachrichten (max. 100)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

    async execute(interaction) {
        const amount = interaction.options.getInteger('anzahl');

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: "❌ Gib eine Zahl zwischen 1 und 100 an.", ephemeral: true });
        }

        try {
            // 📌 Lösche Nachrichten
            const deletedMessages = await interaction.channel.bulkDelete(amount, true);

            if (deletedMessages.size === 0) {
                return interaction.reply({ content: "⚠️ Es konnten keine Nachrichten gelöscht werden. (Sind sie älter als 14 Tage?)", ephemeral: true });
            }

            // ✅ Antwort an den Moderator senden
            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply({ content: `✅ ${deletedMessages.size} Nachrichten gelöscht.` });

            // 📩 Log-Nachricht senden
            sendLogMessage(interaction.guild.id, {
                userId: "-", // Benutzer ist irrelevant
                action: "clear",
                moderator: `<@${interaction.user.id}>`,  // Ping des Moderators
                reason: `${deletedMessages.size} Nachrichten gelöscht.`,
                timestamp: new Date().toISOString()
            }, interaction.client);

        } catch (error) {
            console.error(`❌ Fehler beim Löschen von Nachrichten:`, error);

            // 🔥 Falls ein Fehler auftritt (z.B. Nachrichten zu alt), sichere Antwort verhindern
            if (!interaction.replied) {
                await interaction.reply({ content: "❌ Fehler beim Löschen der Nachrichten.", ephemeral: true });
            }
        }
    }
};