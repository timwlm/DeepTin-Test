const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows latency of the bot.'),
    async execute(interaction) {
        await interaction.reply({ content: `🏓 Hii! Latenz: ${interaction.client.ws.ping}ms`, ephemeral: false });
        },
};