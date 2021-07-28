var kill = require('tree-kill');
var child_process = require('child_process');
var discord = require("discord.js");

const { prefix, token } = require('./config.json');

var bot = new discord.Client();
require('discord-buttons')(bot);

const disbut = require("discord-buttons");
var games = [
    {
        "label": "SRB2Kart Server",
        "value": "srb2kart", // Name should be the name of the service excluding the .service part.
        "emoji": "🏎",
        "description" : "SRB2Kart"
    },
    {
        "label": "TTT Server",
        "value": "ttt", // Name should be the name of the service excluding the .service part.
        "emoji": "💀",
        "description" : "Double barreled Shotgun Acquired"
    }
]

let select = new disbut.MessageMenu()
    .setID("menuID")
    .setPlaceholder("Pick a server to run.")
    .setMaxValues(1)
    .setMinValues(1);

games.forEach((game) => {
    let option = new disbut.MessageMenuOption()
        .setLabel(game["label"])
        .setEmoji(game["emoji"])
        .setValue(game["value"])
        .setDescription(game["description"]);
    select.addOption(option);
})

var latestMessageId = null;

var helpEmbed = new discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Helpful information")
    .setURL('https://risingthumb.xyz/Donation')
    .setAuthor("RisingThumb", "https://git.risingthumb.xyz/avatars/70607f1b387ddf9f7822713f8efe97be?size=580", "https://risingthumb.xyz/Donation")
    .setDescription("A list of Commands available...")
    .addFields(
        {name: ".help", value: "This helpful page."},
        {name: ".gaming", value: "A drop down menu for servers that can be run."}
    )
    .setTimestamp()
	.setFooter(":^)", "https://git.risingthumb.xyz/avatars/70607f1b387ddf9f7822713f8efe97be?size=580");

bot.on("message", msg => {
    if (msg.content == `${prefix}help`) {
        msg.channel.send(helpEmbed);
    }
    if (msg.content == `${prefix}gaming`) {
        latestMessageId = msg.author.id;
        msg.channel.send("Options", select);
    }
});

bot.on('clickMenu', async (menu) => {
    if (menu.clicker.user.id == latestMessageId) {
        for (var i = 0; i < games.length; i++) {
            child_process.exec("sudo systemctl stop "+games[i]["value"]+".service");
        }
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

