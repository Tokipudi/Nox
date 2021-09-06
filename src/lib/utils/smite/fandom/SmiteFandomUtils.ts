import got from 'got';
import * as cheerio from 'cheerio';
import { toTitleCase } from '@sapphire/utilities';

export async function getGodSkinMissingData(godName) {
    godName = toTitleCase(godName);

    const response = await got(`https://smite.fandom.com/wiki/${encodeURI(godName)}`);
    const $ = cheerio.load(response.body);

    let result = [];

    $('div.mw-parser-output').find('center').find('div.wds-tabber').find('table.wikitable').find('tbody').each(function () {
        result.push({
            name: toTitleCase($(this).find('tr.prettytable').find('th').find('span').text().trim()),
            releaseDate: $(this).find('tr:nth-child(2)').find('td:nth-child(3)').text().trim(),
            obtainability: toTitleCase($(this).find('tr:nth-child(3)').find('td').text().trim())
        });
    });
    return result;
}
