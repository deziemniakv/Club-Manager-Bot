const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} = require('discord.js');
const { ROLES } = require('../config');
const { getAuthorClub, getMainServerMember, findRoleByName } = require('../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Zarządzaj członkami swojego klubu.')
        .addSubcommand(sub => 
            sub.setName('dodaj')
                .setDescription('Zaproś użytkownika do swojego klubu (wymagana akceptacja)')
                .addUserOption(opt => opt.setName('user').setDescription('The user').setRequired(true))
                .addStringOption(opt => 
                    opt.setName('role')
                        .setDescription('Team role')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Zawodnik', value: 'Zawodnik' },
                            { name: 'Trener', value: 'Trener' },
                            { name: 'Zarzad', value: 'Zarzad' }
                        )
                )
        )
        .addSubcommand(sub =>
            sub.setName('usun')
                .setDescription('Usuń użytkownika z klubu')
                .addUserOption(opt => opt.setName('user').setDescription('Użytkownik').setRequired(true))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('user');
        const { authorized, clubRole } = getAuthorClub(interaction.member);

        if (!authorized) {
            return interaction.reply({ content: '❌ Nie masz uprawnień (tylko Prezes/Zarząd).', ephemeral: true });
        }
        if (!clubRole) {
            return interaction.reply({ content: '❌ Nie można wykryć Twojej Roli Klubu. Skontaktuj się z administratorem.', ephemeral: true });
        }

        if (subcommand === 'dodaj') {
            const roleToAssign = interaction.options.getString('role');

            if (targetUser.bot) return interaction.reply({ content: '❌ Nie możesz zapraszać botów.', ephemeral: true });

            const btnAccept = new ButtonBuilder()
                .setCustomId('btn_accept')
                .setLabel('Akceptuj')
                .setStyle(ButtonStyle.Success);

            const btnReject = new ButtonBuilder()
                .setCustomId('btn_reject')
                .setLabel('Odrzuć')
                .setStyle(ButtonStyle.Danger);

            const btnCancel = new ButtonBuilder()
                .setCustomId('btn_cancel')
                .setLabel('Anuluj')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder().addComponents(btnAccept, btnReject, btnCancel);

            const inviteMessage = `📢 ${targetUser}, czy chcesz dołączyć do **${clubRole.name}** jako **${roleToAssign}**?`;
            const response = await interaction.reply({ 
                content: inviteMessage, 
                components: [row],
                fetchReply: true 
            });

            const collector = response.createMessageComponentCollector({ 
                componentType: ComponentType.Button, 
                time: 60000 
            });

            collector.on('collect', async i => {
                if (i.customId === 'btn_accept') {
                    if (i.user.id !== targetUser.id) return i.reply({ content: '❌ Tylko zaproszony użytkownik może kliknąć Akceptuj.', ephemeral: true });
                    
                    collector.stop('accepted');
                    await handleAddRole(i, interaction.member, targetUser, clubRole, roleToAssign);
                }
                else if (i.customId === 'btn_reject') {
                    if (i.user.id !== interaction.user.id) return i.reply({ content: '❌ Tylko zapraszający może kliknąć Odrzuć.', ephemeral: true });
                    collector.stop('rejected');
                    await i.update({ content: `🚫 Zaproszenie wycofane przez ${interaction.user}.`, components: [] });
                }
                else if (i.customId === 'btn_cancel') {
                    if (i.user.id !== targetUser.id) return i.reply({ content: '❌ Tylko zaproszony użytkownik może kliknąć Anuluj.', ephemeral: true });
                    collector.stop('cancelled');
                    await i.update({ content: `👋 Zaproszenie odrzucone przez ${targetUser}.`, components: [] });
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    response.edit({ content: '⏱ Zaproszenie wygasło.', components: [] }).catch(() => {});
                }
            });
            return;
        }

        if (subcommand === 'usun') {
            await interaction.deferReply();
            const targetMemberTeams = await interaction.guild.members.fetch(targetUser.id);
            if (!targetMemberTeams.roles.cache.has(clubRole.id)) {
                return interaction.editReply(`❌ ${targetUser} nie jest w klubie **${clubRole.name}**.`);
            }

            try {
                const rolesToRemoveIds = [clubRole.id];
                ROLES.TEAM_OPTIONS.forEach(rName => {
                    const r = findRoleByName(interaction.guild, rName);
                    if (r) rolesToRemoveIds.push(r.id);
                });
                await targetMemberTeams.roles.remove(rolesToRemoveIds);
                let mainMsg = '';
                const targetMemberMain = await getMainServerMember(interaction.client, targetUser.id);
                
                if (targetMemberMain) {
                    const mainGuild = targetMemberMain.guild;
                    await mainGuild.roles.fetch();

                    const mainClubRole = findRoleByName(mainGuild, clubRole.name);
                    
                    if (mainClubRole) {
                        await targetMemberMain.roles.remove(mainClubRole);
                        mainMsg = ' & Głównego Serwera';
                    } else {
                        mainMsg = ' (Rola klubowa nie została znaleziona na serwerze głównym)';
                    }
                }

                return interaction.editReply(`👋 Usunięto ${targetUser} z **${clubRole.name}**.`);

            } catch (error) {
                console.error(error);
                return interaction.editReply(`❌ Błąd: ${error.message}`);
            }
        }
    }
};

async function handleAddRole(interaction, authorMember, targetUser, clubRole, roleName) {
    try {
        await interaction.deferUpdate(); 
        const targetMemberTeams = await interaction.guild.members.fetch(targetUser.id);
        const teamClubRole = findRoleByName(interaction.guild, clubRole.name);
        const teamSpecificRole = findRoleByName(interaction.guild, roleName);

        if (!teamSpecificRole) throw new Error(`Rola "${roleName}" nie została znaleziona na serwerze klubowym.`);

        await targetMemberTeams.roles.add([teamClubRole, teamSpecificRole]);
        let mainMsg = '';
        const targetMemberMain = await getMainServerMember(interaction.client, targetUser.id);

        if (targetMemberMain) {
            const mainGuild = targetMemberMain.guild;
            await mainGuild.roles.fetch(); 

            const mainClubRole = findRoleByName(mainGuild, clubRole.name);
            const botMemberMain = mainGuild.members.me;

            if (mainClubRole) {
                if (mainClubRole.position >= botMemberMain.roles.highest.position) {
                    console.error(`[HIERARCHY ERROR] Rola bota jest niższa niż ${mainClubRole.name} na serwerze głównym.`);
                    mainMsg = ' (❌ Rola bota jest zbyt niska na Głównym Serwerze)';
                } else {
                    await targetMemberMain.roles.add(mainClubRole);
                    mainMsg = ' & Głównego Serwera';
                }
            } else {
                mainMsg = ' (Rola klubowa nie została znaleziona na serwerze głównym)';
            }
        } else {
            mainMsg = '(Użytkownik nie jest na serwerze głównym)';
        }

        await interaction.editReply({ 
            content: `✅ **Zaakceptowano!** ${targetUser} jest teraz jako **${roleName}** w klubie **${clubRole.name}**.`, 
            components: []
        });

    } catch (error) {
        console.error(error);
        await interaction.editReply({ 
            content: `❌ Błąd podczas dodawania ról: ${error.message}`, 
            components: []
        });
    }
}
