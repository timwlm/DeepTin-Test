const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../config/jtcSettings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jtc')
        .setDescription('Sets the join-to-create channel for the server.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Choose the JTC-Channel')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ You need admin rights for this command!", ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const selectedChannel = interaction.options.getChannel('channel');

        if (!selectedChannel || selectedChannel.type !== 2) {
            return interaction.reply({ content: "❌ Please select a valid voice channel!", ephemeral: true });
        }

        // **Lese vorhandene Einstellungen oder erstelle neue**
        const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};

        settings[guildId] = {
            jtcChannelId: selectedChannel.id,
            activeCalls: {} // Leere aktive Calls
        };

        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));

        return interaction.reply({ content: `✅ The JTC channel has been set to <#${selectedChannel.id}>!`, ephemeral: false });
    }
};