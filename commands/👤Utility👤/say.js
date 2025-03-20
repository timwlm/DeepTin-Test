const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Sends a message to a specific channel with customization options.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select a channel for the message.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to be sent.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Set a title for the message (optional).')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Hex code of the embedding color (e.g. #0099ff).')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('picture')
                .setDescription('Image URL for the embed.')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('mention')
                .setDescription('Choose a role to mention.')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('embed')
                .setDescription('Should the message be sent as an embed? (true/false).')
                .setRequired(false)
        ),

    async execute(interaction) {
        const kanal = interaction.options.getChannel('channel');
        const nachricht = "\n" + interaction.options.getString('message') + "\n";
        const titel = interaction.options.getString('title') || null;
        const farbe = interaction.options.getString('color') || "#0099ff"; // Standardfarbe
        const bild = interaction.options.getString('picture') || null;
        const mentionRole = interaction.options.getRole('mention');
        const embedEnabled = interaction.options.getBoolean('embed') || false;

        // Überprüfung der Schreibrechte im Kanal
        if (!kanal.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
            return interaction.reply({ content: "❌ I dont have the permission!", ephemeral: true });
        }

        // Nachricht als Embed oder Text
        if (embedEnabled) {
            const embed = new EmbedBuilder()
                .setColor(farbe)
                .setDescription(nachricht);

            if (titel) embed.setTitle(titel);
            if (bild) embed.setImage(bild);

            await kanal.send({ content: mentionRole ? `<@&${mentionRole.id}>` : '', embeds: [embed] });
        } else {
            await kanal.send({ content: `${mentionRole ? `<@&${mentionRole.id}>` : ''} ${nachricht}` });
        }

        await interaction.reply({ content: "✅ Nachricht wurde erfolgreich gesendet!", ephemeral: true });
    }
};