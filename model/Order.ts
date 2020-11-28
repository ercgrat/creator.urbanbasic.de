import { ICart } from './Cart';

export interface IPayment {
    address: {
        city: string;
        country_code: string;
        line1: string;
        postal_code: string;
        recipient_name: string;
        state: string;
    };
    email: string;
    paymentID: string;
}

export interface IOrder {
    cart: ICart;
    payment: IPayment;
    isInProgress: boolean;
    isComplete: boolean;
}

export interface IOriginal {
    src: string;
}
