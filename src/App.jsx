import { Routes, Route, BrowserRouter } from "react-router-dom";

import { useEffect } from "react";

import { setUser } from "./utils/auth";

import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import Dashboard from "./views/auth/Dashboard";
import Logout from "./views/auth/Logout";
import ForgotPassword from "./views/auth/ForgotPassword";
import CreatePassword from "./views/auth/CreatePassword";
import StoreHeader from "./views/base/StoreHeader";

import MainWrapper from "./layout/MainWrapper";
import StoreFooter from "./views/base/StoreFooter";
import Products from "./views/store/Products";
import ProductDetail from "./views/store/ProductDetail";
import Cart from "./views/store/Cart";
import Checkout from "./views/store/Checkout";
import PaymentSuccess from "./views/store/PaymentSuccess";
import Search from "./views/store/Search";

function App() {
  useEffect(() => {
    setUser();
  }, []);

  return (
    <BrowserRouter>
      <StoreHeader />
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
        <Route path="/payment-success/:order_oid/" element={<PaymentSuccess />} />
        <Route path="/search/" element={<Search />} />
      </Routes>
      <StoreFooter />
    </BrowserRouter>
  );
}

export default App;
