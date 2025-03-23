const {
    Client, GatewayIntentBits, Collection, Events, ChannelType,
    PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder
} = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, 'config/ticketSettings.json');
const jtcSettingsPath = path.join(__dirname, 'config/jtcSettings.json'); // 🔥 JTC-Config
const welcomeSettingsPath = path.join(__dirname, 'config/welcomeSettings.json'); // ✅ Korrektur
const autoroleSettingsPath = path.join(__dirname, 'config/autoroleSettings.json'); // Auto Rolle 
const serverInfoPath = path.join(__dirname, 'config/serverInfo.json');
const moderationLogsPath = path.join(__dirname, 'config/moderationLogs.json');

const jsonFiles = [settingsPath, jtcSettingsPath, welcomeSettingsPath, autoroleSettingsPath, serverInfoPath, moderationLogsPath];

const loadJSON = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}, null, 4));
            console.log(`📂 Datei erstellt: ${filePath}`);
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`❌ Fehler beim Laden der Datei ${filePath}:`, error);
        return {};
    }
};

const saveJSON = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error(`❌ Fehler beim Speichern der Datei ${filePath}:`, error);
    }
};

jsonFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 4));
        console.log(`📂 Datei erstellt: ${filePath}`);
    }
});

// 🔄 JSON-Dateien beim Start laden
const ticketSettings = loadJSON(settingsPath);
const jtcSettings = loadJSON(jtcSettingsPath);
const welcomeSettings = loadJSON(welcomeSettingsPath);
const autoroleSettings = loadJSON(autoroleSettingsPath);
const serverInfoSettings = loadJSON(serverInfoPath);
const moderationLogs = loadJSON(moderationLogsPath);

console.log("✅ Alle JSON-Dateien erfolgreich geladen.");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers  // 🔥 Dieser Intent ist wichtig für Join/Leave Events!
    ]
});
client.commands = new Collection();

// 📂 **Alle Commands laden**
const commandsPath = path.join(__dirname, 'commands');
const folders = fs.readdirSync(commandsPath);

for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (!command.data || !command.data.name) {
            console.warn(`⚠️ Datei übersprungen: ${filePath} (Kein gültiger Command)`);
            continue;
        }

        client.commands.set(command.data.name, command);
    }
}

console.log(`✅ ${client.commands.size} Commands wurden geladen.`);

// ✅ **Bot bereit**
client.once('ready', () => {
    console.log(`✅ Bot ist online als ${client.user.tag}`);
    client.user.setPresence({
        status: 'dnd',
        activities: [{ name: 'in die Tiefsee 🐠', type: 3 }]
    });
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`❌ Command ${interaction.commandName} not found!`);
            return;
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`❌ Error in /${interaction.commandName}:`, error);
            await interaction.reply({ content: '❌ Error executing the command!', ephemeral: true });
        }
    } else if (interaction.isButton() && interaction.customId.startsWith("ticket_")) {
        await handleTicketInteraction(interaction);
    } else if (interaction.isButton() && interaction.customId.startsWith("jtc_")) {
        await handleJTCInteraction(interaction);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === "ticket_select") {
        await handleTicketInteraction(interaction);
    }
});

