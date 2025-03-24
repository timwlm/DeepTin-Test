const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all Features.'),

    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("🐬 DeepTin Commands")
            .setDescription("🐳Here is a list of all my Commands🐳\n\n**🐙 Current Commands:**")
            .addFields(
                { name: "♻️ **Help**", value: "`/invite`; `/help`", inline: false },
                { name: "⚡ **System**", value: "`/botinfo`; `/ping`", inline: false },
                { name: "👤 **Utility**", value: "`/say`", inline: false },
                { name: "🛠 **Server**", value: "`/jtc`; `/ticket`; `/ticket-setup`; `/welcome`; `/serverinfo`; `/serverinfo-schedular`", inline: false },
                { name: "🚫 **Moderation**", value: " `/ban`; `/kick`; `/unban`; `/clear`; `/change`; `/autorole`", inline: false }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL()) // Setzt das Bot-Profilbild oben rechts
            .setFooter({ text: "Made by the best Developers", iconURL: interaction.client.user.displayAvatarURL() }) // Footer-Text mit Icon
            .setImage("https://media.discordapp.net/attachments/1348969288001785897/1350580634128748586/Black_White_Blue_Neon_Flash_Digital_Opening_Video_Youtube_Intro.gif?ex=67d7ea7b&is=67d698fb&hm=ea9714cb1abf0e6eadf15bf0d1cc8c3e460d3277a4682fb5b3bed0643ce85751&=&width=2063&height=1160"); // Dein GIF unten im Embed

        await interaction.reply({ embeds: [helpEmbed], ephemeral: false });
    }
};