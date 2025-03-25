const path = require('path');

const configDir = path.join(__dirname, '../data/config');

module.exports = {
    configDir,
    autoroleSettingsPath: path.join(configDir, 'autoroleSettings.json'),
    ticketSettingsPath: path.join(configDir, 'ticketSettings.json'),
    jtcSettingsPath: path.join(configDir, 'jtcSettings.json'),
    welcomeSettingsPath: path.join(configDir, 'welcomeSettings.json'),
    serverInfoPath: path.join(configDir, 'serverInfo.json'),
    moderationLogsPath: path.join(configDir, 'moderationLogs.json'),
    botSettingsPath: path.join(configDir, 'botSettings.json'),
};