async function handleTicketInteraction(interaction) {
    const guildId = interaction.guild.id;
    if (!fs.existsSync(settingsPath)) return;

    const settings = JSON.parse(fs.readFileSync(settingsPath));
    if (!settings[guildId]) return;

    const categoryIndex = parseInt(interaction.values[0].split("_")[1]);
    const category = settings[guildId].categories[categoryIndex];

    if (!category) return;

    const user = interaction.user;
    const moderatorRoleId = settings[guildId].supportRoleId;
    const ticketCategoryId = settings[guildId].categoryId;
    const embedGif = settings[guildId]?.embedGif || "https://cdn.discordapp.com/attachments/1350234746395037787/1351182393058525306/IMG-5909.gif";

    try {
        // 🎫 Erstelle den Ticket-Kanal
        const channel = await interaction.guild.channels.create({
            name: `🎫-${user.username}`,
            type: ChannelType.GuildText,
            parent: ticketCategoryId,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: moderatorRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });

        const ticketSettings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
        if (!ticketSettings[guildId].activeTickets) ticketSettings[guildId].activeTickets = {};

        // 🎟️ Speichere das Ticket in der JSON-Datei
        ticketSettings[guildId].activeTickets[user.id] = channel.id;
        fs.writeFileSync(settingsPath, JSON.stringify(ticketSettings, null, 4));
        console.log(`🎟️ Ticket für ${user.tag} in ${channel.id} gespeichert!`);

        const embed = new EmbedBuilder()
            .setColor(settings[guildId].color || "#0099ff")
            .setTitle(`🎫 Ticket: ${category.name}`)
            .setDescription(`
            Welcome to the ticket for **${category.name}**! A team member will be in touch soon.
        `)
            .setImage(embedGif) // ✅ Nutzt `embedGif` für geöffnete Tickets
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        // 🎟️ Select-Menü für Ticket-Optionen
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_options')
            .setPlaceholder('📌 Choose an action for the ticket')
            .addOptions([
                { label: '🔒 Close', value: `close_${channel.id}`, emoji: '🔒' },
                { label: '🗑️ Delete', value: `delete_${channel.id}`, emoji: '🗑️' },
                { label: '📩 Reminder', value: `remind_${channel.id}`, emoji: '📩' }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);
        await channel.send({ content: "", components: [row] });

        // ✅ DM mit `embedGif` senden
        const dmEmbed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("✅ Your Ticket has been created!")
            .setDescription(`
            Your **"${category.name}"** ticket has been successfully opened.
    
            👉 **Click here:** ${channel}
        `)
            .setImage(embedGif)
            .setTimestamp();

        try {
            await user.send({ embeds: [dmEmbed] });
            console.log(`✅ DM successfully send to ${user.tag}.`);
        } catch (error) {
            console.log(`⚠️ Couldn't send DM to ${user.tag}. DMs may be disabled.`);
        }

        await interaction.reply({ content: `✅ Your Ticket is created: ${channel}`, ephemeral: true });

    } catch (error) {
        console.error("❌ Error", error);
        await interaction.reply({ content: "❌ Error", ephemeral: true });
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === "ticket_options") {
        const [action, channelId] = interaction.values[0].split("_");
        const channel = interaction.guild.channels.cache.get(channelId);
        const guildId = interaction.guild.id;

        if (!channel) {
            return interaction.reply({ content: "❌ Ticket not found or already deleted.", ephemeral: true });
        }

        // ✅ Ticket-Ersteller zuverlässig ermitteln
        const user = channel.permissionOverwrites.cache
            .filter(perm => perm.type === 1 && perm.allow.has(PermissionsBitField.Flags.ViewChannel))
            .map(perm => interaction.guild.members.cache.get(perm.id))[0];

        if (!user) {
            return interaction.reply({ content: "❌ The ticket creator could not be found.", ephemeral: true });
        }

        // 📂 Lade die Ticket-Datenbank
        const ticketSettings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

        if (action === "close") {
            await channel.permissionOverwrites.edit(user.id, { ViewChannel: false });

            const embed = new EmbedBuilder()
                .setColor("#ffcc00")
                .setTitle("🔒 Ticket closed")
                .setDescription(`The ticket was closed by **${interaction.user.tag}**.`)
                .setTimestamp();

            await channel.send({ embeds: [embed] });

            // ✅ DM an den Ticket-Ersteller
            const dmEmbed = new EmbedBuilder()
                .setColor("#ffcc00")
                .setTitle("🔒 Your Ticket got closed!")
                .setDescription(`A team member (${interaction.user.tag}) has closed your ticket.`)
                .setTimestamp();

            try {
                await user.send({ embeds: [dmEmbed] });
            } catch {
                console.log(`⚠️ Could not send DM to ${user.user.tag}.`);
            }

            // 🚪 Ticket aus der Datenbank entfernen
            if (ticketSettings[guildId]?.activeTickets?.[user.id]) {
                delete ticketSettings[guildId].activeTickets[user.id];
                fs.writeFileSync(settingsPath, JSON.stringify(ticketSettings, null, 4));
                console.log(`🚪 Ticket von ${user.tag} entfernt.`);
            }

            return interaction.reply({ content: "✅ Ticket got closed.", ephemeral: true });
        }

        if (action === "delete") {
            await interaction.reply({ content: "⏳ Ticket will be closed in 5 Seconds...", ephemeral: true });

            // ✅ DM an den Ticket-Ersteller
            const dmEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("🗑️ Your Ticket got deleted!")
                .setDescription(`A team member (${interaction.user.tag}) has deleted your ticket.`)
                .setTimestamp();

            try {
                await user.send({ embeds: [dmEmbed] });
            } catch {
                console.log(`⚠️ Could not send DM to ${user.user.tag}.`);
            }

            // 🚮 Ticket aus der Datenbank entfernen
            if (ticketSettings[guildId]?.activeTickets?.[user.id]) {
                delete ticketSettings[guildId].activeTickets[user.id];
                fs.writeFileSync(settingsPath, JSON.stringify(ticketSettings, null, 4));
                console.log(`🚮 Ticket von ${user.tag} entfernt.`);
            }

            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (error) {
                    console.error("❌ Error deleting ticket:", error);
                }
            }, 5000);
        }

        if (action === "remind") {
            // ✅ DM an den Ticket-Ersteller
            const dmEmbed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle("📩 Ticket-Reminder!")
                .setDescription(`Please check your ticket again! The team is waiting for your response.`)
                .setTimestamp();

            try {
                await user.send({ embeds: [dmEmbed] });
                await interaction.reply({ content: "✅ Reminder send.", ephemeral: true });
            } catch {
                console.log(`⚠️ Could not send DM to ${user.user.tag}.`);
                await interaction.reply({ content: "⚠️ Couldn't send the user a DM.", ephemeral: true });
            }
        }
    }
});
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    const [action, channelId] = interaction.customId.split("_");
    const voiceChannel = interaction.guild.channels.cache.get(channelId);

    if (!voiceChannel) {
        return interaction.reply({ content: "❌ The Call is not existing anymore!", ephemeral: true });
    }

    // 🔒 Call Lock / Unlock
    if (action === "lock") {
        const isLocked = voiceChannel.permissionOverwrites.cache.some(perm => perm.id === interaction.guild.id && perm.deny.has(PermissionsBitField.Flags.Connect));

        await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: isLocked ? null : false
        });

        await interaction.reply({ content: `🔒 Call is now ${isLocked ? "locked" : "unlocked"}!`, ephemeral: true });
    }

    // 🔢 Nutzerlimit ändern
    if (action === "limit") {
        await interaction.reply({ content: "🔢 Please tell me a userlimit 1-99!", ephemeral: true });

        const filter = m => m.author.id === interaction.user.id;
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => { });

        if (!collected || !collected.size) return interaction.followUp({ content: "❌ Time is over!", ephemeral: true });

        const newLimit = parseInt(collected.first().content.trim());
        if (isNaN(newLimit) || newLimit < 1 || newLimit > 99) {
            return interaction.followUp({ content: "❌ This is not valid. Please enter a userlimit 1-99!", ephemeral: true });
        }

        await voiceChannel.setUserLimit(newLimit);
        await interaction.followUp({ content: `✅ Userlimit set to **${newLimit}**!`, ephemeral: true });
    }

    // ✏️ Call umbenennen
    if (action === "rename") {
        await interaction.reply({ content: "✏️ Please enter a new name!", ephemeral: true });

        const filter = m => m.author.id === interaction.user.id;
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => { });

        if (!collected || !collected.size) return interaction.followUp({ content: "❌ Time is over!", ephemeral: true });

        const newName = collected.first().content.trim();
        await voiceChannel.setName(newName);
        await interaction.followUp({ content: `✅ Call got renamed to **${newName}**!`, ephemeral: true });
    }
});

