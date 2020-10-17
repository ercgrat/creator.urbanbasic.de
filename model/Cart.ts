export enum DesignColor {
    white = 'white',
    black = 'black',
    oxfordGrey = 'oxfordGrey',
    navy = 'navy',
    orange = 'orange',
    red = 'red'
}

export type Color = {
    name: string;
    color: string;
}
export const ColorMap: { [key in DesignColor]: Color } = {
    white: { name: 'White', color: 'white' },
    black: { name: 'Black', color: 'black' },
    oxfordGrey: { name: 'Oxford Grey', color: 'rgb(163, 160, 167)' },
    navy: { name: 'Navy', color: 'rgb(42, 43, 61)' },
    orange: { name: 'Orange', color: 'rgb(209, 85, 23)' },
    red: { name: 'Red', color: 'red' }
};

export enum DesignSize {
    xs = 'xs',
    s = 's',
    m = 'm',
    l = 'l',
    xl = 'xl',
    xxl = 'xxl'
}

export enum DesignProduct {
    tshirt = 'tshirt'
}

export type Product = {
    name: string;
    oneSidedPrice: number;
    twoSidedPrice: number;
}

/** Maps products to one-sided and two-sided prices */
export const ProductMap: { [key in DesignProduct]: Product } = {
    tshirt: {
        name: 'T-shirt',
        oneSidedPrice: 14,
        twoSidedPrice: 19
    }
}

export class Design {
    frontDataURL: string;
    backDataURL: string;
    color: DesignColor;
    size: DesignSize;
    product: DesignProduct;

    constructor(frontDataURL: string, backDataURL: string, color: DesignColor, size: DesignSize, product: DesignProduct) {
        this.frontDataURL = frontDataURL;
        this.backDataURL = backDataURL;
        this.color = color;
        this.size = size;
        this.product = product;
    }
}

export class CartItem {
    design: Design;
    quantity: number;
    price: number;
    originals?: string[];

    constructor(design: Design, quantity?: number, originals?: string[]) {
        this.design = design;
        this.quantity = quantity || 1;
        this.originals = originals || [];
        this.price = 20;
    }

    public getTotalPrice() {
        return this.price * this.quantity;
    }
}

export interface ICartStorage {
    items: CartItem[];
}

export interface ICart extends ICartStorage {
    id: string;
    shippingCost: number;
}

export class Cart {
    public id: string;
    private items: CartItem[];
    public readonly shippingCost: number = 3.9;

    static constructCartFromDatabase(id: string, partial: ICart): Cart {
        return new Cart(id, partial.items.map(item => new CartItem(item.design, item.quantity, item.originals)), partial.shippingCost);
    }

    constructor(id?: string, items?: CartItem[], shippingCost?: number) {
        this.id = id || undefined;
        this.items = items || [];
        this.shippingCost = shippingCost || this.shippingCost;
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

    public addItem(item: CartItem) {
        this.items.push(item);
        this.items = this.items.slice();
    }

    public addDesign(design: Design, quantity?: number) {
        this.items.push(new CartItem(design, quantity));
        this.items = this.items.slice();
    }

    public removeItem(actionItem: CartItem) {
        this.items = this.items.filter(item => !(item.design.frontDataURL === actionItem.design.frontDataURL
            && item.design.backDataURL === actionItem.design.backDataURL));
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