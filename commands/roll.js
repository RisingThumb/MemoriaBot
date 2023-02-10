const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls a die in format xdy+z')
        .addStringOption(option =>
            option.setName('dice_roll')
                .setDescription('format xdy+z, example 3d6+5')
                .setRequired(true))
}
