const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addrole")
        .setDescription("Fügt einem Benutzer eine oder mehrere Rollen hinzu (max. 5)")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option => 
            option.setName("user")
                .setDescription("Der Benutzer, dem die Rolle(n) hinzugefügt werden sollen")
                .setRequired(true)
        )
        .addRoleOption(option => 
            option.setName("role1")
                .setDescription("Die erste Rolle, die hinzugefügt werden soll")
                .setRequired(true)
        )
        .addRoleOption(option => 
            option.setName("role2")
                .setDescription("Optionale zweite Rolle")
                .setRequired(false)
        )
        .addRoleOption(option => 
            option.setName("role3")
                .setDescription("Optionale dritte Rolle")
                .setRequired(false)
        )
        .addRoleOption(option => 
            option.setName("role4")
                .setDescription("Optionale vierte Rolle")
                .setRequired(false)
        )
        .addRoleOption(option => 
            option.setName("role5")
                .setDescription("Optionale fünfte Rolle")
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getMember("user");
        if (!user) {
            return interaction.reply({ content: "❌ Fehler: Benutzer nicht gefunden.", ephemeral: true });
        }

        const roles = [];
        for (let i = 1; i <= 5; i++) {
            const role = interaction.options.getRole(`role${i}`);
            if (role) roles.push(role);
        }

        if (roles.length === 0) {
            return interaction.reply({ content: "❌ Keine Rollen ausgewählt.", ephemeral: true });
        }

        const botMember = await interaction.guild.members.fetchMe();
        const missingPermissions = roles.filter(role => !botMember.permissions.has(PermissionFlagsBits.ManageRoles) || botMember.roles.highest.position <= role.position);

        if (missingPermissions.length > 0) {
            return interaction.reply({ content: "❌ Ich habe nicht genügend Rechte, um eine oder mehrere dieser Rollen hinzuzufügen!", ephemeral: true });
        }

        try {
            await user.roles.add(roles);
            interaction.reply({ content: `✅ ${roles.map(r => r.name).join(", ")} wurde zu **${user.user.username}** hinzugefügt!`, ephemeral: false });
        } catch (error) {
            console.error("❌ Fehler beim Hinzufügen der Rollen:", error);
            interaction.reply({ content: "❌ Fehler beim Hinzufügen der Rollen!", ephemeral: true });
        }
    }
};