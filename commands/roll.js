const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls a die')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The number of dice to roll.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('dice')
                .setDescription('The number of faces on the dice.')
                .setRequired(true))
}
