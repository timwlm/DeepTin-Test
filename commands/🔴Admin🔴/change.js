const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { loadJSON, saveJSON } = require('../../utils/filemanager');
const { botSettingsPath } = require('../../utils/paths');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('change')
        .setDescription('Changes the bot\'s nickname (only for this server).')
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('Enter a new nickname for the bot.')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ You need Admin-Perms for this command.", ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const newNickname = interaction.options.getString('nickname');
        let responseMessage = "";

        try {
            await interaction.guild.members.me.setNickname(newNickname);
            responseMessage += `✅ Nickname changed to: **"${newNickname}"**\n`;

            const settings = loadJSON(botSettingsPath);
            if (!settings[guildId]) settings[guildId] = {};
            settings[guildId].nickname = newNickname;
            saveJSON(botSettingsPath, settings);

        } catch (error) {
            responseMessage += `❌ Error: ${error.message}`;
        }

        await interaction.reply({ content: responseMessage, ephemeral: true });
    }
};