async function sendJTCControlMessage(voiceChannel) {
    try {
        console.log(`📩 Searching for voice text channel for ${voiceChannel.name}...`);

        // **Versuche, den verknüpften Sprach-Textkanal zu finden**
        await voiceChannel.fetch();
        const textChannel = voiceChannel.guild.channels.cache.get(voiceChannel.id);

        if (!textChannel) {
            console.log(`⚠️ No voice text channel found for ${voiceChannel.name}.`);
            return;
        }

        console.log(`✅ Voice-text channel found: ${textChannel.name}`);

        // **Steuerungsnachricht vorbereiten**
        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🔊 Your JTC call has been created!")
            .setDescription("Use the buttons below to manage your call.")
            .setFooter({ text: "JTC call settings" });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`lock_${voiceChannel.id}`)
                    .setLabel("🔒 Call Lock")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`limit_${voiceChannel.id}`)
                    .setLabel("🔄 Change Userlimit")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`rename_${voiceChannel.id}`)
                    .setLabel("✏️ Change Callname")
                    .setStyle(ButtonStyle.Success)
            );

        // 📩 **Nachricht in den Sprach-Textkanal des Calls senden**
        await textChannel.send({ embeds: [embed], components: [row] });
        console.log(`✅ Your Optionmessage got sent in ${textChannel.name}.`);

    } catch (error) {
        console.error(`❌ Error sending JTC control message:`, error);
    }
}

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (!fs.existsSync(jtcSettingsPath)) return;

    // 🛠️ JSON-Datei einlesen
    const settings = JSON.parse(fs.readFileSync(jtcSettingsPath, "utf8"));
    const guildId = newState.guild.id;

    if (!settings[guildId]) {
        settings[guildId] = { jtcChannelId: null, activeCalls: {} };
        fs.writeFileSync(jtcSettingsPath, JSON.stringify(settings, null, 4));
    }

    const jtcChannelId = settings[guildId]?.jtcChannelId;
    if (!jtcChannelId) return; // Falls kein JTC-Channel gespeichert ist, nichts tun

    // ✅ **User betritt JTC-Channel**
    if (newState.channelId === jtcChannelId) {
        console.log(`✅ [JTC] ${newState.member.user.tag} betritt den JTC-Channel!`);

        try {
            // 🎙️ Erstelle einen neuen Voice-Channel
            const voiceChannel = await newState.guild.channels.create({
                name: `🔊 ${newState.member.user.username}`,
                type: ChannelType.GuildVoice,
                parent: newState.channel?.parentId || null,
                userLimit: 4,
                permissionOverwrites: [
                    { id: newState.guild.id, allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel] },
                    { id: newState.member.user.id, allow: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel] }
                ]
            });

            // 🗣️ Speichere den erstellten Sprachkanal
            settings[guildId].activeCalls[newState.member.id] = voiceChannel.id;
            fs.writeFileSync(jtcSettingsPath, JSON.stringify(settings, null, 4));
            console.log(`🔊 Neuer JTC-Call für ${newState.member.user.tag} gespeichert!`);

            // ✅ **User in den neuen Call moven**
            await newState.member.voice.setChannel(voiceChannel);
            console.log(`✅ [JTC] ${newState.member.user.tag} wurde in den neuen Call verschoben.`);

            // ✅ **Steuerungsnachricht in den Call senden**
            await sendJTCControlMessage(voiceChannel);
        } catch (error) {
            console.error("❌ [JTC] Fehler beim Erstellen des JTC-Calls:", error);
        }
    }

    // ✅ **JTC-Call löschen, wenn er leer ist**
    if (oldState.channel && oldState.channel.members.size === 0) {
        if (!settings[guildId]?.activeCalls || !Object.values(settings[guildId].activeCalls).includes(oldState.channel.id)) {
            console.log(`⚠️ [JTC] Call ${oldState.channel.name} ist kein JTC-Call. Er wird NICHT gelöscht.`);
            return;
        }

        console.log(`🗑️ [JTC] Lösche leeren JTC-Call: ${oldState.channel.name}`);

        // **JTC-Call aus der Liste entfernen**
        const callOwner = Object.keys(settings[guildId].activeCalls).find(userId => settings[guildId].activeCalls[userId] === oldState.channel.id);
        if (callOwner) {
            delete settings[guildId].activeCalls[callOwner];
            fs.writeFileSync(jtcSettingsPath, JSON.stringify(settings, null, 4));
        }

        try {
            await oldState.channel.delete();
            console.log(`✅ [JTC] JTC-Call gelöscht.`);
        } catch (err) {
            console.log(`⚠️ [JTC] Fehler beim Löschen des JTC-Calls: ${err.message}`);
        }
    }
});
// **🌟 Standardwerte für GIF und Text**
const DEFAULT_GIF = "https://cdn.discordapp.com/attachments/1348390411349131325/1351516940664963153/welcome.gif?ex=67daa9bc&is=67d9583c&hm=001595cf47e135ec482a7e40e29b189e03c2d8b8f37536b83283961295570398&";
const DEFAULT_WELCOME_TEXT = `🦈Hey {member}, we're glad you've landed on our server. We hope you have fun!🐳! 🎊\n\n📜 **Rules:** Please read the rules and follow them.\n✅ **Questions:** If you have any questions, feel free to contact the team🌊\n\n\n🦈Hey {member}, schön dass du auf unserem Server gelandet bist, wir hoffen du hast viel Spaß🐳! 🎊\n\n📜 **Regeln:** Lese dir bitte die Regeln durch und beachte sie.\n✅ **Fragen:** Falls du Fragen hast wende dich gerne an das Team🌊!`;

