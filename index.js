const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const child_process = require("child_process");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}


function killAllServices() {
    for (var i = 0; i < games.length; i++) {
        child_process.exec("sudo systemctl stop "+games[i]["value"]+".service");
    }
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
        return;
	}
    if (commandName === 'server') {
        let serverValue = interaction.options.getString('server');
        killAllServices();
        child_process.exec("sudo systemctl start "+serverValue+".service");
        await interaction.reply("Starting "+serverValue+". Please be patient...")
        return;
    }
    if (commandName === 'stop') {
        killAllServices();
        await interaction.reply("Thank you for closing the server and preventing resources going to waste :^)");
        return;
    }

    if (commandName === 'roll') {
        let number = interaction.options.getInteger('number');
        let dice = interaction.options.getInteger('dice');
        if (number > 33) {
            await interaction.reply("Too many dice rolled!");
            return;
        }
        if (number < 0) {
            await interaction.reply("Less than 0 dice rolled? Huh??");
            return;
        }
        if (dice < 0) {
            await interaction.reply("The dice you are trying to roll doesn't exist in reality...");
            return;
        }
        diceToPrint = [];
        for (let i = 0; i < number; i++) {
            var roll = Math.floor(dice * Math.random()) + 1;
            diceToPrint.push(roll);
        }
        let stringDice = "";
        for (let diceRolled of diceToPrint) {
            stringDice += `Rolled a ${diceRolled} with a d${dice}\n`;
        }
        await interaction.reply(stringDice);
        return;
    }
});

client.login(token);
