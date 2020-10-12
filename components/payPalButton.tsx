import React from 'react';
import PaypalExpressBtn from 'react-paypal-express-checkout';

export default function PayPalButton(props: {
    total: number,
    onSuccess?: (payment: any) => void,
    onCancel?: (data: any) => void,
    onError?: (err: any) => void
}) {

    const onSuccess = (payment) => {
        props.onSuccess(payment);
    };

    const onCancel = (data) => {
        props.onCancel(data);
    };

    const onError = (err) => {
        props.onError(err);
    };

    const env = process.env.NEXT_PUBLIC_PAYPAL_ENV;
    const currency = 'EUR';
    const client = {
        sandbox: 'AReJHDdGIO940UAsIBQ5tEcru7xT6VpNjJ831GXb1k8bLUlkapanjRgGah--hz1JpCqMmfCv_ZEjDYSJ',
        production: 'ATWKxMFb8u6IGhqznaIU6W3i1OyuOPFgFOOY37yNBOSyZole-7CIvMAmnxhYY0UDo_kdu4CExP9WoNT9',
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
                tagline: false
            }} />
    );

}