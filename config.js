// config.js
require('dotenv').config();

module.exports = {
    TOKEN: process.env.TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    
    // ID SERWERÓW, PAMIETAJ TEAMS ID - Komendy działają tylko na tym serwerze, GUILD ID - Serwer do otrzymania ról klubowych
    GUILD_ID_TEAMS: '1454442259364843724',
    GUILD_ID_MAIN:  '1454442006863413447',

    // Konfiguracja Nazw Ról
    // Te nazwy ról muszą dokładnie pasować do nazw ról na Discordzie
    ROLES: {
        MANAGEMENT: ['Prezes', 'Zarzad'], // Role zezwalające na uruchamianie komend
        TEAM_OPTIONS: ['Zawodnik', 'Trener', 'Zarzad'], // Role, które mogą być przypisane
        // Role systemowe do zignorowania podczas wykrywania „Roli Klubu”
        // Bot przyjmuje dowolną rolę, która zazwyczaj NIE znajduje się na tej liście, czyli nazwę klubu.
        SYSTEM_ROLES: [
            'Prezes', 'Zarzad', 'Zawodnik', 'Trener', 
            'Server Booster', '@everyone', 'Administrator', 'Bot', 'Moderator', 'Support'
        ]
    }
};