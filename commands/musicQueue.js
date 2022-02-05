const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music_queue')
        .setDescription('Lists queue in current channel')
}
