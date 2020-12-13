import moment from 'moment';
import { Cart, ICart } from './Cart';

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
    created_at: number;
    payment: IPayment;
    isInProgress: boolean;
    isComplete: boolean;
}

export interface IOriginal {
    src: string;
}

export class Order {
    id: string;
    created_at: moment.Moment;
    cart: Cart;
    payment: IPayment;
    isInProgress: boolean;
    isComplete: boolean;

    constructor(
        id: string,
        created_at: number,
        cart: Cart,
        payment: IPayment,
        isInProgress: boolean,
        isComplete: boolean
    ) {
        this.id = id;
        this.created_at = moment(created_at / 1000);
        this.cart = cart;
        this.payment = payment;
        this.isInProgress = isInProgress;
        this.isComplete = isComplete;
    }
}
