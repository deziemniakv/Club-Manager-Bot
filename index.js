const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { TOKEN, GUILD_ID_TEAMS } = require('./config');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers 
    ] 
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] W poleceniu ${filePath} brakuje "data" lub "execute".`);
    }
}

// Ready Event
client.once(Events.ClientReady, c => {
    console.log(`✅ Gotowe! Zalogowany na ${c.user.tag}`);
});

// Interaction Handler
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // Enforce Bot usage on Teams Server ONLY
    if (interaction.guildId !== GUILD_ID_TEAMS) {
        return interaction.reply({ content: '❌ Ten bot jest skonfigurowany do akceptowania komend tylko na Serwerze Klubowym.', ephemeral: true });
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ Wystąpił błąd podczas wykonywania tego polecenia!', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Wystąpił błąd podczas wykonywania tego polecenia!', ephemeral: true });
        }
    }
});

client.login(TOKEN);