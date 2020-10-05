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
    totalPrice: number;

    constructor(design: Design) {
        this.design = design;
        this.quantity = 1;
    }
}

export class Cart {
    private items: CartItem[];

    constructor() {
        this.items = [];
    }

    public getSize(): number {
        return this.items.length;
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

    public removeItem(design: Design) {
        this.items = this.items.filter(item => !(item.design.frontBlob === design.frontBlob && item.design.backBlob === design.backBlob));
    }

}