client.on('guildMemberAdd', async member => {
    console.log(`✅ [JOIN EVENT] ${member.user.tag} just joined the server.`);

    if (member.user.bot) {
        console.log(`⚠️ [INFO] ${member.user.tag} is a bot.`);
        return;
    }

    if (!fs.existsSync(welcomeSettingsPath)) {
        console.log("⚠️ [ERROR] The file welcomeSettings.json does not exist.");
        return;
    }

    const settings = JSON.parse(fs.readFileSync(welcomeSettingsPath, 'utf8'));
    const guildId = member.guild.id;

    if (!settings[guildId] || !settings[guildId].welcomeChannelId) {
        console.log(`⚠️ [ERROR] No welcome channel found for server ${member.guild.name}.`);
        return;
    }

    const welcomeChannel = member.guild.channels.cache.get(settings[guildId].welcomeChannelId);
    if (!welcomeChannel) {
        console.log(`❌ [ERROR] Welcome channel with ID ${settings[guildId].welcomeChannelId} does not exist or is not visible.`);
        return;
    }

    // **🌟 Verwende das server-spezifische GIF oder das Standard-GIF**
    const welcomeGif = settings[guildId]?.welcomeGif || DEFAULT_GIF;

    // **🌟 Verwende den server-spezifischen Text oder den Standard-Welcome-Text**
    const welcomeText = settings[guildId]?.welcomeText?.replace("{member}", member) || DEFAULT_WELCOME_TEXT.replace("{member}", member);

    console.log(`📩 [INFO] Send welcome message to ${member.user.tag} in ${welcomeChannel.name}`);

    const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(
            "We're glad you've landed on our Server!\n"
        )
        .setDescription(welcomeText)
        .setImage(welcomeGif)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Have fun 🐬", iconURL: member.guild.iconURL({ dynamic: true }) })
        .setTimestamp();

    try {
        await welcomeChannel.send({ content: `🌊 Welcome <@${member.user.id}>`, embeds: [embed] });
        console.log(`✅ [SUCCESS] Begrüßungsnachricht an ${member.user.tag} gesendet.`);
    } catch (error) {
        console.error(`❌ [ERROR] Fehler beim Senden der Begrüßungsnachricht:`, error);
    }
});

