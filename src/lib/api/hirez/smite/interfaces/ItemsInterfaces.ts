import { Prisma } from "@prisma/client";

export interface Item {
    ActiveFlag: string,
    ChildItemId: number,
    DeviceName: string,
    IconId: number,
    ItemDescription: Prisma.InputJsonValue | Prisma.InputJsonObject,
    ItemId: number,
    ItemTier: number,
    Price: number,
    RestrictedRoles: string,
    RootItemId: number,
    ShortDesc: string,
    StartingItem: boolean,
    Type: string,
    itemIcon_URL: string,
    ret_msg: string | null
}
export interface ItemsResponse extends Array<Item> { }

export interface ItemDescription {
    Menuitems: Array<ItemDescriptionMenuItem>,
    Description: string,
    SecondaryDescription: string
}

export interface ItemDescriptionMenuItem {
    Value: string,
    Description: string
}