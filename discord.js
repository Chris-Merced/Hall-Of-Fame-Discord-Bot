require('dotenv').config();

const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
    console.log('Bot is online!')
})


const postMessages = new Set()

client.on('messageReactionAdd', async (reaction, user) => {
    try {
        
        if (reaction.partial) {
            await reaction.fetch();
        }
        if (user.partial) {
            await user.fetch();
        }

        console.log("message reacted by", user.tag);﻿
        console.log("reaction emoji:", reaction.emoji.name);

        
        if (reaction.emoji.name === '⬆️' && reaction.count === 3) {

            console.log("Reaction Occured")
            if (user.bot || postMessages.has(reaction.message.id)) {
                console.log("reaction ignored")
                return;
            };
            postMessages.add(reaction.message.id);

            const message = reaction.message;

            console.log("Reaction happened on message:", message.content);

            
            let hallOfFameChannel = message.guild.channels.cache.find(channel => channel.name === 'hall-of-fame');
            
            
            if (hallOfFameChannel) {
                
                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() }) // Show user's avatar and tag
                    .setDescription(message.content || '[No message content]')
                    .setFooter({ text: `Posted in #${message.channel.name}` })
                    .setTimestamp(message.createdAt);

                
                if (message.attachments.size > 0) {
                    const attachment = message.attachments.first(); 
                    if (attachment && attachment.contentType.startsWith('image')) {
                        embed.setImage(attachment.url); 
                    }
                }
                hallOfFameChannel.send({
                    content: `| ${message.url} |`,
                    embeds: [embed]
                })
            }
        }
    } catch (error) {
        console.error('Error fetching reaction:', error);
    }
})

client.on('guildCreate', guild => {
    guild.channels.create({
        name: 'hall-of-fame',
        type: ChannelType.GuildText,
        topic: "This is where the greatest posts go to live!",
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [
                    PermissionsBitField.Flags.SendMessages
                ],
            },
            {
                id: guild.members.me.id,
                allow: [
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ManageMessages,
                    PermissionsBitField.Flags.ManageChannels
                ],
            },
        ]
    }).then(channel => {
        console.log('New Channel Created');
        channel.send('Welcome to your new Hall of Fame! This is where all highly upvoted posts in your main channels go!');
    }).catch(console.error);
} )

client.on('messageCreate', message => {
    console.log("message created")
    if (message.content === '!ping') {
        message.channel.send('Pong!')
    }
});

client.login(process.env.BOT_TOKEN)