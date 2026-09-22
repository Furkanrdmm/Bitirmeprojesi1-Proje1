import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(
    localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : []
  );

  const [appliedCoupon, setAppliedCoupon] = useState(
    localStorage.getItem("appliedCoupon") || null
  );

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    if (cartItems.length === 0) setAppliedCoupon(null);
  }, [cartItems]);

  useEffect(() => {
    appliedCoupon
      ? localStorage.setItem("appliedCoupon", appliedCoupon)
      : localStorage.removeItem("appliedCoupon");
  }, [appliedCoupon]);

  const addToCart = (cartItem) => {
    // setCartItems([...cartItems, cartItem]); 1. yol
    setCartItems((prevCart) => [
      ...prevCart,
      {
        ...cartItem,
        quantity: cartItem.quantity ? cartItem.quantity : 1,
      },
    ]);
  };

  const removeFromCart = (itemId) => {
    const filteredCartItems = cartItems.filter((cartItem) => {
      return cartItem._id !== itemId;
    });

    setCartItems(filteredCartItems);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        appliedCoupon,
        setAppliedCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

CartProvider.propTypes = {
  children: PropTypes.node,
};
