const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../config/serverinfo.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo-scheduler')
        .setDescription('Starts the automatic serverinfo.'),

    async execute(interaction) {
        const guild = interaction.guild;
        const channel = interaction.channel; // Der Channel, in dem der Command ausgeführt wurde

        if (!guild) return interaction.reply({ content: "❌ Mistake! Please contact a bot-developer", ephemeral: true });

        // **Speichere den Channel für zukünftige Updates**
        const settings = { guildId: guild.id, channelId: channel.id };
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));

        interaction.reply({ content: `✅ automatic serverinfo is activated`, ephemeral: true });

        startScheduler(interaction.client);
    }
};

// **Funktion zum Starten des automatischen Updates**
function startScheduler(client) {
    setInterval(async () => {
        if (!fs.existsSync(settingsPath)) return;

        const settings = JSON.parse(fs.readFileSync(settingsPath));
        const guild = client.guilds.cache.get(settings.guildId);
        if (!guild) return console.error("❌ Guild not found!");

        const channel = guild.channels.cache.get(settings.channelId);
        if (!channel) return console.error("❌ Serverinfo-Channel not found!");

        // Lösche die vorherige Serverinfo-Nachricht
        const messages = await channel.messages.fetch({ limit: 10 });
        const botMessages = messages.filter(msg => msg.author.id === client.user.id);
        if (botMessages.size > 0) {
            await botMessages.first().delete().catch(err => console.error("❌ Mistake during deleting the old message", err));
        }

        // **Erstelle die neue Serverinfo**
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(member =>
            member.presence?.status && ['online', 'dnd', 'idle'].includes(member.presence.status)
        ).size;
        const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
        const boosts = guild.premiumSubscriptionCount || 0;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${guild.name}\n\u200B`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: '👥 Member', value: `${totalMembers}\n\u200B`, inline: false },
                { name: '💬 Textchannel', value: `${textChannels}\n\u200B`, inline: false },
                { name: '🔊 Audiochannel', value: `${voiceChannels}\n\u200B`, inline: false },
                { name: '🚀 Boosts', value: `${boosts}\n\u200B`, inline: false }
            )
            .setImage(guild.bannerURL({ size: 1024 }) || guild.iconURL({ dynamic: true, size: 1024 }))
            .setFooter({ text: `Server-ID: ${guild.id}` })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        console.log("✅ Serverinfo automatic changed!");

    }, 60 * 1000); // **Alle 1 Minute**
}