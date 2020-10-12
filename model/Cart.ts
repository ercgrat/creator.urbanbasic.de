export enum DesignColor {
    white = 'white',
    oxfordGrey = '#8391A1',
    heatherBlack = '#BDC3C7',
    sand = '#C2B280',
    gray = 'gray',
    black = 'black',
    orange = 'orange',
    dustyBlue = '#5A86AD',
    navy = 'navy'
}

export enum DesignSize {
    xs = 'xs',
    s = 's',
    m = 'm',
    l = 'l',
    xl = 'xl',
    xxl = 'xxl'
}

export class Design {
    frontDataURL: string;
    backDataURL: string;
    color: DesignColor;
    size: DesignSize;

    constructor(frontDataURL: string, backDataURL: string, color: DesignColor, size: DesignSize) {
        this.frontDataURL = frontDataURL;
        this.backDataURL = backDataURL;
        this.color = color;
        this.size = size;
    }
}

export class CartItem {
    design: Design;
    quantity: number;
    price: number;

    constructor(design: Design, quantity?: number) {
        this.design = design;
        this.quantity = quantity || 1;
        this.price = 20;
    }

    public getTotalPrice() {
        return this.price * this.quantity;
    }
}

export interface ICartStorage {
    items: CartItem[];
}

export class Cart {
    private items: CartItem[];
    public readonly shippingCost: number = 3;

    constructor(items?: CartItem[]) {
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

    public addItem(item: CartItem) {
        this.items.push(item);
        this.items = this.items.slice();
    }

    public addDesign(design: Design) {
        this.items.push(new CartItem(design));
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