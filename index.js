const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token, games } = require('./config.json');
const child_process = require("child_process");
const  { DisTube } = require("distube");
const { SoundCloudPlugin } = require("@distube/soundcloud")
const { SpotifyPlugin } = require("@distube/spotify")

const client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILD_VOICE_STATES", "GUILD_MESSAGES"] });
client.commands = new Collection();

const distube = new DisTube(client, {
    searchSongs: 10,
    searchCooldown: 30,
    leaveOnEmpty: true,
    leaveOnFinish: false,
    leaveOnStop: false,
    plugins: [new SoundCloudPlugin(), new SpotifyPlugin()]
})
const prefix = '!';

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
    if (commandName === 'music_play') {
        distube.play(interaction.member.voice.channel, interaction.options.getString('music_play'),
        {member: interaction.member,
        textChannel: interaction.channel}
        );
        await interaction.reply({content: 'Playing some music!', ephemeral: true});
        return;
    }

    if (commandName === 'music_loop') {
        const mode = distube.setRepeatMode(interaction);
        await interaction.channel.send(`Set repeat mode to \`${mode ? (mode === 2 ? "All Queue" : "This Song") : "Off"}\``)
        await interaction.reply({content: 'Looping mode switched.', ephemeral: true});
        return;
    }

    if (commandName === 'music_queue') {
        const queue = distube.getQueue(interaction.guildId);
        if (!queue) {
            interaction.channel.send("Nothing playing right now!")
        } else {
            const mode = queue.repeatMode;
            let message = "off"
            if (mode === 1) message = "Repeating single song";
            if (mode === 2) message = "Repeating queue";
            interaction.channel.send(
                `Current queue:\n${queue.songs
                    .map((song, id) => `**${id ? id : "Playing"}**. ${song.name} - \`${song.formattedDuration}\``)
                    .slice(0, 10)
                    .join("\n")}\nLooping mode: ${message}`
            )
        }
        await interaction.reply({content: 'Queue listed.', ephemeral: true});
        return;
    }

    if (commandName === 'music_resume') {
        const queue = distube.getQueue(interaction.guildId);
        if (queue) {
            distube.resume(interaction.guildId)
            await interaction.reply({content: 'Resuming.', ephemeral: true});
            return;
        }
        await interaction.reply({content: 'Nothing to resume.', ephemeral: true});
        return;
    }

    if (commandName === 'music_pause') {
        const queue = distube.getQueue(interaction.guildId);
        if (queue) {
            distube.pause(interaction.guildId)
            await interaction.reply({content: 'Pausing.', ephemeral: true});
            return;
        }
        await interaction.reply({content: 'Nothing to pause.', ephemeral: true});
        return;
    }

    if (commandName === 'music_skip') {
        const queue = distube.getQueue(interaction.guildId);
        if (queue && queue.songs.length > 1) {
            distube.skip(interaction.guildId);
            await interaction.reply({content: 'Skipping.', ephemeral: true});
            return;
        }
        if (queue && queue.songs.length === 1) {
            distube.stop(interaction.guildId);
            await interaction.reply({content: 'Last song in queue. Stopping', ephemeral: true});
            return;
        }
        await interaction.reply({content: "Can't skip, no song up next", ephemeral: true});
        return;
    }

    if (commandName === 'music_stop') {
        distube.stop(interaction.guildId)
        await interaction.reply({content: 'Stopping.', ephemeral: true});
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


distube
    .on("playSong", (queue, song) =>
        queue.textChannel.send(
            `Playing \`${song.name}\` - \`${song.formattedDuration}\``
        )
    )
    .on("addSong", (queue, song) =>
        queue.textChannel.send(`Added ${song.name} - \`${song.formattedDuration}\` to the queue`)
    )
    .on("addList", (queue, playlist) =>
        queue.textChannel.send(
            `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue}`
        )
    )
    .on("error", (textChannel, e) => {
        console.error(e)
        textChannel.send(`An error encountered: ${e.slice(0, 2000)}`)
    })
    .on("finish", queue => queue.textChannel.send("Finish queue!"))
    .on("finishSong", queue => queue.textChannel.send("Finish song!"))
    .on("disconnect", queue => queue.textChannel.send("Disconnected!"))
    .on("empty", queue => queue.textChannel.send("Empty!"))
    // DisTubeOptions.searchSongs > 1
    .on("searchResult", (message, result) => {
        let i = 0
        message.channel.send(
            `**Choose an option from below**\n${result
                .map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``)
                .join("\n")}\n*Enter anything else or wait 30 seconds to cancel*`
        )
    })
    .on("searchCancel", message => message.channel.send(`Searching canceled`))
    .on("searchInvalidAnswer", message => message.channel.send(`Invalid number of result.`))
    .on("searchNoResult", message => message.channel.send(`No result found!`))
    .on("searchDone", () => {})

client.login(token);
