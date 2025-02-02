import { Routes, Route, BrowserRouter } from "react-router-dom";

import { useEffect, useState } from "react";

import { setUser } from "./utils/auth";

import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import Dashboard from "./views/auth/Dashboard";
import Logout from "./views/auth/Logout";
import ForgotPassword from "./views/auth/ForgotPassword";
import CreatePassword from "./views/auth/CreatePassword";
import StoreHeader from "./views/base/StoreHeader";

import MainWrapper from "./layout/MainWrapper";
import PrivateRoute from "./layout/PrivateRoute";
import StoreFooter from "./views/base/StoreFooter";
import Products from "./views/store/Products";
import ProductDetail from "./views/store/ProductDetail";
import Cart from "./views/store/Cart";
import Checkout from "./views/store/Checkout";
import PaymentSuccess from "./views/store/PaymentSuccess";
import Search from "./views/store/Search";
import { CartContext } from "./views/plugin/Context";

import CartID from "./views/plugin/CartID";
import UserData from "./views/plugin/UserData";
import apiInstance from "./utils/axios";
import Account from "./views/customer/Account";
import Orders from "./views/customer/Orders";
import OrderDetail from "./views/customer/OrderDetail";
import Wishlist from "./views/customer/Wishlist";
import CustomerNotification from "./views/customer/CustomerNotification";
import CustomerSettings from "./views/customer/CustomerSettings";

function App() {
  const [cartCount, setCartCount] = useState();

  useEffect(() => {
    setUser();
  }, []);

  const cartId = CartID();
  const userData = UserData();

  useEffect(() => {
    const url = userData
      ? `cart-list/${cartId}/${userData?.user_id}/`
      : `cart-list/${cartId}/`;

    apiInstance.get(url).then((res) => {
      setCartCount(res.data.length);
    });
  });

  return (
    <CartContext.Provider value={[cartCount, setCartCount]}>
      <BrowserRouter>
        <StoreHeader />
        <MainWrapper>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/create-new-password" element={<CreatePassword />} />

            {/* STORE COMPONENTS */}
            <Route path="/" element={<Products />} />
            <Route path="/detail/:slug/" element={<ProductDetail />} />
            <Route path="/cart/" element={<Cart />} />
            <Route path="/checkout/:order_oid/" element={<Checkout />} />
            <Route
              path="/payment-success/:order_oid/"
              element={<PaymentSuccess />}
            />
            <Route path="/search/" element={<Search />} />

            {/* CUSTOMER ROUTES */}
            <Route
              path="/customer/account/"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/orders/"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/order/:order_oid/"
              element={
                <PrivateRoute>
                  <OrderDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/wishlist/"
              element={
                <PrivateRoute>
                  <Wishlist />
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/notifications/"
              element={
                <PrivateRoute>
                  <CustomerNotification />
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/settings/"
              element={
                <PrivateRoute>
                  <CustomerSettings />
                </PrivateRoute>
              }
            />
          </Routes>
        </MainWrapper>
        <StoreFooter />
      </BrowserRouter>
    </CartContext.Provider>
  );
}

export default App;
