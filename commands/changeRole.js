const { SlashCommandBuilder } = require('discord.js');
const { ROLES } = require('../config');
const { getAuthorClub, findRoleByName } = require('../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zmien')
        .setDescription('Zmień rolę użytkownika w klubie')
        .addSubcommand(sub => 
            sub.setName('role')
                .setDescription('Zmień rolę użytkownika w klubie')
                .addUserOption(opt => opt.setName('user').setDescription('The user').setRequired(true))
                .addStringOption(opt => 
                    opt.setName('role')
                        .setDescription('Nowa rola')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Zawodnik', value: 'Zawodnik' },
                            { name: 'Trener', value: 'Trener' },
                            { name: 'Zarzad', value: 'Zarzad' }
                        )
                )
        ),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const newRoleName = interaction.options.getString('role');
        const targetMember = await interaction.guild.members.fetch(targetUser.id);
        const { authorized, clubRole } = getAuthorClub(interaction.member);
        if (!authorized) return interaction.reply({ content: '❌ Odmowa.', ephemeral: true });
        if (!targetMember.roles.cache.has(clubRole.id)) {
            return interaction.reply({ content: `❌ ${targetUser} nie jest członkiem tego klubu: **${clubRole.name}**.`, ephemeral: true });
        }

        await interaction.deferReply();
        const rolesToRemove = [];
        ROLES.TEAM_OPTIONS.forEach(name => {
            const r = findRoleByName(interaction.guild, name);
            if (r && targetMember.roles.cache.has(r.id)) rolesToRemove.push(r.id);
        });

        const roleToAdd = findRoleByName(interaction.guild, newRoleName);
        if (!roleToAdd) return interaction.editReply('❌ Nie znaleziono roli do dodania.');

        try {
            await targetMember.roles.remove(rolesToRemove);
            await targetMember.roles.add(roleToAdd);
            return interaction.editReply(`✅ Zmieniono rolę ${targetUser} na **${newRoleName}** w klubie **${clubRole.name}**.`);
        } catch (e) {
            return interaction.editReply(`❌ Błąd: ${e.message}`);
        }
    }
};