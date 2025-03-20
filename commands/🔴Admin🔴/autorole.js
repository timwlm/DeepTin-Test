const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const autoroleSettingsPath = path.join(__dirname, '../../config/autoroleSettings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Sets the automatic role for new members.')
        .addRoleOption(option =>
            option.setName('role1')
                .setDescription('Choose a role for new members.')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('role2')
                .setDescription('Second role (option).')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('role3')
                .setDescription('Third role (option).')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('role4')
                .setDescription('Fourth role (option).')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('role5')
                .setDescription('Fifth role (option).')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('role6')
                .setDescription('Sixth role (option).')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('role7')
                .setDescription('Seventh role (option).')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('role8')
                .setDescription('Eighth role (option).')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('role9')
                .setDescription('Ninth role (option).')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('role10')
                .setDescription('Tenth role (option).')
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ You need Admin-Perms for this command!", ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const selectedRoles = [];

        for (let i = 1; i <= 10; i++) {
            const role = interaction.options.getRole(`role${i}`);
            if (role) {
                selectedRoles.push(role.id);
            }
        }

        if (selectedRoles.length === 0) {
            return interaction.reply({ content: "❌ You have to choose at least one role!", ephemeral: true });
        }

        console.log(`✅ /autorole setted! Role: ${selectedRoles.map(id => `<@&${id}>`).join(', ')}`);

        const settings = fs.existsSync(autoroleSettingsPath) ? JSON.parse(fs.readFileSync(autoroleSettingsPath, 'utf8')) : {};
        settings[guildId] = { roles: selectedRoles };

        fs.writeFileSync(autoroleSettingsPath, JSON.stringify(settings, null, 4));

        await interaction.reply({ content: `✅ New members now automatically receive the following roles:  ${selectedRoles.map(id => `<@&${id}>`).join(', ')}`, ephemeral: true });
    }
};