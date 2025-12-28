const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Lista wszystkich ról na serwerze.'),
    async execute(interaction) {
        const roles = interaction.guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .map(r => `${r.toString()}: **${r.members.size}** użytkowników`);
        
        const output = roles.slice(0, 30).join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`Role w ${interaction.guild.name}`)
            .setDescription(output || 'Nie znaleziono roli.')
            .setColor(0x0099FF)
            .setFooter({ text: 'Pokazano top 30 ról' });

        await interaction.reply({ embeds: [embed] });
    }
};