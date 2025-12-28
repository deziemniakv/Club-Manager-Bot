const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { getAuthorClub } = require('../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uprawnienia')
        .setDescription('Zarządzaj uprawnieniami kanału dla swojego klubu')
        .addSubcommand(sub => 
            sub.setName('dodaj')
                .setDescription('Udziel użytkownikowi dostępu do pisania')
                .addChannelOption(opt => opt.setName('channel').setDescription('Docelowy kanał').setRequired(true))
                .addUserOption(opt => opt.setName('user').setDescription('Docelowy użytkownik').setRequired(true))
        )
        .addSubcommand(sub => 
            sub.setName('usun')
                .setDescription('Odbierz użytkownikowi dostęp do pisania')
                .addChannelOption(opt => opt.setName('channel').setDescription('Docelowy kanał').setRequired(true))
                .addUserOption(opt => opt.setName('user').setDescription('Docelowy użytkownik').setRequired(true))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const targetChannel = interaction.options.getChannel('channel');
        const targetUser = interaction.options.getUser('user');

        const { authorized, clubRole } = getAuthorClub(interaction.member);
        
        if (!authorized) {
            return interaction.reply({ content: '❌ Nie masz uprawnień (tylko Prezes/Zarząd).', ephemeral: true });
        }
        if (!clubRole) {
            return interaction.reply({ content: '❌ Klub nie został wykryty.', ephemeral: true });
        }

        
        let categoryName = null;

        if (targetChannel.type === ChannelType.GuildCategory) {
            categoryName = targetChannel.name;
        } else if (targetChannel.parent) {
            categoryName = targetChannel.parent.name;
        }

        if (categoryName !== clubRole.name) {
            return interaction.reply({ 
                content: `❌ **Odmowa dostępu.**\nMożesz zarządzać uprawnieniami tylko dla kategorii **${clubRole.name}** (i jego kanały).\nTen kanał należy do: **${categoryName || 'Brak kategorii'}**.`, 
                ephemeral: true 
            });
        }

        try {
            if (subcommand === 'dodaj') {
                await targetChannel.permissionOverwrites.edit(targetUser.id, { 
                    ViewChannel: true,
                    SendMessages: true 
                });
                return interaction.reply(`✅ Przyznano **dostęp do pisania** dla ${targetUser} w ${targetChannel}.`);
            } 
            else if (subcommand === 'usun') {
                await targetChannel.permissionOverwrites.edit(targetUser.id, { 
                    SendMessages: false 
                });
                return interaction.reply(`✅ Odebrano **dostęp do pisania** dla ${targetUser} w ${targetChannel}.`);
            }
        } catch (e) {
            console.error(e);
            return interaction.reply({ content: `❌ Błąd zmiany uprawnień: ${e.message}`, ephemeral: true });
        }
    }
};