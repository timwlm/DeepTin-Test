DeepTin Bot 🐬 - Discord Bot

Ein leistungsstarker, anpassbarer Discord-Bot mit Ticketsystem, Auto-Rollen, Willkommensnachrichten und vielem mehr.

📌 Funktionen

✅ Ticket-System mit Kategorien, Benutzer- und Admin-Steuerung
✅ Auto-Role für neue Mitglieder
✅ Willkommens- & Abschiedsnachrichten mit anpassbarem GIF & Text
✅ Join-to-Create (JTC) Sprachkanäle
✅ Benutzerdefinierte Nachrichten via /say
✅ Admin-Befehle für einfache Verwaltung

⸻

🛠 Befehle & Funktionen

Befehl	Beschreibung
/ticket	Erstellt ein Ticket-Panel
/autorole	Setzt bis zu 10 Auto-Rollen für neue Mitglieder
/welcome	Legt den Willkommenskanal mit GIF und Text fest
/say	Sendet eine Nachricht oder ein Embed in einen Kanal
/change	Ändert den Server-spezifischen Nickname des Bots
/jtc	Erstellt Join-to-Create Sprachkanäle
/helo   Für eine vollständige Übersicht über die Befehle

⸻

📝 Konfigurationsdateien

🔹 config/autoroleSettings.json

Speichert Auto-Rollen für jeden Server.

{
    "GUILD_ID": {
        "roles": ["ROLE_ID_1", "ROLE_ID_2"]
    }
}

🔹 config/welcomeSettings.json

Speichert den Willkommenskanal & Einstellungen.

{
    "GUILD_ID": {
        "welcomeChannelId": "CHANNEL_ID",
        "welcomeText": "Hey {member}, willkommen auf unserem Server!",
        "welcomeGif": "GIF_URL"
    }
}

⸻

📌 To-Do & Verbesserungen

✅ Bugfixes & Performance-Optimierung
🔜 Musik-Integration (Lavalink, Discord.js Voice)
🔜 Dynamische Auto-Moderation mit KI-Filter

⸻

💡 Mitwirken!

-> Gerne dem Discord joinen und sich bewerben: https://discord.gg/uedU8ds2rX

⸻

👨‍💻 Entwickler
	•	Lennard ( lennard.son ) – Hauptentwickler
	•	Tim ( truly.tim_ ) – Hauptentwickler
