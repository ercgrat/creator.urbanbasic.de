import React from 'react';
import PaypalExpressBtn from 'react-paypal-express-checkout';
import { IPayment } from '../model/Order';

type Props = {
    total: number;
    onSuccess?: (payment: IPayment) => void;
    onCancel?: (data: unknown) => void;
    onError?: (err: unknown) => void;
};

const PayPalButton: React.FC<Props> = (props) => {
    const onSuccess = (payment: IPayment) => {
        if (props.onSuccess) {
            props.onSuccess(payment);
        }
    };

    const onCancel = (data: unknown) => {
        if (props.onCancel) {
            props.onCancel(data);
        }
    };

    const onError = (err: unknown) => {
        if (props.onError) {
            props.onError(err);
        }
    };

    let env = process.env.NEXT_PUBLIC_PAYPAL_ENV_DEV;
    if (!env) {
        env = process.env.NEXT_PUBLIC_PAYPAL_ENV;
    }
    const currency = 'EUR';
    const client = {
        sandbox:
            'AReJHDdGIO940UAsIBQ5tEcru7xT6VpNjJ831GXb1k8bLUlkapanjRgGah--hz1JpCqMmfCv_ZEjDYSJ',
        production:
            'ATWKxMFb8u6IGhqznaIU6W3i1OyuOPFgFOOY37yNBOSyZole-7CIvMAmnxhYY0UDo_kdu4CExP9WoNT9',
    };

    return (
        <PaypalExpressBtn
            env={env}
            client={client}
            currency={currency}
            total={props.total}
            onError={onError}
            onSuccess={onSuccess}
            onCancel={onCancel}
            style={{
                size: 'responsive',
                color: 'gold',
                label: 'checkout',
                shape: 'rect',
                tagline: false,
            }}
        />
    );
};

export default PayPalButton;
