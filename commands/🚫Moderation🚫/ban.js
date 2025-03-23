const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user you wanna ban.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban.')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || "No Reason mentioned.";
        const member = await interaction.guild.members.fetch(targetUser.id);
        const moderator = interaction.user; // Der ausführende Nutzer
        const banDate = new Date().toLocaleString(); // Datum des Banns

        // 📌 Überprüfen, ob der ausführende Nutzer Bannrechte hat
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return await interaction.reply({ content: "❌ You dont have the permisson to ban a user.", ephemeral: true });
        }

        // 📌 Überprüfen, ob der Bot Bannrechte hat
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return await interaction.reply({ content: "❌ I dont have the permission to ban a user.", ephemeral: true });
        }

        // 📌 Überprüfen, ob der Nutzer bannbar ist (nicht Admin oder höher als der Bot)
        if (!member.bannable) {
            return await interaction.reply({ content: "❌ I cant ban this user. This user is above me.", ephemeral: true });
        }

        // 📌 Erstelle den DM-Ban-Embed
        const dmEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("🚫 You were banned. How silly!")
            .setDescription(`You were banned by the admin **${interaction.guild.name}**.`)
            .addFields(
                { name: "📅 Date", value: banDate, inline: true },
                { name: "👤 Banned by", value: `${moderator.tag}`, inline: true },
                { name: "📌 Reason", value: reason, inline: false }
            )
            .setFooter({ text: "Please contact a moderator if you have any questions." });

        try {
            // 📌 Sende eine DM an den gebannten Nutzer
            await targetUser.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.error("⚠️ I cant send a DM to the user.", error);
        }

        try {
            // 📌 Ban den Nutzer
            await member.ban({ reason });

            // 📌 Erstelle den Ban-Embed für den Server
            const banEmbed = new EmbedBuilder()
                .setColor(0xbb0505)
                .setTitle("✅ User banned!")
                .setDescription(`**${targetUser.tag}** were finally banned.`)
                .addFields(
                    { name: "📅 Date", value: banDate, inline: true },
                    { name: "👤 Banned by", value: `${moderator.tag}`, inline: true },
                    { name: "📌 Reason:", value: reason, inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                
                // Image bearbeiten
                .setFooter({ text: "Made by Lenny & Timi", iconURL: interaction.guild.iconURL() });

            // 📌 Antworte mit dem Embed im Channel
            await interaction.reply({ embeds: [banEmbed] });

        } catch (error) {
            console.error("❌ Error:", error);
            await interaction.reply({ content: "❌ Error during banning the user.", ephemeral: true });
        }
    },
};