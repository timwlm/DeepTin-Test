const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Us if you wanna invite our bot.'),

    async execute(interaction) {
        const botId = interaction.client.user.id; // Holt die Bot-ID

        // Einladung mit Administrator-Rechten
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot%20applications.commands`;

        // 📜 Embed für den Invite-Link
        const inviteEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🔗 Invite me')
            .setDescription(`[🪼 Click here](${inviteLink})\n\n**⚓I need Admin-Perms to fully function!⚓**`)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Best greetings Lenny & Timi 🚀' })
            .setImage("https://cdn.discordapp.com/attachments/1350234746395037787/1351145105620209664/DeepTinSES.gif?ex=67d94f70&is=67d7fdf0&hm=aebe3d5b5be805cd46d33277765e7fd72a61b341b40071756c03178181a3e189&"); // Dein GIF unten im Embed

        await interaction.reply({ embeds: [inviteEmbed], ephemeral: false }); // Für alle sichtbar
    },
};