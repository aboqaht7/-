const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// تحميل الأوامر
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data && command.slashExecute) {
        client.commands.set(command.data.name, command);
    }
}

client.once(Events.ClientReady, () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// 🎯 التعامل مع كل التفاعلات
client.on(Events.InteractionCreate, async interaction => {
    const db = require('./db'); // عدل المسار إذا مختلف

    try {

        // =========================
        // 🟢 أوامر السلاش
        // =========================
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            await command.slashExecute(interaction, db);
        }

        // =========================
        // 🔽 Select Menu (السرقات)
        // =========================
        else if (interaction.isStringSelectMenu()) {

            if (interaction.customId === 'robbery_menu') {
                const robberyId = interaction.values[0];

                // 🔹 جلب بيانات السرقة
                const robbery = await db.getRobberyById(robberyId);
                if (!robbery) {
                    return interaction.reply({
                        content: '❌ السرقة غير موجودة',
                        flags: 64
                    });
                }

                // 🔹 نسبة النجاح (تقدر تعدلها)
                const successChance = 0.6;
                const success = Math.random() < successChance;

                if (success) {
                    const reward = Math.floor(
                        Math.random() * (robbery.max_money - robbery.min_money + 1)
                    ) + robbery.min_money;

                    await db.addMoney(interaction.user.id, reward);

                    return interaction.reply({
                        content: `💰 نجحت السرقة!\nحصلت على **${reward} ريال**`,
                        flags: 64
                    });
                } else {
                    const fine = Math.floor(robbery.min_money / 2);

                    await db.removeMoney(interaction.user.id, fine);

                    return interaction.reply({
                        content: `🚓 انمسكت!\nدفعت غرامة **${fine} ريال**`,
                        flags: 64
                    });
                }
            }
        }

    } catch (error) {
        console.error(error);

        if (!interaction.replied) {
            await interaction.reply({
                content: '❌ صار خطأ!',
                flags: 64
            });
        }
    }
});

client.login(process.env.TOKEN);
