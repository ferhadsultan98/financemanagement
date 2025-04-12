// src/routes.jsx
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./Components/Layout/MainLayout";
import Home from "./Pages/Home/Home";
import AddExpense from "./Pages/AddExpense/AddExpense";
import ExpenseDetails from "./Pages/ExpenseDetails/ExpenseDetails";
import About from "./Pages/About/About";
import Login from "./Components/Login/Login";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/add-expense",
        element: <AddExpense />,
      },
      {
        path: "/expense-details",
        element: <ExpenseDetails />,
      },
      {
        path: "/about",
        element: <About />,
      },
    ],
  },
]);

export default router;
