const { ROLES, GUILD_ID_MAIN, GUILD_ID_TEAMS } = require('./config');
function getAuthorClub(member) {
    if (!member) return null;

    const hasPerms = member.roles.cache.some(r => ROLES.MANAGEMENT.includes(r.name));
    if (!hasPerms) return { authorized: false, clubRole: null };

    const clubRole = member.roles.cache.find(r => !ROLES.SYSTEM_ROLES.includes(r.name));

    if (!clubRole) return { authorized: true, clubRole: null };

    return { authorized: true, clubRole: clubRole };
}

async function getMainServerMember(client, userId) {
    try {
        const { GUILD_ID_MAIN } = require('./config');
        console.log(`[DEBUG] Pobieranie głównej gildii: ${GUILD_ID_MAIN}`);
        
        const mainGuild = await client.guilds.fetch(GUILD_ID_MAIN);
        if (!mainGuild) {
            console.error('[ERROR] Bot nie może znaleźć serwera głównego. Sprawdź ID lub zaproszenie bota.');
            return null;
        }

        console.log(`[DEBUG] Gildia główna znaleziona: ${mainGuild.name}`);
        const member = await mainGuild.members.fetch(userId);
        
        if (!member) {
            console.error(`[ERROR] Użytkownik ${userId} nie znajduje się na Głównej Gildii.`);
        } else {
            console.log(`[DEBUG] Znaleziono użytkownika na serwerze głównym: ${member.user.tag}`);
        }

        return member;
    } catch (error) {
        console.error(`[ERROR] Nie udało się pobrać członka na serwerze głównym:`, error.message);
        return null;
    }
}
module.exports = { getAuthorClub, getMainServerMember, findRoleByName: require('./utils').findRoleByName || ((g, n) => g.roles.cache.find(r => r.name === n)) };

function findRoleByName(guild, roleName) {
    return guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
}

module.exports = { getAuthorClub, getMainServerMember, findRoleByName };