const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { loadJSON, saveJSON } = require('../../utils/filemanager');
const { jtcSettingsPath } = require('../../utils/paths');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jtc')
        .setDescription('Sets the join-to-create channel for the server.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Choose the JTC-Channel')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ You need admin rights for this command!", ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const selectedChannel = interaction.options.getChannel('channel');

        if (!selectedChannel || selectedChannel.type !== ChannelType.GuildVoice) {
            return interaction.reply({ content: "❌ Please select a valid voice channel!", ephemeral: true });
        }

        const settings = loadJSON(jtcSettingsPath);
        settings[guildId] = {
            jtcChannelId: selectedChannel.id,
            activeCalls: {}
        };

        saveJSON(jtcSettingsPath, settings);

        return interaction.reply({ content: `✅ The JTC channel has been set to <#${selectedChannel.id}>!`, ephemeral: false });
    }
};