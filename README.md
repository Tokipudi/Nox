# Nox
A Smite bot made with [Sapphire](https://github.com/sapphiredev/framework)

**This is still a Work In Progress!**

![God Command](https://github.com/Tokipudi/Nox/blob/main/src/media/readme/god.gif)

## Pre-requisites
* Node >= 16
* A Postgresql Database
* Hirez developer API credentials (you can request them [here](https://fs12.formsite.com/HiRez/form48/secure_index.html))

## Installation
* Rename `.env.example` to `.env` and configure it properly
* Install the node application: `npm install`
* Setup the database: `npx prisma migrate dev --name init`
* Compile typescript files: `npm run build`
* Start the bot: `npm start`

## Features
### Smite Commands
Multiple features are available, and many more are still being worked on:
* Get a god's details
* Get Smite's server status
* Get the current MOTD _(Match Of The Day)_
* etc...

### Smite CCG _(Collectible Card Game)_
The main reason why this bot was created in the first place.

Inspired by [Mudae](https://mudae.fandom.com/wiki/Mudae_Wiki)'s Harem mini-game, this bot will let you claim cards that you will then be able to give, exchange, or fight against other players cards.

#### Roll
Each player can roll a card with the `roll` command. To claim it, you will have to react to it with an emoji.

_**Beware, everyone can claim your roll! You need to act fast!**_

![Roll Command](https://github.com/Tokipudi/Nox/blob/main/src/media/readme/roll.gif)

#### Fight
Each player can pick one of its cards to challenge another player to a fight with the `fight` command.

The loser's fighter will be exhausted, and will not be able to fight anymore for a certain length of time. If its owner want to fight again, they will have to use another fighter!

![Fight Command](https://github.com/Tokipudi/Nox/blob/main/src/media/readme/fight.gif)
