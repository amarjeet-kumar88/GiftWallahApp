// utils/events.ts
export const emitCartUpdated = () => {
  try {
    window.dispatchEvent(new Event("cart-updated"));
  } catch {}
};

export const emitWishlistUpdated = () => {
  try {
    window.dispatchEvent(new Event("wishlist-updated"));
  } catch {}
};
