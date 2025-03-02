import { createSlice } from '@reduxjs/toolkit';
import { addToCart } from '../api/cartApi';


const initialState = {
    items: [],
    totalQuantity: 0,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addCartItem: (state, action) => {
            const { productId, quantity } = action.payload;
            const existingItem = state.items.find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({ productId, quantity });
            }
            state.totalQuantity += quantity;
        },
        // Other reducers can be added here
    },
});

export const { addCartItem } = cartSlice.actions;

export const addCartItemAsync = (productId, quantity) => async (dispatch) => {
    const response = await addCart(productId, quantity);
    if (response) {
        dispatch(addCartItem({ productId, quantity }));
    }
};

export default cartSlice.reducer;
