# 🏆 Club Management Bot

Zaawansowany bot Discord stworzony w oparciu o **discord.js v14**, służący do zarządzania drużynami i klubami do federacji twojej na dwóch zsynchronizowanych serwerach Discord.

## 🚀 Funkcje

### 🏢 Synchronizacja Między Serwerami
*   **Serwer Drużynowy:** Zarządza pełną strukturą (`Rola Klubowa` + role `Zawodnik`/`Trener`/`Zarzad`).
*   **Serwer Główny:** Automatycznie synchronizuje tylko `Rolę Klubową` (ignoruje wewnętrzne role funkcyjne).
*   **Logika Cross-Server:** Zmiany wprowadzone na Serwerze Drużynowym są natychmiast odzwierciedlane na Serwerze Głównym.

### 🛡️ Bezpieczny System Klubowy
*   **Kontrola Dostępu:** Tylko użytkownicy z rolą `Prezes` lub `Zarzad` mogą używać komend.
*   **Ścisła Izolacja Klubów:** Prezes "Klubu A" **nie może** zarządzać członkami ani kanałami "Klubu B".
*   **Automatyczne Wykrywanie:** Bot sam rozpoznaje, do jakiego klubu należy autor komendy na podstawie jego ról.

### 🎮 Komendy

#### `/team dodaj {user} {role}`
*   Zaprasza użytkownika do klubu.
*   **Interaktywny proces:** Wysyła publiczne zaproszenie z przyciskami **Akceptuj**, **Odrzuć** oraz **Anuluj**.
*   **Weryfikacja:** Role są nadawane dopiero po kliknięciu przycisku akceptacji przez użytkownika.

#### `/team usun {user}`
*   Usuwa członka z klubu.
*   Zdejmuje role zarówno na serwerze Drużynowym, jak i Głównym.

#### `/zmien role {user} {role}`
*   Zmienia wewnętrzną rolę członka (np. z `Player` na `Coach`).
*   Działa tylko w obrębie tego samego klubu.

#### `/uprawnienia {dodaj/usun} {channel} {user}`
*   Nadaje lub odbiera uprawnienia do pisania na konkretnych kanałach.
*   **Bezpieczeństwo:** Pozwala zarządzać tylko kanałami znajdującymi się w kategorii o nazwie identycznej z nazwą klubu.

#### `/wzmianka`
*   Oznacza (pinguje) całą rolę klubową (tylko dla Prezesa/Zarządu).

#### `/role`
*   Wyświetla listę ról na serwerze wraz z licznikami przypisanych osób.

---

## 🛠️ Instalacja i Konfiguracja

### 1. Wymagania
*   Node.js w wersji 16.9.0 lub nowszej
*   Dwa serwery Discord (Główny i Drużynowy)

### 2. Klonowanie i Instalacja
```bash
git clone https://github.com/deziemniakv/Club-Manager-Bot.git
cd Club-Manager-Bot
npm install
```

### 3. Konfiguracja
Zmień nazwę pliku `.env.example` na `.env` (lub go utwórz) i dodaj swoje dane:
```env
TOKEN=twoj_token_bota
CLIENT_ID=twoje_id_aplikacji
```

Otwórz plik `config.js` i skonfiguruj ID Serwerów oraz Nazwy Ról:
```javascript
module.exports = {
    // ...
    GUILD_ID_TEAMS: 'ID_SERWERA_DRUZYNOWEGO',
    GUILD_ID_MAIN:  'ID_SERWERA_GLOWNEGO',
    // ...
};
```

### 4. Konfiguracja Discord Developer Portal
1.  Wejdź na [Discord Developer Portal](https://discord.com/developers/applications).
2.  Wybierz swoją aplikację -> **Bot**.
3.  Przewiń do sekcji **Privileged Gateway Intents**.
4.  Włącz opcję **Server Members Intent**.
5.  Zapisz zmiany (Save Changes).

### 5. Uruchomienie Bota
Najpierw zarejestruj komendy slash:
```bash
node deploy-commands.js
```
Następnie uruchom bota:
```bash
node index.js
```

---

## ⚠️ Ważne Wymagania

### Hierarchia Ról
Na **OBU** serwerach rola Bota musi znajdować się **wyżej** na liście ról (w Ustawieniach Serwera) niż wszystkie role Klubowe oraz role funkcyjne (`Prezes`, `Zawodnik`, itp.).

### Konwencja Nazewnictwa
Aby system uprawnień działał bezpiecznie, **Nazwa Roli Klubowej** musi być identyczna z **Nazwą Kategorii** kanałów.
*   Rola: `Klub FC`
*   Kategoria: `Klub FC`

### Nazwy Ról
Bot opiera się na konkretnych nazwach ról zdefiniowanych w `config.js` (Wielkość liter ma znaczenie):
*   `Prezes`
*   `Zarzad`
*   `Trener`
*   `Zawodnik`

---

## 📂 Struktura Projektu
```text
/
├── commands/         # Logika komend Slash
│   ├── club.js       # /team (dodawanie/usuwanie)
│   ├── changeRole.js # /zmien
│   ├── permissions.js# /uprawnienia
│   ├── mention.js    # /wzmianka
│   └── roles.js      # /role
├── config.js         # Stałe i ID
├── utils.js          # Funkcje pomocnicze (wykrywanie klubu, fetch serwera głównego)
├── index.js          # Główny plik startowy
└── deploy-commands.js# Rejestrator komend
```

## 📝 Licencja
Ten projekt jest dostępny na licencji [MIT](LICENSE).
```
