const { REST, Routes } = require('discord.js');
require('dotenv').config();

const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('⏳ جاري رفع الأوامر...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), // لكل السيرفرات
            { body: commands }
        );

        console.log('✅ تم رفع الأوامر بنجاح!');
    } catch (error) {
        console.error(error);
    }
})();
