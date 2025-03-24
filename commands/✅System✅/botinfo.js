const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Shows all Information about me.'),

    async execute(interaction) {
        // **Bot-Informationen**
        const totalCommands = interaction.client.commands.size;
        const owner = "lennard.son & truly.tim_"; // Ändere das auf deinen Namen
        const hosting = "Bero-Host"; // Falls du woanders hostest, ändere das
        const location = "Frankfurt a.M (Germany)"; // Server-Standort
        const language = "JavaScript (Node.js)";
        const functions = [
            "🪼 Ticket-System",
            "🪼 Security-System",
            "🪼 Moderation-Tools",
            "🪼 Music-Features",
            "🪼 Admin-Features",
            "🪼 Help-Commands",
            "🪼 Utility-Commands",
            "🪼 Fun-Commands"
        ].join("\n");

        // **Embed erstellen**
        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🐬 Bot-Information 🐬")
            .setDescription("**🐳Here is some information from DeepTin🐳**")
            .addFields(
                { name: "👨‍💻 Made by", value: owner, inline: true },
                { name: "💻 Hosting", value: hosting, inline: true },
                { name: "📍 Location", value: location, inline: true },
                { name: "🛠 Function", value: functions, inline: false },
                { name: "📌 Programming language", value: language, inline: true }
            )
            .setImage("https://media.discordapp.net/attachments/1348969288001785897/1350583701666267176/Black_White_Blue_Neon_Flash_Digital_Opening_Video_Youtube_Intro_2.gif?ex=67d7ed57&is=67d69bd7&hm=e2d9b938bda65461f71ff56dc169bce620d0338dc0dccbd38cae4271a1e99a80&=&width=2063&height=1160") // Dein GIF unten im Embed
            .setFooter({ text: "DeepTin | Bot-Info", iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};