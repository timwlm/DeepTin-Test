require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

if (!process.env.TOKEN || !process.env.CLIENT_ID) {
    console.error("❌ ERROR: TOKEN oder CLIENT_ID fehlen in der .env-Datei!");
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

function loadCommands(folderPath) {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        const fullPath = path.join(folderPath, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            const command = require(fullPath);
            if (command.data) commands.push(command.data.toJSON());
        }
    }
}
loadCommands(commandsPath);

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`🚀 Registriere ${commands.length} Slashcommands...`);
        const GUILD_IDS = JSON.parse(fs.readFileSync("./config/serverInfo.json", "utf8"));
        for (const guildId of Object.keys(GUILD_IDS)) {
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: commands });
            console.log(`✅ Slashcommands für ${guildId} registriert!`);
        }
    } catch (error) {
        console.error("❌ Fehler:", error);
    }
})();