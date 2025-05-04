import apiInstance from "./axios";

export const safelyFetchReviews = async (productId) => {
  if (!productId || productId === "undefined") {
    console.warn("Invalid product ID:", productId);
    return [];
  }
  try {
