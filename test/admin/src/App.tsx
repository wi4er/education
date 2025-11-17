import React from 'react';
import './App.module.css';
import { AuthForm } from './components/AuthForm';
import { UserContext } from './context/UserContext';
import { HeaderBar } from './components/HeaderBar';
import { BrowserRouter, Routes, Route } from 'react-router';
import { DashboardTile } from './components/DashboardTile';
import { UserList } from './components/UserList';
import { ProductList } from './components/ProductList';

function App() {
  return (
    <BrowserRouter>
      <UserContext>
        <HeaderBar/>

        <Routes>
          <Route
            path={'/'}
            element={<DashboardTile/>}
          />
          <Route path={'/users'} element={<UserList/>}/>
          <Route path={'/products'} element={<ProductList />} />
        </Routes>

        <AuthForm/>
      </UserContext>
    </BrowserRouter>
  );
}

export default App;
