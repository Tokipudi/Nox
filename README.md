# Nox

A Smite CCG bot made with [Sapphire](https://github.com/sapphiredev/framework).

This bot is up and running on [Pattedevelour](https://www.twitch.tv/pattedevelours)'s Discord server.

[![Discord Banner 2](https://discordapp.com/api/guilds/451391692176752650/widget.png?style=banner2)](https://discord.gg/UE5PueNHsK)

## Features

### Smite Commands

Multiple features are available, and many more are still being worked on:

* Get a god's details

![God Command](https://github.com/Tokipudi/Nox/blob/main/src/media/readme/god.gif)

* Get information about an item

![Item Command](https://github.com/Tokipudi/Nox/blob/main/src/media/readme/item.gif)

* Get the MOTD for a given day

![MOTD Command](https://github.com/Tokipudi/Nox/blob/main/src/media/readme/motd.gif)

And many more!

### Smite CCG _(Collectible Card Game)_

**The main reason why this bot was created in the first place.**

Inspired by [Mudae](https://mudae.fandom.com/wiki/Mudae_Wiki)'s Harem mini-game, this bot will let you claim cards that you will then be able to give, exchange, or fight against other players cards.

#### Roll

Each player can roll a card with the `/roll` command. To claim it, you will have to react to it with an emoji.

_**Beware, everyone can claim your roll! You need to act fast!**_

![Roll Command](https://github.com/Tokipudi/Nox/blob/main/src/media/readme/roll.gif)

#### Fight

Each player can pick one of its cards to challenge another player to a fight with the `/fight` command.

The loser's fighter will be exhausted, and will not be able to fight anymore for a certain length of time. If its owner want to fight again, they will have to use another fighter!

![Fight Command](https://github.com/Tokipudi/Nox/blob/main/src/media/readme/fight.gif)

#### Player statistics / Achievements

Check how well you're doing with the `/player` command, and try to unlock achievements to get rewards for the next season!

![Achievements Command](https://github.com/Tokipudi/Nox/blob/main/src/media/readme/achievements.gif)

### How to run

If you want to clone this project and run it on your end, here are the first steps you want to take.

**WARNING: This bot was not meant to be ran by anyone else than me. It is extremely likely that you will encounter errors when trying to make it run for the first time.**

## Pre-requisites

* Node >= 16
* A Postgresql Database
* Hirez developer API credentials (you can request them [here](https://fs12.formsite.com/HiRez/form48/secure_index.html))

## Installation

* Rename `.env.example` to `.env` and configure it properly
* Install the node application: `npm install`
* Setup the database: `npx prisma migrate`
* Compile typescript files: `npm run build`
* Start the bot: `npm start`
