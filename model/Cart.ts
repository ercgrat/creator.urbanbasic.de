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

export class Design {
    hasFrontData: boolean;
    frontDataURL: string;
    hasBackData: boolean;
    backDataURL: string;
    color: DesignColor;
    size: DesignSize;
    product: DesignProduct;

    constructor(
        hasFrontData: boolean,
        frontDataURL: string,
        hasBackData: boolean,
        backDataURL: string,
        color: DesignColor,
        size: DesignSize,
        product: DesignProduct
    ) {
        this.hasFrontData = hasFrontData;
        this.frontDataURL = frontDataURL;
        this.hasBackData = hasBackData;
        this.backDataURL = backDataURL;
        this.color = color;
        this.size = size;
        this.product = product;
    }
}

export interface ICartItem {
    design: Design;
    quantity: number;
    price: number;
    originals?: string[];
}

export class CartItem implements ICartItem {
    id?: string;
    design: Design;
    quantity: number;
    price: number;
    originals?: string[];

    constructor(design: Design, quantity?: number, originals?: string[]) {
        this.design = design;
        this.quantity = quantity || 1;
        this.originals = originals || [];
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
    itemIds: string[];
}

export class Cart {
    public id?: string;
    public items: CartItem[];
    public readonly shippingCost: number = 3.9;

    static async constructCartFromDatabase(
        id: string,
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
                resolve(new Cart(id, cartItems));
            });
        });
    }

    static clone(cart: Cart): Cart {
        return new Cart(cart.id, cart.getItems().slice());
    }

    constructor(id?: string, items?: CartItem[]) {
        this.id = id || undefined;
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

    public addDesign(design: Design, quantity?: number): CartItem {
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
