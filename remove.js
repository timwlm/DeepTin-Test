const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🗑 Entferne alle Slash-Befehle...');

        // Entferne globale Befehle
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });

        // Entferne Befehle für eine spezifische Gilde (falls genutzt)
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] });

        console.log('✅ Alle Slash-Befehle wurden entfernt! Führe jetzt `node deploy-commands.js` erneut aus.');
    } catch (error) {
        console.error('❌ Fehler beim Entfernen der Slash-Befehle:', error);
    }
})();