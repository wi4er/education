import React from 'react';
import './App.module.css';
import { ApiContext } from './context/ApiProvider';
import { UserContext } from './context/UserProvider';
import { BrowserRouter, Route, Routes } from 'react-router';
import { CommonLayout } from './component/CommonLayout';
import { Dashboard } from './component/Dashboard';
import { UserList } from './component/UserList';
import { AttributeList } from './component/AttributeList';

function App() {
  return (
    <ApiContext>
      <UserContext>
        <BrowserRouter  basename="/admin/">
          <CommonLayout>
            <Routes>
              <Route path={'/'} element={<Dashboard />} />
              <Route path={'/users'} element={<UserList />} />
              <Route path={'/attributes'} element={<AttributeList />} />
            </Routes>
          </CommonLayout>
        </BrowserRouter>
      </UserContext>
    </ApiContext>
  );
}

export default App;
