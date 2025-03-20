const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { sendLogMessage } = require("../../utils/logging.js"); // Pfad entsprechend anpassen
const moderationLogsPath = path.join(__dirname, '../../config/moderationLogs.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannt einen User vom Server.')
        .addUserOption(option => option.setName('user').setDescription('Der User, der gebannt werden soll.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Der Grund für den Bann.').setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return await interaction.editReply({ content: "❌ Du hast keine Berechtigung, Benutzer zu bannen." });
        }

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "Kein Grund angegeben";

        if (!user) return await interaction.editReply({ content: "❌ Benutzer nicht gefunden." });

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) return await interaction.editReply({ content: "❌ Der Benutzer ist nicht auf diesem Server." });

        try {
            // 📩 Embed für den User (DM)
            const dmEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("🚨 Du wurdest vom Server gebannt!")
                .setDescription(`Du wurdest vom Server **${interaction.guild.name}** gebannt.`)
                .addFields(
                    { name: "👮 Gebannt von:", value: `${interaction.user.tag}`, inline: true },
                    { name: "📜 Grund:", value: reason, inline: true }
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp();

            // 📩 Embed für den Server
            const serverEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("🚨 Benutzer wurde gebannt!")
                .setDescription(`Der Benutzer **${user.tag}** wurde vom Server gebannt.`)
                .addFields(
                    { name: "👮 Gebannt von:", value: `${interaction.user.tag}`, inline: true },
                    { name: "📜 Grund:", value: reason, inline: true }
                )
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            // ❌ Versuch, dem Benutzer eine DM zu senden
            try {
                await user.send({ embeds: [dmEmbed] });
                console.log(`✅ DM an ${user.tag} gesendet.`);
            } catch (error) {
                console.log(`⚠️ Konnte keine DM an ${user.tag} senden.`);
            }

            // 🔨 Benutzer bannen
            await member.ban({ reason });

            // 📂 In den Logs speichern
            logModerationAction(interaction.guild.id, user.id, "ban", interaction.user.tag, reason);

            // 📩 Nachricht im Server-Channel senden
            await interaction.channel.send({ embeds: [serverEmbed] });

            // ✅ Erfolgsmeldung im Chat
            await interaction.editReply({ content: `✅ **${user.tag}** wurde gebannt!`, ephemeral: true });

        } catch (error) {
            console.error("❌ Fehler beim Bannen:", error);
            await interaction.editReply({ content: "❌ Fehler beim Bannen des Benutzers." });
        }
    }
};