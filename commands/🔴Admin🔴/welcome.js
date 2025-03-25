const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { welcomeSettingsPath } = require('../../utils/paths');
const { loadJSON, saveJSON } = require('../../utils/filemanager');

const DEFAULT_GIF = "https://cdn.discordapp.com/attachments/1348390411349131325/1351516940664963153/welcome.gif";
const DEFAULT_WELCOME_TEXT = `🦈Hey {member}, schön dass du auf unserem Server gelandet bist, wir hoffen du hast viel Spaß🐳! 🎊
📜 **Regeln:** Lese dir bitte die Regeln durch und beachte sie.
✅ **Fragen:** Falls du Fragen hast, wende dich gerne an das Team🌊!`;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-setup')
        .setDescription('Configure the welcome text and GIF for new members.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel in which the welcome message is sent.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('gif')
                .setDescription('Add a URL to a custom GIF.')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Customize the welcome message. (Use {member} for the name.)')
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ You need Admin-Perms for this command.", ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const channel = interaction.options.getChannel('channel');
        const gif = interaction.options.getString('gif');
        const text = interaction.options.getString('text');

        const settings = loadJSON(welcomeSettingsPath);

        settings[guildId] = {
            welcomeChannelId: channel.id,
            welcomeGif: gif || DEFAULT_GIF,
            welcomeText: text || DEFAULT_WELCOME_TEXT
        };

        saveJSON(welcomeSettingsPath, settings);

        const embed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("✅ Welcome setup configured")
            .setDescription(`New members will be welcomed in <#${channel.id}>.`)
            .addFields(
                { name: "📜 Welcome Text", value: text || "Standard", inline: false },
                { name: "🖼️ GIF", value: gif || "Standard", inline: false }
            );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};