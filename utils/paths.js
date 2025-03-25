// utils/paths.js
const path = require('path');

module.exports = {
    autoroleSettingsPath: path.join(__dirname, '../config/autoroleSettings.json'),
    ticketSettingsPath: path.join(__dirname, '../config/ticketSettings.json'),
    jtcSettingsPath: path.join(__dirname, '../config/jtcSettings.json'),
    welcomeSettingsPath: path.join(__dirname, '../config/welcomeSettings.json'),
    serverInfoPath: path.join(__dirname, '../config/serverInfo.json'),
    moderationLogsPath: path.join(__dirname, '../config/moderationLogs.json'),
    botSettingsPath: path.join(__dirname, '../config/botSettings.json'),
};