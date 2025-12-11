// src/lib/uiEvents.ts
export const dispatchCartUpdated = () => {
  try {
    window.dispatchEvent(new Event("cart-updated"));
    localStorage.setItem("cart-ts", Date.now().toString());
  } catch {}
};

export const dispatchWishlistUpdated = () => {
  try {
    window.dispatchEvent(new Event("wishlist-updated"));
    localStorage.setItem("wishlist-ts", Date.now().toString());
  } catch {}
};
