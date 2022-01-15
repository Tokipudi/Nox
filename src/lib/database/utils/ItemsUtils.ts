import { ItemDescription } from "@lib/api/hirez/smite/interfaces/ItemsInterfaces";

export function isItemDescription(object: any): object is ItemDescription {
    return 'Menuitems' in object && 'Description' in object && 'SecondaryDescription' in object;
}