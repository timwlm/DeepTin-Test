const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../config/ticketSettings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Show the ticket-panel.'),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        if (!fs.existsSync(settingsPath)) {
            return interaction.reply({ content: "⚠️ /ticket-setup is not setted.", ephemeral: true });
        }

        const settingsData = fs.readFileSync(settingsPath);
        const settings = JSON.parse(settingsData);

        if (!settings[guildId] || !settings[guildId].categories || settings[guildId].categories.length === 0) {
            return interaction.reply({ content: "⚠️ This category is not existing.", ephemeral: true });
        }

        const { ticketName, color, panelGif, categories } = settings[guildId];

        const embed = new EmbedBuilder()
            .setColor(color || "#0099ff")
            .setTitle(ticketName || "🎫 Ticket-System")
            .setDescription(
                "**Select a category to create a ticket.**\n\n" +
                "Do you need help or have questions?\n" +
                "Then feel free to create a ticket and you'll be helped as quickly as possible.\n\n" +
                "Select a category from the dropdown menu below to open a ticket.\n\n" +
                "----------------------------------------------------------\n\n" +
                "**Wähle eine Kategorie, um ein Ticket zu erstellen.**\n\n" +
                "Brauchst du Hilfe oder hast du Fragen?\n" +
                "Dann erstelle gerne ein Ticket und dir wird so schnell wie möglich geholfen.\n\n" +
                "Wähle eine Kategorie aus dem Dropdown-Menü unten, um ein Ticket zu eröffnen."
            )
            .setImage(panelGif) // ✅ Hier wird das `/ticket` GIF genutzt
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("ticket_select")
            .setPlaceholder("🎟️ Choose a Ticket-Category")
            .addOptions(
                categories.slice(0, 25).map((ticket, index) => ({
                    label: ticket.name.slice(0, 100),
                    value: `ticket_${index}`
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};