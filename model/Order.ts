import { ICart } from "./Cart";

export interface IOrder {
  cart: ICart;
  payment: {
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
  };
  isInProgress: boolean;
  isComplete: boolean;
}
