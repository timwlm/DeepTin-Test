require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// **Funktion, um Befehle rekursiv aus allen Unterordnern zu laden**
function loadCommands(folderPath) {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        const fullPath = path.join(folderPath, file);
        const stat = fs.lstatSync(fullPath);

        if (stat.isDirectory()) {
            // Falls es ein Unterordner ist, erneut aufrufen (rekursiv)
            loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(fullPath);
                if (command.data) {
                    commands.push(command.data.toJSON());
                    console.log(`✅ Geladen: ${command.data.name}`);
                } else {
                    console.warn(`⚠️ Keine 'data' Eigenschaft in: ${fullPath}`);
                }
            } catch (error) {
                console.error(`❌ Fehler beim Laden von ${fullPath}:`, error);
            }
        }
    }
}

// 🔍 Lade alle Commands
loadCommands(commandsPath);

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`🚀 Registriere ${commands.length} Slashcommands...`);

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log('✅ Slashcommands wurden erfolgreich registriert!');
    } catch (error) {
        console.error('❌ Fehler beim Registrieren der Slashcommands:', error);
    }
})();

console.log(`🚀 Registrierte Befehle: ${commands.map(cmd => cmd.name).join(', ')}`);