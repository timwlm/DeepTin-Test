const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Deletes a specified number of messages from the current channel.')
        .addIntegerOption(option => 
            option.setName('number')
                .setDescription('The number of messages to be deleted (max. 100)')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return await interaction.reply({ content: "❌ You do not have permission to delete messages!", ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return await interaction.reply({ content: "❌ You do not have permission to delete messages!", ephemeral: true });
        }

        const amount = interaction.options.getInteger('number');

        if (amount < 1 || amount > 100) {
            return await interaction.reply({ content: "❌ You can only delete between 1 and 100 messages at a time!", ephemeral: true });
        }

        try {
            // Interaktion sofort bestätigen, um Discords 3-Sekunden-Limit zu umgehen
            await interaction.deferReply({ ephemeral: true });

            // Nachrichten löschen
            await interaction.channel.bulkDelete(amount, true);

            // Erfolgsmeldung senden
            const msg = await interaction.channel.send(`✅ **${amount}** messages were deleted.`);
            
            setTimeout(() => msg.delete().catch(() => {}), 5000); // Nachricht nach 5 Sekunden löschen

            // Interaktion bearbeiten, damit Discord nicht die Fehlermeldung anzeigt
            await interaction.editReply({ content: `✅ **${amount}**Messages were successfully deleted.`, ephemeral: true });

        } catch (error) {
            console.error("❌ Error deleting messages", error);
            await interaction.editReply({ content: "❌ Error!", ephemeral: true });
        }
    },
};