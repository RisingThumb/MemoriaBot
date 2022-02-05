const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music_play')
        .setDescription('Plays Music')
        .addStringOption(option =>
            option.setName('music_play')
                .setDescription('Music to play')
                .setRequired(true))
}