const botSettingsPath = path.join(__dirname, 'config/botSettings.json');

client.once('ready', async () => {
    console.log(`✅ Bot ist online als ${client.user.tag}`);

    const settings = fs.existsSync(botSettingsPath) ? JSON.parse(fs.readFileSync(botSettingsPath, 'utf8')) : {};

    for (const guild of client.guilds.cache.values()) {
        if (settings[guild.id]) {
            if (settings[guild.id].nickname) {
                try {
                    const botMember = await guild.members.fetchMe();
                    await botMember.setNickname(settings[guild.id].nickname);
                    console.log(`✅ Nickname für ${guild.name} auf "${settings[guild.id].nickname}" gesetzt.`);
                } catch (error) {
                    console.error(`❌ Fehler beim Setzen des Nicknames für ${guild.name}:`, error);
                }
            }
        }
    }
});

client.on('', async (member) => {
    console.log(`✅ [JOIN EVENT] ${member.user.tag} ist dem Server beigetreten.`);

    if (!fs.existsSync(autoroleSettingsPath)) {
        console.log("⚠️ [ERROR] Die Datei autoroleSettings.json existiert nicht.");
        return;
    }

    const autoroleSettings = JSON.parse(fs.readFileSync(autoroleSettingsPath, 'utf8'));
    const guildId = member.guild.id;
    const guildSettings = autoroleSettings[guildId] || autoroleSettings["default"];

    if (!guildSettings || !guildSettings.roles || guildSettings.roles.length === 0) {
        console.log(`⚠️ [ERROR] Keine Auto-Rollen für Server ${member.guild.name} eingerichtet.`);
        return;
    }

    const rolesToAssign = guildSettings.roles
        .map(roleId => member.guild.roles.cache.get(roleId))
        .filter(role => role && role.editable); // 🔥 Stellt sicher, dass der Bot die Rolle auch vergeben kann!

    if (rolesToAssign.length === 0) {
        console.log(`⚠️ [ERROR] Keine gültigen Rollen zum Zuweisen gefunden.`);
        return;
    }

    try {
        await member.roles.add(rolesToAssign);
        console.log(`✅ ${member.user.tag} hat die Rollen ${rolesToAssign.map(r => r.name).join(', ')} erhalten.`);
    } catch (error) {
        console.error(`❌ [ERROR] Fehler beim Zuweisen der Rollen an ${member.user.tag}:`, error);
    }
});

