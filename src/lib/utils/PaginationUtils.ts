import { EmojiIdentifierResolvable, MessageButton, MessageButtonStyle } from 'discord.js';

export function getBackButton(
    label: string = '',
    style: MessageButtonStyle | null = 'SECONDARY'
) {
    return getButton('back', label, style, '⬅️', true);
}
export function getForwardButton(
    label: string = '',
    style: MessageButtonStyle | null = 'SECONDARY'
) {
    return getButton('forward', label, style, '➡️');
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