import { EmojiIdentifierResolvable, MessageButton, MessageButtonStyle } from 'discord.js';

export function getStartButton(
    label: string = '',
    customId: string = 'start',
    style: MessageButtonStyle | null = 'PRIMARY'
) {
    return getButton(customId, label, style, '⏪', true);
}
export function getBackButton(
    label: string = '',
    customId: string = 'back',
    style: MessageButtonStyle | null = 'PRIMARY'
) {
    return getButton(customId, label, style, '◀️', true);
}
export function getForwardButton(
    label: string = '',
    customId: string = 'forward',
    style: MessageButtonStyle | null = 'PRIMARY'
) {
    return getButton(customId, label, style, '▶️');
}
export function getEndButton(
    label: string = '',
    customId: string = 'end',
    style: MessageButtonStyle | null = 'PRIMARY'
) {
    return getButton(customId, label, style, '⏩');
}
export function getFavoriteButton(
    label: string = '',
    customId: string = 'favorite',
    style: MessageButtonStyle | null = 'SUCCESS'
) {
    return getButton(customId, label, style, '🤍');
}
export function getRandomButton(
    label: string = '',
    customId: string = 'random',
    style: MessageButtonStyle | null = 'PRIMARY'
) {
    return getButton(customId, label, style, '🔀');
}
export function getRemoveFromWishlistButton(
    label: string = 'Unwish',
    customId: string = 'removewishlist',
    style: MessageButtonStyle | null = 'DANGER'
) {
    return getButton(customId, label, style);
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

export function getButton(
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