client.on("guildCreate", async (guild) => {
    console.log(`✅ [GUILD JOIN] Der Bot wurde zu "${guild.name}" hinzugefügt! (ID: ${guild.id})`);

    const guildId = guild.id;

    // **1️⃣ Auto-Role System initialisieren**
    if (fs.existsSync(autoroleSettingsPath)) {
        const autoroleSettings = JSON.parse(fs.readFileSync(autoroleSettingsPath, "utf8"));

        if (!autoroleSettings[guildId]) {
            autoroleSettings[guildId] = { roles: [] };
            fs.writeFileSync(autoroleSettingsPath, JSON.stringify(autoroleSettings, null, 4));
            console.log(`✅ [AutoRole] Standardwerte für "${guild.name}" gespeichert:`, JSON.stringify(autoroleSettings[guildId], null, 4));
        } else {
            console.log(`📂 [AutoRole] Existiert bereits für "${guild.name}":`, JSON.stringify(autoroleSettings[guildId], null, 4));
        }
    }

    // **2️⃣ Ticket-System initialisieren**
    if (fs.existsSync(settingsPath)) {
        const ticketSettings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

        if (!ticketSettings[guildId]) {
            ticketSettings[guildId] = {
                ticketName: "Support Tickets",
                categoryId: null,
                supportRoleId: null,
                color: "#0099ff",
                categories: [
                    { name: "Allgemeine Anfragen" },
                    { name: "Technischer Support" },
                    { name: "Bug Reports" }
                ]
            };
            fs.writeFileSync(settingsPath, JSON.stringify(ticketSettings, null, 4));
            console.log(`✅ [Tickets] Standardwerte für "${guild.name}" gespeichert:`, JSON.stringify(ticketSettings[guildId], null, 4));
        } else {
            console.log(`📂 [Tickets] Existiert bereits für "${guild.name}":`, JSON.stringify(ticketSettings[guildId], null, 4));
        }
    }

    // **3️⃣ JTC-System initialisieren**
    if (fs.existsSync(jtcSettingsPath)) {
        const jtcSettings = JSON.parse(fs.readFileSync(jtcSettingsPath, "utf8"));

        if (!jtcSettings[guildId]) {
            jtcSettings[guildId] = { jtcChannelId: null, activeCalls: {} };
            fs.writeFileSync(jtcSettingsPath, JSON.stringify(jtcSettings, null, 4));
            console.log(`✅ [JTC] Standardwerte für "${guild.name}" gespeichert:`, JSON.stringify(jtcSettings[guildId], null, 4));
        } else {
            console.log(`📂 [JTC] Existiert bereits für "${guild.name}":`, JSON.stringify(jtcSettings[guildId], null, 4));
        }
    }

    // **4️⃣ Willkommen-System initialisieren**
    if (fs.existsSync(welcomeSettingsPath)) {
        const welcomeSettings = JSON.parse(fs.readFileSync(welcomeSettingsPath, "utf8"));

        if (!welcomeSettings[guildId]) {
            welcomeSettings[guildId] = {
                welcomeChannelId: null,
                welcomeGif: DEFAULT_GIF,
                welcomeText: DEFAULT_WELCOME_TEXT
            };
            fs.writeFileSync(welcomeSettingsPath, JSON.stringify(welcomeSettings, null, 4));
            console.log(`✅ [Welcome] Standardwerte für "${guild.name}" gespeichert:`, JSON.stringify(welcomeSettings[guildId], null, 4));
        } else {
            console.log(`📂 [Welcome] Existiert bereits für "${guild.name}":`, JSON.stringify(welcomeSettings[guildId], null, 4));
        }
    }

    // **5️⃣ Server-Info initialisieren**
    if (fs.existsSync(serverInfoPath)) {
        const serverInfoSettings = JSON.parse(fs.readFileSync(serverInfoPath, "utf8"));

        if (!serverInfoSettings[guildId]) {
            serverInfoSettings[guildId] = { channelId: null };
            fs.writeFileSync(serverInfoPath, JSON.stringify(serverInfoSettings, null, 4));
            console.log(`✅ [ServerInfo] Standardwerte für "${guild.name}" gespeichert:`, JSON.stringify(serverInfoSettings[guildId], null, 4));
        } else {
            console.log(`📂 [ServerInfo] Existiert bereits für "${guild.name}":`, JSON.stringify(serverInfoSettings[guildId], null, 4));
        }
    }

    console.log(`🎉 Der Server "${guild.name}" wurde vollständig initialisiert!`);
});
client.on("guildDelete", async (guild) => {
    console.log(`❌ [GUILD LEAVE] Der Bot wurde von ${guild.name} entfernt.`);

    const guildId = guild.id;

    // **1️⃣ Entferne aus Auto-Role System**
    if (fs.existsSync(autoroleSettingsPath)) {
        const autoroleSettings = JSON.parse(fs.readFileSync(autoroleSettingsPath, "utf8"));
        if (autoroleSettings[guildId]) delete autoroleSettings[guildId];
        fs.writeFileSync(autoroleSettingsPath, JSON.stringify(autoroleSettings, null, 4));
    }

    // **2️⃣ Entferne aus Ticket-System**
    if (fs.existsSync(settingsPath)) {
        const ticketSettings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
        if (ticketSettings[guildId]) delete ticketSettings[guildId];
        fs.writeFileSync(settingsPath, JSON.stringify(ticketSettings, null, 4));
    }

    // **3️⃣ Entferne aus JTC-System**
    if (fs.existsSync(jtcSettingsPath)) {
        const jtcSettings = JSON.parse(fs.readFileSync(jtcSettingsPath, "utf8"));
        if (jtcSettings[guildId]) delete jtcSettings[guildId];
        fs.writeFileSync(jtcSettingsPath, JSON.stringify(jtcSettings, null, 4));
    }

    // **4️⃣ Entferne aus Welcome-System**
    if (fs.existsSync(welcomeSettingsPath)) {
        const welcomeSettings = JSON.parse(fs.readFileSync(welcomeSettingsPath, "utf8"));
        if (welcomeSettings[guildId]) delete welcomeSettings[guildId];
        fs.writeFileSync(welcomeSettingsPath, JSON.stringify(welcomeSettings, null, 4));
    }

    // **5️⃣ Entferne aus Server-Info**
    if (fs.existsSync(serverInfoPath)) {
        const serverInfoSettings = JSON.parse(fs.readFileSync(serverInfoPath, "utf8"));
        if (serverInfoSettings[guildId]) delete serverInfoSettings[guildId];
        fs.writeFileSync(serverInfoPath, JSON.stringify(serverInfoSettings, null, 4));
    }

    console.log(`🚮 Der Server ${guild.name} wurde aus allen Datenbanken entfernt.`);
});

