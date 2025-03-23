const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user you wanna kick.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick.')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || "No reason mentioned!";
        const member = await interaction.guild.members.fetch(targetUser.id);
        const moderator = interaction.user; // Der ausführende Nutzer
        const kickDate = new Date().toLocaleString(); // Datum des Kicks

        // 📌 Überprüfen, ob der ausführende Nutzer Kickrechte hat
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return await interaction.reply({ content: "❌ You do not have permission to kick users!", ephemeral: true });
        }

        // 📌 Überprüfen, ob der Bot Kickrechte hat
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return await interaction.reply({ content: "❌ I don't have permission to kick users!", ephemeral: true });
        }

        // 📌 Überprüfen, ob der Nutzer kickbar ist (nicht Admin oder höher als der Bot)
        if (!member.kickable) {
            return await interaction.reply({ content: "❌ I can't kick this user! He has a higher role than me.", ephemeral: true });
        }

        // 📌 Erstelle den DM-Kick-Embed
        const dmEmbed = new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle("🚪 You werw kicked!")
            .setDescription(`You were kicked by the admin **${interaction.guild.name}** .`)
            .addFields(
                { name: "📅 Date", value: kickDate, inline: true },
                { name: "👤 Kicked by", value: `${moderator.tag}`, inline: true },
                { name: "📌 Reason", value: reason, inline: false }
            )
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            
            // Image bearbeiten
            .setFooter({ text: "Contact a moderator if you have any questions." });

        try {
            // 📌 Sende eine DM an den gekickten Nutzer
            await targetUser.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.error("⚠️ Couldn't send a DM to the user.", error);
        }

        try {
            // 📌 Kick den Nutzer
            await member.kick(reason);

            // 📌 Erstelle den Kick-Embed für den Server
            const kickEmbed = new EmbedBuilder()
                .setColor(0xffa500)
                .setTitle("✅ Nutzer gekickt!")
                .setDescription(`**${targetUser.tag}** were finally kicked.`)
                .addFields(
                    { name: "📅 Date", value: kickDate, inline: true },
                    { name: "👤 Kicked by", value: `${moderator.tag}`, inline: true },
                    { name: "📌 Reason", value: reason, inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))

                // Image bearbeiten
                .setFooter({ text: "Made by Lenny & Timi", iconURL: interaction.guild.iconURL() });

            // 📌 Antworte mit dem Embed im Channel
            await interaction.reply({ embeds: [kickEmbed] });

        } catch (error) {
            console.error("❌ Error during the kick:", error);
            await interaction.reply({ content: "❌ Error during kicking the user!", ephemeral: true });
        }
    },
};