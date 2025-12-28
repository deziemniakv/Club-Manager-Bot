// deploy-commands.js
const { REST, Routes } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID_TEAMS } = require('./config');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`Rozpoczęto odświeżanie komend aplikacji ${commands.length} (/).`);
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID_TEAMS),
            { body: commands },
        );

        console.log('Pomyślnie przeładowano komend aplikacji (/).');
    } catch (error) {
        console.error(error);
    }
})();