// **📂 Neue ModerationLogs JSON-Datei erstellen, falls nicht vorhanden**
if (!fs.existsSync(moderationLogsPath)) {
    fs.writeFileSync(moderationLogsPath, JSON.stringify({}, null, 4));
    console.log(`📂 Datei erstellt: ${moderationLogsPath}`);
}

// **📌 Moderationsaktionen speichern**
function logModerationAction(guildId, userId, action, moderator, reason) {
    const moderationLogs = JSON.parse(fs.readFileSync(moderationLogsPath, "utf8"));

    if (!moderationLogs[guildId]) {
        moderationLogs[guildId] = [];
    }

    const logEntry = {
        userId: userId,
        action: action,
        moderator: moderator,
        reason: reason,
        timestamp: new Date().toISOString()
    };

    moderationLogs[guildId].push(logEntry);
    fs.writeFileSync(moderationLogsPath, JSON.stringify(moderationLogs, null, 4));
    console.log(`✅ [LOG] ${action} für User ${userId} durch ${moderator}`);
}

// **📌 Event: User wird gebannt**
client.on(Events.GuildBanAdd, async (ban) => {
    console.log(`⛔ ${ban.user.tag} wurde gebannt.`);

    // 📂 Log in der JSON-Datei speichern
    logModerationAction(
        ban.guild.id,
        ban.user.id,
        "ban",
        "Unbekannt (Manueller Ban)",
        "Kein Grund angegeben"
    );
});

