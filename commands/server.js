const { SlashCommandBuilder } = require('@discordjs/builders');
const { games } = require('../config.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Start a server')
        .addStringOption(option =>{
            option.setName('server')
                .setDescription('What server to start')
                .setRequired(true)
            for (const game of games) {
                option.addChoice(game.label, game.value);
            }
            return option;
        })
}
