import { MutableRefObject } from "react";

export enum CustomizerItemType {
    text,
    image
}

export class CustomizerItem {
    id: number;
    type: CustomizerItemType;
    value: string;

    constructor(id: number, type: CustomizerItemType, value: string) {
        this.id = id;
        this.type = type;
        this.value = value;
    }
}

export interface ICustomizerConfigProps {
    canvas: fabric.Canvas;
    canvasRef: MutableRefObject<any>;
    selectedObject: fabric.Object;
    addObject: (type: CustomizerItemType, value: any) => void;
}
