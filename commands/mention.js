const { SlashCommandBuilder } = require('discord.js');
const { getAuthorClub } = require('../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wzmianka')
        .setDescription('Pinguje rolę twojego klubu.'),
    async execute(interaction) {
        const { authorized, clubRole } = getAuthorClub(interaction.member);
        
        if (!authorized) return interaction.reply({ content: '❌ Tylko Prezes albo zarząd może użyć.', ephemeral: true });
        if (!clubRole) return interaction.reply({ content: '❌ nie znaleziono klubu.', ephemeral: true });

        await interaction.reply({ 
            content: `${clubRole.toString()}`,
            allowedMentions: { roles: [clubRole.id] } 
        });
    }
};