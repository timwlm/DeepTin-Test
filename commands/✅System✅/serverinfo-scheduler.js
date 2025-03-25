const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { loadJSON, saveJSON } = require('../../utils/filemanager');
const { serverInfoPath } = require('../../utils/paths');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo-scheduler')
        .setDescription('Starts the automatic serverinfo.'),

    async execute(interaction) {
        const guild = interaction.guild;
        const channel = interaction.channel;

        if (!guild) return interaction.reply({ content: "❌ Mistake! Please contact a bot-developer", ephemeral: true });

        const settings = loadJSON(serverInfoPath);
        settings.guildId = guild.id;
        settings.channelId = channel.id;
        saveJSON(serverInfoPath, settings);

        interaction.reply({ content: `✅ Automatic serverinfo is activated.`, ephemeral: true });

        startScheduler(interaction.client);
    }
};

// 📆 Funktion zum Starten des automatischen Updates
function startScheduler(client) {
    setInterval(async () => {
        const settings = loadJSON(serverInfoPath);
        const guild = client.guilds.cache.get(settings.guildId);
        if (!guild) return console.error("❌ Guild not found!");

        const channel = guild.channels.cache.get(settings.channelId);
        if (!channel) return console.error("❌ Serverinfo-Channel not found!");

        const messages = await channel.messages.fetch({ limit: 10 });
        const botMessages = messages.filter(msg => msg.author.id === client.user.id);
        if (botMessages.size > 0) {
            await botMessages.first().delete().catch(err => console.error("❌ Error deleting old message:", err));
        }

        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(member =>
            member.presence?.status && ['online', 'dnd', 'idle'].includes(member.presence.status)
        ).size;
        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const boosts = guild.premiumSubscriptionCount || 0;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${guild.name}\n\u200B`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: '👥 Member', value: `${totalMembers}`, inline: false },
                { name: '💬 Textchannels', value: `${textChannels}`, inline: false },
                { name: '🔊 Voicechannels', value: `${voiceChannels}`, inline: false },
                { name: '🚀 Boosts', value: `${boosts}`, inline: false }
            )
            .setImage(guild.bannerURL({ size: 1024 }) || guild.iconURL({ dynamic: true, size: 1024 }))
            .setFooter({ text: `Server-ID: ${guild.id}` })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        console.log("✅ Serverinfo updated.");
    }, 60 * 1000); // Alle 60 Sekunden
}