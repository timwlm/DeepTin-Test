const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const moderationLogsPath = path.join(__dirname, '../../config/moderationLogs.json');

// 📌 Funktion zum Speichern der Moderationsaktion
function logModerationAction(guildId, userId, action, moderator, reason) {
    const moderationLogs = fs.existsSync(moderationLogsPath)
        ? JSON.parse(fs.readFileSync(moderationLogsPath, "utf8"))
        : {};

    if (!moderationLogs[guildId]) {
        moderationLogs[guildId] = [];
    }

    const logEntry = {
        userId: userId,
        action: action,
        moderator: moderator,
        reason: reason,
        timestamp: new Date().toISOString()
    };

    moderationLogs[guildId].push(logEntry);
    fs.writeFileSync(moderationLogsPath, JSON.stringify(moderationLogs, null, 4));
    console.log(`✅ [LOG] ${action} durch ${moderator}`);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Deletes a specified number of messages from the current channel.')
        .addIntegerOption(option => 
            option.setName('number')
                .setDescription('The number of messages to be deleted (max. 100)')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const amount = interaction.options.getInteger('number');
        if (amount < 1 || amount > 100) {
            return await interaction.editReply({ content: "❌ You can only delete between 1 and 100 messages!", ephemeral: true });
        }

        try {
            await interaction.channel.bulkDelete(amount, true);
            logModerationAction(interaction.guild.id, interaction.user.id, "clear", interaction.user.tag, `Deleted ${amount} messages`);

            await interaction.editReply({ content: `✅ **${amount}** messages deleted.`, ephemeral: true });

        } catch (error) {
            console.error("❌ Error deleting messages", error);
            await interaction.editReply({ content: "❌ Error!", ephemeral: true });
        }
    },
};