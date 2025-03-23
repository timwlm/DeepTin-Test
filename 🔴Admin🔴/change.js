const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const botSettingsPath = path.join(__dirname, '../../config/botSettings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('change')
        .setDescription('Changes the bots nickname (only for this server).')
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('Enter a new nickname for the bot.')
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ You need Admin-Perms for this command.", ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const newNickname = interaction.options.getString('nickname');

        if (!newNickname) {
            return interaction.reply({ content: "❌ Please enter a nickname!", ephemeral: true });
        }

        let responseMessage = "";

        // **🌟 Ändere den Nickname nur auf diesem Server**
        try {
            await interaction.guild.members.me.setNickname(newNickname);
            responseMessage += `✅ Nickname got changed: **"${newNickname}"**\n`;

            // **🌟 Speichere die Änderung in der JSON-Datei**
            let settings = fs.existsSync(botSettingsPath) ? JSON.parse(fs.readFileSync(botSettingsPath, 'utf8')) : {};
            if (!settings[guildId]) settings[guildId] = {};
            settings[guildId].nickname = newNickname;
            fs.writeFileSync(botSettingsPath, JSON.stringify(settings, null, 4));

        } catch (error) {
            responseMessage += `❌ Error: ${error.message}\n`;
        }

        await interaction.reply({ content: responseMessage, ephemeral: true });
    }
};