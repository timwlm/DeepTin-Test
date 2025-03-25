const path = require('path');
const { 
    autoroleSettingsPath,
    ticketSettingsPath,
    jtcSettingsPath,
    welcomeSettingsPath,
    serverInfoPath,
    moderationLogsPath,
    botSettingsPath
} = require('./utils/paths');

console.log("Working Directory:", process.cwd());
console.log("autoroleSettingsPath:", autoroleSettingsPath);
console.log("ticketSettingsPath:", ticketSettingsPath);
console.log("jtcSettingsPath:", jtcSettingsPath);
console.log("welcomeSettingsPath:", welcomeSettingsPath);
console.log("serverInfoPath:", serverInfoPath);
console.log("moderationLogsPath:", moderationLogsPath);
console.log("botSettingsPath:", botSettingsPath);