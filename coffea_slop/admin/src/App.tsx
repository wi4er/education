import React from 'react';
import './App.module.css';
import { ApiProvider } from './context/ApiProvider';
import { UserProvider } from './context/UserProvider';
import { BrowserRouter, Route, Routes } from 'react-router';
import { CommonLayout } from './component/CommonLayout';
import { Dashboard } from './component/Dashboard';
import { UserList } from './component/UserList';
import { AttributeList } from './component/AttributeList';
import { LanguageList } from './component/LanguageList';
import { StatusList } from './component/StatusList';
import { BlockList } from './component/BlockList';
import { ElementList } from './component/ElementList';
import { SectionList } from './component/SectionList';

function App() {
  return (
    <ApiProvider>
      <UserProvider>
        <BrowserRouter  basename="/admin/">
          <CommonLayout>
            <Routes>
              <Route path={'/'} element={<Dashboard />} />
              <Route path={'/users'} element={<UserList />} />
              <Route path={'/attributes'} element={<AttributeList />} />
              <Route path={'/languages'} element={<LanguageList />} />
              <Route path={'/statuses'} element={<StatusList />} />
              <Route path={'/blocks'} element={<BlockList />} />
              <Route path={'/elements'} element={<ElementList />} />
              <Route path={'/sections'} element={<SectionList />} />
            </Routes>
          </CommonLayout>
        </BrowserRouter>
      </UserProvider>
    </ApiProvider>
  );
}

export default App;
