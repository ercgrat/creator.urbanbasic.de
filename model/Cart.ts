export enum DesignColor {
    white = "white",
    gray = "gray",
    black = "black",
    navy = "navy",
    orange = "orange"
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
    frontBlob: string;
    backBlob: string;
    color: DesignColor;
    size: DesignSize;

    constructor(frontBlob: string, backBlob: string, color: DesignColor, size: DesignSize) {
        this.frontBlob = frontBlob;
        this.backBlob = backBlob;
        this.color = color;
        this.size = size;
    }
}

export class CartItem {
    design: Design;
    quantity: number;
    price: number;

    constructor(design: Design) {
        this.design = design;
        this.quantity = 1;
        this.price = 20;
    }

    getTotalPrice() {
        return this.price * this.quantity;
    }
}

export class Cart {
    private items: CartItem[];
    private readonly shippingCost: number = 3;

    constructor() {
        this.items = [];
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
        this.items = this.items.filter(item => !(item.design.frontBlob === actionItem.design.frontBlob
            && item.design.backBlob === actionItem.design.backBlob));
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