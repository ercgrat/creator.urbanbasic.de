export enum DesignColor {
    white = "white",
    black = "black",
    navy = "navy",
    orange = "orange"
}

export interface IDesign {
    color: DesignColor;
}

export class Design implements IDesign {
    id: number;
    color: DesignColor;

    constructor(id: number, design: IDesign) {
        this.id = id;
        Object.assign(this, design);
    }
}

export class Cart {
    private idCounter: number;
    private items: Design[];

    constructor() {
        this.items = [];
        this.idCounter = 1;
    }

    public getSize(): number {
        return this.items.length;
    }

    public getItems(): Design[] {
        return this.items.slice();
    }

    public addItem(item: IDesign) {
        const design = new Design(this.idCounter++, item);
        this.items.push(design);
        this.items = this.items.slice();
    }

}