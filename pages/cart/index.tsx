import { useContext } from 'react';
import Page from '../../components/page';
import { CartContext } from '../../hooks/useCart';
import { Design } from '../../model/Cart';

export default function Cart() {
    const { cart, dispatcher } = useContext(CartContext);
    return (
        <Page>
            {
                cart.getSize() === 0 ?
                <p>Your cart is empty.</p> :
                <ul>
                    {
                        cart.getItems().map((item: Design) => (
                            <li key={item.id}>{item.color.toString()}</li>
                        ))
                    }
                </ul>
            }
        </Page>
    );
}