// **📌 Event: User wird gekickt**
client.on(Events.GuildMemberRemove, async (member) => {
    if (member.kickable) {
        console.log(`👢 ${member.user.tag} wurde gekickt.`);

        logModerationAction(
            member.guild.id,
            member.user.id,
            "kick",
            "Unbekannt (Manueller Kick)",
            "Kein Grund angegeben"
        );
    }
});

// **📌 Slash-Command zum Bannen eines Users**
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "ban") {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "❌ Du hast keine Berechtigung, Benutzer zu bannen.", ephemeral: true });
        }

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "Kein Grund angegeben";

        if (!user) return interaction.reply({ content: "❌ Benutzer nicht gefunden.", ephemeral: true });

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) return interaction.reply({ content: "❌ Der Benutzer ist nicht auf diesem Server.", ephemeral: true });

        try {
            await member.ban({ reason: reason });
            logModerationAction(interaction.guild.id, user.id, "ban", interaction.user.tag, reason);
            interaction.reply({ content: `✅ ${user.tag} wurde gebannt.\n📜 Grund: ${reason}` });
        } catch (error) {
            console.error("❌ Fehler beim Bannen:", error);
            interaction.reply({ content: "❌ Fehler beim Bannen des Benutzers.", ephemeral: true });
        }
    }
});

// **📌 Slash-Command zum Kicken eines Users**
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "kick") {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: "❌ Du hast keine Berechtigung, Benutzer zu kicken.", ephemeral: true });
        }

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "Kein Grund angegeben";

        if (!user) return interaction.reply({ content: "❌ Benutzer nicht gefunden.", ephemeral: true });

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) return interaction.reply({ content: "❌ Der Benutzer ist nicht auf diesem Server.", ephemeral: true });

        try {
            await member.kick(reason);
            logModerationAction(interaction.guild.id, user.id, "kick", interaction.user.tag, reason);
            interaction.reply({ content: `✅ ${user.tag} wurde gekickt.\n📜 Grund: ${reason}` });
        } catch (error) {
            console.error("❌ Fehler beim Kicken:", error);
            interaction.reply({ content: "❌ Fehler beim Kicken des Benutzers.", ephemeral: true });
        }
    }
});

// **📌 Slash-Command: Moderationslogs anzeigen**
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "modlogs") {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "❌ Du hast keine Berechtigung, Moderationslogs zu sehen.", ephemeral: true });
        }

        const moderationLogs = JSON.parse(fs.readFileSync(moderationLogsPath, "utf8"));
        const guildLogs = moderationLogs[interaction.guild.id] || [];

        if (guildLogs.length === 0) {
            return interaction.reply({ content: "📜 Es gibt keine Moderationslogs für diesen Server.", ephemeral: true });
        }

        const logEntries = guildLogs.slice(-5).reverse().map(log => 
            `📅 **${new Date(log.timestamp).toLocaleString()}**\n👤 **User:** <@${log.userId}>\n⚡ **Aktion:** ${log.action}\n👮 **Moderator:** ${log.moderator}\n📜 **Grund:** ${log.reason}`
        ).join("\n\n");

        const embed = new EmbedBuilder()
            .setColor("#ffcc00")
            .setTitle("📜 Letzte Moderationslogs")
            .setDescription(logEntries)
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
});

// **Bot starten**
client.login(process.env.TOKEN);