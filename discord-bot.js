var kill = require("tree-kill");
var child_process = require("child_process");
var discord = require("discord.js");

const { prefix, token } = require("./config.json");

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

var {games} = requireUncached("./config.json")
var bot = new discord.Client();
require('discord-buttons')(bot);
var optionsCount = 0;

const disbut = require("discord-buttons");

let select = null
reloadGames();



var latestMessageId = null;

function reloadGames() {
    select = new disbut.MessageMenu()
        .setID("menuID")
        .setPlaceholder("Pick a server to run.")
        .setMaxValues(1)
        .setMinValues(1);

    var {games} = requireUncached("./config.json");
    this.games = games;
    games.forEach((game) => {
        let option = new disbut.MessageMenuOption()
            .setLabel(game["label"])
            .setEmoji(game["emoji"])
            .setValue(game["value"])
            .setDescription(game["description"]);
        select.addOption(option);
})
}

var helpEmbed = new discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Helpful information")
    .setURL('https://risingthumb.xyz/Donation')
    .setAuthor("RisingThumb", "https://git.risingthumb.xyz/avatars/70607f1b387ddf9f7822713f8efe97be?size=580", "https://risingthumb.xyz/Donation")
    .setDescription("A list of Commands available...")
    .addFields(
        {name: ".help", value: "This helpful page."},
        {name: ".gaming", value: "A drop down menu for servers that can be run."},
        {name: ".reload", value: "Reload config. Probably not needed by you."},
        {name: ".kill", value: "Kills any currently hosted servers. Kindly kill at the end of a session to avoid consuming resources :^)"}
    )
    .setTimestamp()
	.setFooter(":^)", "https://git.risingthumb.xyz/avatars/70607f1b387ddf9f7822713f8efe97be?size=580");

function killAllServices() {
    for (var i = 0; i < games.length; i++) {
        child_process.exec("sudo systemctl stop "+games[i]["value"]+".service");
    }
}

bot.on("message", msg => {
    if (msg.content == `${prefix}help`) {
        msg.channel.send(helpEmbed);
    }
    if (msg.content == `${prefix}gaming`) {
        latestMessageId = msg.author.id;
        msg.channel.send("Options", select);
    }
    if (msg.content == `${prefix}kill`) {
        killAllServices();
        msg.channel.send("All servers have been closed! Thanks for playing!");
    }
    if (msg.content == `${prefix}reload`) {
        reloadGames();
        msg.channel.send("Reloaded config!");
    }
    if (msg.content.includes(`${prefix}roll`)) {
        let rolling = msg.content.split(" ");
        let die = rolling[1];
        let diceToPrint = []
        if (die) {
            let parts = die.split("d");
            let numberOfDice = parseInt(parts[0]);
            if (parts.length !== 2) return;
            let facesOfDie = parseInt(parts[1]);
            if (numberOfDice > 33) {
                msg.channel.send("No die rolled. I will not roll more than 33 Dice...")
                return;
            }
            if (numberOfDice && facesOfDie) {
                for (let i = 0; i < numberOfDice; i++) {
                    var roll = Math.floor(parts[1]*Math.random())+1;
                    diceToPrint.push(roll);
                }
            }
            else {
                msg.channel.send("No die rolled")
                return;
            }
            let stringOfDice = "";
            for (let diceRolled of diceToPrint) {
                stringOfDice += `Rolling die. Rolled a ${diceRolled}\n`;
            }
            msg.channel.send(stringOfDice);
        }
        else {
            msg.channel.send("No die rolled")
        }
    }
});

bot.on('clickMenu', async (menu) => {
    if (menu.clicker.user.id == latestMessageId) {
        killAllServices();
        child_process.exec("sudo systemctl start "+menu.values[0]+".service");
        menu.channel.send("Starting "+menu.values[0]+". Please don't spam starting it up.");
    }
    else {
        menu.channel.message("Not the same user who originally ran the command. Run the command yourself.");
    }
    menu.message.delete();
    menu.reply.defer();

})

bot.login(token);

