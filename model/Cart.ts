import { URLS } from '../utils/const';
import { processLambda } from '../utils/lambda';
import { IFaunaObject } from './lambda';

export enum DesignColor {
    white = 'white',
    black = 'black',
    oxfordGrey = 'oxfordGrey',
    navy = 'navy',
    orange = 'orange',
    red = 'red',
}

export type Color = {
    name: string;
    color: string;
};
export const ColorMap: { [key in DesignColor]: Color } = {
    white: { name: 'Weiß', color: 'white' },
    black: { name: 'Schwarz', color: 'black' },
    oxfordGrey: { name: 'Grau Melliert', color: 'rgb(142, 140, 146)' },
    navy: { name: 'Navy Blau', color: 'rgb(33, 33, 78)' },
    orange: { name: 'Orange', color: 'rgb(229, 84, 3)' },
    red: { name: 'Rot', color: 'rgba(130, 15, 19)' },
};

export enum DesignSize {
    xs = 'xs',
    s = 's',
    m = 'm',
    l = 'l',
    xl = 'xl',
    xxl = 'xxl',
}

export enum DesignProduct {
    tshirt = 'tshirt',
}

export type Product = {
    name: string;
    oneSidedPrice: number;
    twoSidedPrice: number;
};

/** Maps products to one-sided and two-sided prices */
export const ProductMap: { [key in DesignProduct]: Product } = {
    tshirt: {
        name: 'T-Shirt, 100% Biobaumwolle, Fair Trade',
        oneSidedPrice: 14,
        twoSidedPrice: 19,
    },
};

export class DesignMetadata {
    s3ObjectKey: string;
    hasFrontData: boolean;
    hasBackData: boolean;
    color: DesignColor;
    size: DesignSize;
    product: DesignProduct;

    constructor(
        s3ObjectKey: string,
        hasFrontData: boolean,
        hasBackData: boolean,
        color: DesignColor,
        size: DesignSize,
        product: DesignProduct
    ) {
        this.s3ObjectKey = s3ObjectKey;
        this.hasFrontData = hasFrontData;
        this.hasBackData = hasBackData;
        this.color = color;
        this.size = size;
        this.product = product;
    }
}

export interface ICartItem {
    design: DesignMetadata;
    quantity: number;
    price: number;
}

export class CartItem implements ICartItem {
    id?: string;
    design: DesignMetadata;
    quantity: number;
    price: number;

    constructor(design: DesignMetadata, quantity?: number) {
        this.design = design;
        this.quantity = quantity || 1;
        this.price =
            design.hasFrontData && design.hasBackData
                ? ProductMap[design.product].twoSidedPrice
                : ProductMap[design.product].oneSidedPrice;
    }

    public getTotalPrice(): number {
        return this.price * this.quantity;
    }
}

export interface ICart {
    id: string;
    s3KeyCounter: number;
    itemIds: string[];
}

export class Cart {
    public id?: string;
    public items: CartItem[];
    public s3KeyCounter: number;
    public readonly shippingCost: number = 3.9;

    static async constructCartFromDatabase(
        id: string,
        s3KeyCounter: number,
        itemIds: string[]
    ): Promise<Cart> {
        return new Promise((resolve) => {
            const cartItemPromises = itemIds.map(async (id) => {
                const cartItemData = await processLambda<
                    void,
                    IFaunaObject<ICartItem>
                >(URLS.CART_ITEM.READ(id), 'GET');
                const cartItem = new CartItem(
                    cartItemData.data.design,
                    cartItemData.data.quantity
                );
                cartItem.id = cartItemData.ref['@ref'].id;
                return cartItem;
            });
            Promise.all(cartItemPromises).then((cartItems) => {
                resolve(new Cart(id, s3KeyCounter, cartItems));
            });
        });
    }

    static clone(cart: Cart): Cart {
        return new Cart(cart.id, cart.s3KeyCounter, cart.getItems().slice());
    }

    constructor(id?: string, s3KeyCounter?: number, items?: CartItem[]) {
        this.id = id || undefined;
        this.s3KeyCounter = s3KeyCounter ?? 0;
        this.items = items || [];
    }

    public getSize(): number {
        return this.items.length;
    }

    public getItem(index: number): CartItem {
        return this.items[index];
    }

    public getItems(): CartItem[] {
        return this.items.slice();
    }

    public getItemIds(): string[] {
        return this.items.map((item) => item.id ?? '0');
    }

    public addItem(item: CartItem): void {
        this.items.push(item);
        this.items = this.items.slice();
    }

    public addDesign(design: DesignMetadata, quantity?: number): CartItem {
        const cartItem = new CartItem(design, quantity);
        this.items.push(cartItem);
        this.items = this.items.slice();
        return cartItem;
    }

    public removeAt(index: number): CartItem {
        const newItems = this.items;
        const deletedItem = newItems.splice(index, 1);
        this.items = newItems;
        return deletedItem[0];
    }

    public getSubtotal(): number {
        return this.items.reduce((sum, item) => sum + item.getTotalPrice(), 0);
    }

    public getShipping(): number {
        return this.shippingCost;
    }

    public getTotal(): number {
        return this.getSubtotal() + this.getShipping();
    }
}
