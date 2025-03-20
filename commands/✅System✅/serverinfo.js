const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Shows the information of the Server.'),

    async execute(interaction) {
        const { guild } = interaction;

        // 🏠 **Basis-Infos**
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
        const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
        const boosts = guild.premiumSubscriptionCount || 0;

        // 📊 **Tägliche Nachrichten (Platzhalter)**
        const dailyMessages = '⚠️ Nicht getrackt!';

        // 📝 **Embed Nachricht**
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`📊 Serverinfo: ${ guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 })) // Größeres Thumbnail
            .addFields(
                { name: '👥 Member', value: `${totalMembers}\n\u200B`, inline: false },
                { name: '💬 Textchannel', value: `${textChannels}\n\u200B`, inline: false },
                { name: '🔊 Audiochannel', value: `${voiceChannels}\n\u200B`, inline: false },
                { name: '🚀 Boosts', value: `${boosts}\n\u200B`, inline: false }
            )
            .setImage("https://media.discordapp.net/attachments/1348969288001785897/1350581484565827725/Black_White_Blue_Neon_Flash_Digital_Opening_Video_Youtube_Intro_1.gif?ex=67d7eb46&is=67d699c6&hm=97481f8ab1ec671a0e6903c1399cd94d83b17fbbe0c87795da3f8f04f43368e2&=&width=2063&height=1160") // Dein GIF unten im Embed
            .setFooter({ text: `Server-ID: ${guild.id}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};