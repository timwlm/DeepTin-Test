const { SlashCommandBuilder, Embedbuilder, PermissionsBitField } = require("discord.js");
const counting = require("../../schemas/countingschema");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("counting")
    .setdiscription("Manage you counting system")
    .addSubcommand(command => command.setName("setup").setDiscription("Setup the counting system").addChannelOption(option => option.setName("Channel").setdiscription("The Channel for the counting system").addChannelTypes("ChannelType.GuildText").setRequired(true)))
    .addSubcommand(command => command.setName("disable").setDiscription("Disablöe the counting system")),
    async execute (interaction) {

        const { options } = interaction;
        const sub = option.getSubcommand()
        const data = await counting.findOne({ Guild: interaction.guild.id});
        
        if (! interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "You dont have permissions to manage the counting-system", ephemermal: ture });

        switch (sub) {
            case "setup":

            if(data) {
                return await interaction.reply({ content: "You have already setup the counting-system here", ephemermal: true})
            } else {
                const channel = interaction.option.getChannel("channel");
                await counting.create({
                    Guild: interaction.Guild.id,
                    Channel: channel-id,
                    Number: 1
                })
            }
        }
    }
}