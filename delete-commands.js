require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🗑 Lösche alle globalen Slash-Commands...');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });

        console.log('✅ Alle globalen Slash-Commands wurden gelöscht!');
    } catch (error) {
        console.error('❌ Fehler beim Löschen der Slash-Commands:', error);
    }
})();