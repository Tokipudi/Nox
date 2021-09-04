import { EmojiIdentifierResolvable, MessageButton, MessageButtonStyle } from 'discord.js';

export function getBackButton(
    label: string = '',
    customId: string = 'back',
    style: MessageButtonStyle | null = 'SECONDARY'
) {
    return getButton(customId, label, style, '⬅️', true);
}
export function getForwardButton(
    label: string = '',
    customId: string = 'forward',
    style: MessageButtonStyle | null = 'SECONDARY'
) {
    return getButton(customId, label, style, '➡️');
}
export function getSelectButton(
    label: string | null = null,
    style: MessageButtonStyle | null = null,
    emoji: EmojiIdentifierResolvable | null = null,
    disabled: boolean = false,
    url: string = ''
) {
    return getButton('select', label, style, emoji, disabled, url);
}

function getButton(
    customId: string,
    label: string = '',
    style: MessageButtonStyle = 'SECONDARY',
    emoji: EmojiIdentifierResolvable | null = null,
    disabled: boolean = false,
    url: string = ''
) {
    return new MessageButton()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(style)
        .setEmoji(emoji)
        .setDisabled(disabled)
        .setURL(url);
}