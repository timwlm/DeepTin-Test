const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const welcomeSettingsPath = path.join(__dirname, '../../config/welcomeSettings.json');

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

        console.log(`✅ /welcome-setup done! Channel: ${channel.name} (${channel.id}), GIF: ${gif || "Standard"}, Text: ${text || "Standard"}`);

        const settings = fs.existsSync(welcomeSettingsPath) ? JSON.parse(fs.readFileSync(welcomeSettingsPath, 'utf8')) : {};

        settings[guildId] = {
            welcomeChannelId: channel.id,
            welcomeGif: gif || settings[guildId]?.welcomeGif || DEFAULT_GIF,
            welcomeText: text || settings[guildId]?.welcomeText || DEFAULT_WELCOME_TEXT
        };

        fs.writeFileSync(welcomeSettingsPath, JSON.stringify(settings, null, 4));

        const embed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("✅ Welcomesetup changed")
            .setDescription(`New Member will be welcomed in <#${channel.id}> .`)
            .addFields(
                { name: "📜 Welcometext", value: text || "Standard", inline: false },
                { name: "🖼️ GIF", value: gif || "Standard", inline: false }
            );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};