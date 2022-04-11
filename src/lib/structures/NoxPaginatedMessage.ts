import { actionIsButtonOrMenu, createPartitionedMessageRow, isGuildBasedChannel, isMessageButtonInteraction, isMessageInstance, PaginatedMessage, PaginatedMessageAction, PaginatedMessagePage, runsOnInteraction, safelyReplyToInteraction } from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";
import { isFunction, isNullish, isObject } from "@sapphire/utilities";
import { ButtonInteraction, CommandInteraction, Constants, ContextMenuInteraction, Intents, InteractionCollector, Message, MessageButton, MessageComponentInteraction, MessageOptions, MessageSelectMenu, SelectMenuInteraction, TextBasedChannel, User, WebhookEditMessageOptions } from "discord.js";

/**
 * Taken from Skyra
 * @see https://github.com/skyra-project/skyra/blob/main/src/lib/structures/HelpPaginatedMessage.ts
 */
export class NoxPaginatedMessage extends PaginatedMessage {
    /** The response we send when someone gets into an invalid flow */
    #thisMazeWasNotMeantForYouContent = { content: "This maze wasn't meant for you...what did you do." };

    /**
 * Executes the {@link PaginatedMessage} and sends the pages corresponding with {@link PaginatedMessage.index}.
 * The handler will start collecting message component interactions.
 *
 * @remark Please note that for {@link PaginatedMessage} to work in DMs to your client, you need to add the `'CHANNEL'` partial to your `client.options.partials`.
 * Message based commands can always be used in DMs, whereas Chat Input interactions can only be used in DMs when they are registered globally.
 *
 * @param messageOrInteraction The message or interaction that triggered this {@link PaginatedMessage}.
 * Generally this will be the command message or an interaction
 * (either a {@link CommandInteraction}, a {@link ContextMenuInteraction}, a {@link SelectMenuInteraction} or a {@link ButtonInteraction}),
 * but it can also be another message from your client, i.e. to indicate a loading state.
 *
 * @param target The user who will be able to interact with the buttons of this {@link PaginatedMessage}.
 * If `messageOrInteraction` is an instance of {@link Message} then this defaults to {@link Message.author messageOrInteraction.author},
 * and if it is an instance of {@link CommandInteraction} then it defaults to {@link CommandInteraction.user messageOrInteraction.user}.
 */
    public async run(
        messageOrInteraction: Message | CommandInteraction | ContextMenuInteraction | SelectMenuInteraction | ButtonInteraction,
        target?: User
    ): Promise<this> {
        // If there is no channel then exit early and potentially emit a warning
        if (!messageOrInteraction.channel) {
            const isInteraction = runsOnInteraction(messageOrInteraction);
            let shouldEmitWarning = this.emitPartialDMChannelWarning;

            // If we are to emit a warning,
            //   then check if a warning was already emitted,
            //   in which case we don't want to emit a warning.
            if (shouldEmitWarning && this.hasEmittedPartialDMChannelWarning) {
                shouldEmitWarning = false;
            }

            // If we are to emit a warning,
            //   then check if the interaction is an interaction based command,
            //   and check if the client has the `'CHANNEL'` partial,
            //   in which case we don't want to emit a warning.
            if (shouldEmitWarning && isInteraction && messageOrInteraction.client.options.partials?.includes('CHANNEL')) {
                shouldEmitWarning = false;
            }

            // IF we are to emit a warning,
            //   then check if the interaction is a message based command,
            //   and check if the client has the 'CHANNEL' partial,
            //   and check if the client has the 'DIRECT_MESSAGE' intent',
            //   in which case we don't want to emit a warning.
            if (
                shouldEmitWarning &&
                !isInteraction &&
                messageOrInteraction.client.options.partials?.includes('CHANNEL') &&
                new Intents(messageOrInteraction.client.options.intents).has(Intents.FLAGS.DIRECT_MESSAGES)
            ) {
                shouldEmitWarning = false;
            }

            // If we should emit a warning then do so.
            if (shouldEmitWarning) {
                process.emitWarning(
                    [
                        'PaginatedMessage was initiated in a DM channel without the client having the required partial configured.',
                        'If you want PaginatedMessage to work in DM channels then make sure you start your client with "CHANNEL" added to "client.options.partials".',
                        'Furthermore if you are using message based commands (as opposed to application commands) then you will also need to add the "DIRECT_MESSAGE" intent to "client.options.intents"',
                        'If you do not want to be alerted about this in the future then you can disable this warning by setting "PaginatedMessage.emitPartialDMChannelWarning" to "false", or use "setEmitPartialDMChannelWarning(false)" before calling "run".'
                    ].join('\n'),
                    {
                        type: 'PaginatedMessageRunsInNonpartialDMChannel',
                        code: 'PAGINATED_MESSAGE_RUNS_IN_NON_PARTIAL_DM_CHANNEL'
                    }
                );
                this.hasEmittedPartialDMChannelWarning = true;
            }

            await safelyReplyToInteraction({
                messageOrInteraction,
                interactionEditReplyContent: this.#thisMazeWasNotMeantForYouContent,
                interactionReplyContent: { ...this.#thisMazeWasNotMeantForYouContent, ephemeral: true },
                componentUpdateContent: this.#thisMazeWasNotMeantForYouContent,
                messageMethod: 'reply',
                messageMethodContent: this.#thisMazeWasNotMeantForYouContent
            });

            return this;
        }

        // Assign the target based on whether a Message or CommandInteraction was passed in
        target ??= runsOnInteraction(messageOrInteraction) ? messageOrInteraction.user : messageOrInteraction.author;

        // Try to get the previous PaginatedMessage for this user
        const paginatedMessage = PaginatedMessage.handlers.get(target.id);

        // If a PaginatedMessage was found then stop it
        paginatedMessage?.collector?.stop();

        // If the message was sent by a bot, then set the response as this one
        if (runsOnInteraction(messageOrInteraction)) {
            if (messageOrInteraction.user.bot && messageOrInteraction.user.id === messageOrInteraction.client.user?.id) {
                this.response = messageOrInteraction;
            }
        } else if (messageOrInteraction.author.bot && messageOrInteraction.author.id === messageOrInteraction.client.user?.id) {
            this.response = messageOrInteraction;
        }

        await this.resolvePagesOnRun();

        // Sanity checks to handle
        if (!this.messages.length) container.logger.debug(new Error('There are no messages.'));
        if (!this.actions.size) throw new Error('There are no actions.');

        await this.setUpMessage(messageOrInteraction, target);
        this.setUpCollector(messageOrInteraction.channel, target);

        const messageId = this.response!.id;

        if (this.collector) {
            this.collector.once('end', () => {
                PaginatedMessage.messages.delete(messageId);
                PaginatedMessage.handlers.delete(target!.id);
            });

            PaginatedMessage.messages.set(messageId, this);
            PaginatedMessage.handlers.set(target.id, this);
        }

        return this;
    }

    protected async setUpMessage(
        messageOrInteraction: Message | CommandInteraction | ContextMenuInteraction | SelectMenuInteraction | ButtonInteraction,
        targetUser: User
    ): Promise<void> {
        // Get the current page
        let page = this.messages[this.index]!;

        // If the page is a callback function such as with `addAsyncPageEmbed` then resolve it here
        page = isFunction(page) ? await page(this.index, this.pages, this) : page;

        // Merge in the advanced options
        page = { ...page, ...(this.paginatedMessageData ?? {}) };

        // If we do not have more than 1 page then there is no reason to add message components
        if (this.pages.length > 1) {

            const messageComponents: (MessageButton | MessageSelectMenu)[] = [];
            for (const interaction of this.actions.values() as IterableIterator<PaginatedMessageAction>) {
                if (isMessageButtonInteraction(interaction)) {
                    messageComponents.push(new MessageButton(interaction));
                } else if (interaction.type === Constants.MessageComponentTypes.SELECT_MENU && interaction.customId === '@sapphire/paginated-messages.goToPage') {
                    if (this.pages.slice(25).length) { // Select page Menu by chunks to fit in 25 options only
                        const options = [];
                        const chunkSize = Math.round(this.pages.length / 25);
                        for (let i = 0; i < this.pages.length; i += chunkSize) {
                            if (options.length >= 25) break;

                            options.push({
                                label: `Page ${(i + 1).toString()}`,
                                value: (i).toString()
                            });
                        }
                        messageComponents.push(
                            new MessageSelectMenu({
                                options: options,
                                ...interaction
                            })
                        );
                    } else { // Standard Select Menu
                        messageComponents.push(
                            new MessageSelectMenu({
                                options: await Promise.all(
                                    this.pages.slice(0, 25).map(async (_, index) => ({
                                        ...(await this.selectMenuOptions(index + 1, {
                                            author: targetUser,
                                            channel: messageOrInteraction.channel,
                                            guild: isGuildBasedChannel(messageOrInteraction.channel) ? messageOrInteraction.channel.guild : null
                                        })),
                                        value: index.toString()
                                    }))
                                ),
                                ...interaction
                            })
                        );
                    }
                }
            }

            page.components = createPartitionedMessageRow(messageComponents);
        } else if (this.pages.length === 1) {
            const messageComponents: (MessageButton | MessageSelectMenu)[] = [];
            for (const interaction of this.actions.values() as IterableIterator<PaginatedMessageAction>) {
                if (isMessageButtonInteraction(interaction) && interaction.customId.startsWith('update-paginated-message')) {
                    messageComponents.push(new MessageButton(interaction));
                }
            }

            page.components = createPartitionedMessageRow(messageComponents);
        }

        if (this.pages.length) {
            if (this.response) {
                if (runsOnInteraction(this.response)) {
                    if (this.response.replied || this.response.deferred) {
                        await this.response.editReply(page as WebhookEditMessageOptions);
                    } else {
                        await this.response.reply(page as WebhookEditMessageOptions);
                    }
                } else if (isMessageInstance(this.response)) {
                    await this.response.edit(page as WebhookEditMessageOptions);
                }
            } else if (runsOnInteraction(messageOrInteraction)) {
                if (messageOrInteraction.replied || messageOrInteraction.deferred) {
                    this.response = await messageOrInteraction.editReply(page);
                } else {
                    this.response = await messageOrInteraction.reply({ ...page, fetchReply: true, ephemeral: false });
                }
            } else {
                this.response = await messageOrInteraction.channel.send(page as MessageOptions);
            }
        } else {
            if (this.response) {
                if (runsOnInteraction(this.response)) {
                    if (this.response.replied || this.response.deferred) {
                        await this.response.editReply({
                            content: `No pages left.`,
                            embeds: [],
                            components: []
                        });
                    } else {
                        await this.response.reply({
                            content: `No pages available.`,
                            embeds: [],
                            components: []
                        });
                    }
                } else if (isMessageInstance(this.response)) {
                    await this.response.edit({
                        content: `No pages left.`,
                        embeds: [],
                        components: []
                    });
                }
            } else if (runsOnInteraction(messageOrInteraction)) {
                if (messageOrInteraction.replied || messageOrInteraction.deferred) {
                    this.response = await messageOrInteraction.editReply({
                        content: `No pages left.`,
                        embeds: [],
                        components: []
                    });
                } else {
                    this.response = await messageOrInteraction.reply({
                        content: `No pages available.`,
                        embeds: [],
                        components: [],
                        fetchReply: true
                    });
                }
            } else {
                this.response = await messageOrInteraction.channel.send({
                    content: `No pages available.`,
                    embeds: [],
                    components: []
                });
            }
        }
    }

    /**
     * Handles the `collect` event from the collector.
     * -- Kelevra Override to let use reload the page
     * 
     * @param targetUser The user the handler is for.
     * @param channel The channel the handler is running at.
     * @param interaction The button interaction that was received.
     * @see https://github.com/sapphiredev/utilities/blob/d1b4a4195df0e613b9e87c35dcec5115d55641f8/packages/discord.js-utilities/src/lib/PaginatedMessages/PaginatedMessage.ts#L1080-L1129
     */
    protected async handleCollect(
        targetUser: User,
        channel: Message['channel'],
        interaction: ButtonInteraction | SelectMenuInteraction
    ): Promise<void> {
        if (interaction.user.id === targetUser.id) {
            // Update the response to the latest interaction
            this.response = interaction;

            const action = this.actions.get(interaction.customId)!;

            if (actionIsButtonOrMenu(action)) {
                const previousIndex = this.index;

                await action.run({
                    interaction,
                    handler: this,
                    author: targetUser,
                    channel,
                    response: this.response!,
                    collector: this.collector!
                });

                if (!this.stopPaginatedMessageCustomIds.includes(action.customId) && !interaction.customId.startsWith('update-paginated-message')) {
                    const newIndex = previousIndex === this.index ? previousIndex : this.index;
                    const messagePage = await this.resolvePage(newIndex);
                    const updateOptions = isFunction(messagePage) ? await messagePage(newIndex, this.pages, this) : messagePage;

                    await safelyReplyToInteraction({
                        messageOrInteraction: interaction,
                        interactionEditReplyContent: updateOptions,
                        interactionReplyContent: { ...this.#thisMazeWasNotMeantForYouContent, ephemeral: true },
                        componentUpdateContent: updateOptions
                    });
                }
            }
        } else {
            const interactionReplyOptions = await this.wrongUserInteractionReply(targetUser, interaction.user, {
                author: interaction.user,
                channel: interaction.channel,
                guild: interaction.guild
            });

            await interaction.reply(
                isObject(interactionReplyOptions)
                    ? interactionReplyOptions
                    : { content: interactionReplyOptions, ephemeral: true, allowedMentions: { users: [], roles: [] } }
            );
        }
    }


    /**
     * Sets up the message's collector.
     * @param channel The channel the handler is running at.
     * @param targetUser The user the handler is for.
     */
    protected setUpCollector(channel: TextBasedChannel, targetUser: User): void {
        if (this.pages.length >= 1) {
            this.collector = new InteractionCollector<MessageComponentInteraction>(targetUser.client, {
                filter: (interaction) =>
                    !isNullish(this.response) && //
                    interaction.isMessageComponent() &&
                    this.actions.has(interaction.customId),

                time: this.idle,

                guild: isGuildBasedChannel(channel) ? channel.guild : undefined,

                channel,

                interactionType: Constants.InteractionTypes.MESSAGE_COMPONENT,

                ...(!isNullish(this.response) && !runsOnInteraction(this.response)
                    ? {
                        message: this.response
                    }
                    : {})
            })
                .on('collect', this.handleCollect.bind(this, targetUser, channel))
                .on('end', this.handleEnd.bind(this));
        }
    }

    public override addPage(page: PaginatedMessagePage): this {
        this.pages.push(page);
        return this;
    }
}
