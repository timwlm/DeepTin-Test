const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user from the server and sends them a new invitation.')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('The ID of the user to be unbanned.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Image URL for the notification.')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply(); // Antwortverzögerung, um Fehler zu vermeiden

        const userId = interaction.options.getString('userid');
        const imageUrl = interaction.options.getString('image') || null;
        const guild = interaction.guild;

        // 📌 Überprüfe Berechtigungen
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.editReply({ content: "❌ You do not have permission to unban users!", ephemeral: true });
        }

        if (!guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.editReply({ content: "❌ I don't have permission to unban users!", ephemeral: true });
        }

        try {
            // 📌 Prüfe, ob der Nutzer tatsächlich gebannt ist
            const banList = await guild.bans.fetch();
            const bannedUser = banList.get(userId);

            if (!bannedUser) {
                return interaction.editReply({ content: "❌ This user is not banned or the ID is incorrect!", ephemeral: true });
            }

            // ✅ Nutzer entbannen
            await guild.bans.remove(userId);
            console.log(`✅ ${bannedUser.user.tag} got unbanned.`);

            // 🎟 Automatischen Einladungslink generieren
            let inviteChannel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.CreateInstantInvite));
            
            if (!inviteChannel) {
                return interaction.editReply({ content: "⚠️ No suitable channel for an invitation was found. Please invite manually.", ephemeral: true });
            }

            const invite = await inviteChannel.createInvite({
                maxAge: 86400, // 24 Stunden gültig
                maxUses: 1, // Nur eine Verwendung
                unique: true
            });

            // 📩 DM an den Nutzer senden
            const dmEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle("✅ You were unbanned!")
                .setDescription(`You were unbanned from the server **${guild.name}**.\nHere is your new invitation link: [Click here](${invite.url})`)
                .setThumbnail(guild.iconURL())
                .setFooter({ text: "Please follow the rules to avoid being banned again." });

            if (imageUrl) dmEmbed.setImage(imageUrl);

            try {
                const user = await interaction.client.users.fetch(userId);
                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error("⚠️ Couldn't send a DM to the user.", error);
            }

            // ✅ Server-Benachrichtigung senden
            const unbanEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle("✅ User unbanned")
                .setDescription(`**${bannedUser.user.tag}** were successfully unbanned.`)
                .addFields(
                    { name: "👤 Unbanned by", value: `${interaction.user.tag}`, inline: true },
                    { name: "📌 Server", value: `${guild.name}`, inline: true }
                )
                .setFooter({ text: "Made by Lenny & Timi" });

            if (imageUrl) unbanEmbed.setImage(imageUrl);

            await interaction.editReply({ embeds: [unbanEmbed] });

        } catch (error) {
            console.error("❌ Error:", error);
            await interaction.editReply({ content: "❌ Error unbanning user!", ephemeral: true });
        }
    }
};