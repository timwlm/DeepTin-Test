const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../config/ticketSettings.json');

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
        const panelGif = interaction.options.getString('panel-gif') || "https://media.discordapp.net/attachments/1348969288001785897/1350616784461627483/Black_White_Blue_Neon_Flash_Digital_Opening_Video_Youtube_Intro_3.gif?ex=67d95da6&is=67d80c26&hm=299f79de59d12a455dd73753ff61cf5ec998c86ff9e528cb511766b429e728a3&width=688&height=386&"; // Standardwert für `/ticket`
        const embedGif = interaction.options.getString('embed-gif') || "https://media.discordapp.net/attachments/1348969288001785897/1350616784461627483/Black_White_Blue_Neon_Flash_Digital_Opening_Video_Youtube_Intro_3.gif?ex=67d95da6&is=67d80c26&hm=299f79de59d12a455dd73753ff61cf5ec998c86ff9e528cb511766b429e728a3&width=688&height=386&"; // Standardwert für geöffnete Tickets & DMs

        const ticketCategories = ticketCategoriesInput.split(",").map(cat => cat.trim()).filter(cat => cat.length > 0);

        if (ticketCategories.length === 0) {
            return interaction.reply({ content: "❌ Error: No valid ticket categories specified!", ephemeral: true });
        }

        const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};

        settings[guildId] = {
            ticketName,
            categoryId: category.id,
            supportRoleId: supportRole.id,
            color,
            panelGif,  // ✅ GIF für `/ticket`
            embedGif,  // ✅ GIF für geöffnete Tickets & DMs
            categories: ticketCategories.map(name => ({ name }))
        };

        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));

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
            .setImage(panelGif); // ✅ Zeigt das `/ticket` GIF in der Bestätigung

        await interaction.reply({ embeds: [embed] });
    }
};