const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { loadJSON, saveJSON } = require('../../utils/filemanager');
const { ticketSettingsPath } = require('../../utils/paths');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Set up the ticket system for your server.')
        .addStringOption(option =>
            option.setName('ticket-name')
                .setDescription('Name for the ticket panel.')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('Select the parent ticket category.')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('support-role')
                .setDescription('Select the support role.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('ticket-category')
                .setDescription('Ticket categories, separated by commas (e.g. "General, Support, Bug")')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('panel-gif')
                .setDescription('Specify the URL of the GIF for `/ticket`.')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('embed-gif')
                .setDescription('Specify the GIF URL for opened tickets and DMs.')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Hex code of the embed color (e.g. #0099ff).')
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ You need admin rights for this command!", ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const ticketName = interaction.options.getString('ticket-name');
        const category = interaction.options.getChannel('category');
        const supportRole = interaction.options.getRole('support-role');
        const ticketCategoriesInput = interaction.options.getString('ticket-category');
        const color = interaction.options.getString('color') || "#0099ff";
        const panelGif = interaction.options.getString('panel-gif') || "https://media.discordapp.net/attachments/1348969288001785897/1350616784461627483/Black_White_Blue_Neon_Flash_Digital_Opening_Video_Youtube_Intro_3.gif";
        const embedGif = interaction.options.getString('embed-gif') || panelGif;

        const ticketCategories = ticketCategoriesInput.split(",").map(cat => cat.trim()).filter(cat => cat.length > 0);

        if (ticketCategories.length === 0) {
            return interaction.reply({ content: "❌ Error: No valid ticket categories specified!", ephemeral: true });
        }

        const settings = loadJSON(ticketSettingsPath);
        settings[guildId] = {
            ticketName,
            categoryId: category.id,
            supportRoleId: supportRole.id,
            color,
            panelGif,
            embedGif,
            categories: ticketCategories.map(name => ({ name }))
        };

        saveJSON(ticketSettingsPath, settings);

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle("✅ Ticket-System configured!")
            .setDescription(`The Ticket-System **${ticketName}** has been successfully set up.`)
            .addFields(
                { name: "📂 Category", value: category.name, inline: true },
                { name: "🛠️ Support-Role", value: supportRole.toString(), inline: true },
                { name: "🎨 Color", value: color, inline: true },
                { name: "🎟️ Ticket-Category", value: ticketCategories.join(", "), inline: false }
            )
            .setImage(panelGif);

        await interaction.reply({ embeds: [embed] });
    }
};