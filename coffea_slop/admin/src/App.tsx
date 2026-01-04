import React from 'react';
import './App.module.css';
import { ApiProvider } from './context/ApiProvider';
import { UserProvider } from './context/UserProvider';
import { BrowserRouter, Route, Routes } from 'react-router';
import { CommonLayout } from './component/common/CommonLayout';
import { Dashboard } from './component/common/Dashboard';
import { UserList } from './component/personal/UserList';
import { AttributeList } from './component/settings/AttributeList';
import { LanguageList } from './component/settings/LanguageList';
import { StatusList } from './component/settings/StatusList';
import { BlockList } from './component/content/BlockList';
import { BlockDetail } from './component/content/BlockDetail';
import { DirectoryList } from './component/registry/DirectoryList';
import { DirectoryDetail } from './component/registry/DirectoryDetail';
import { FormList } from './component/feedback/FormList';
import { FormDetail } from './component/feedback/FormDetail';
import { CollectionList } from './component/storage/CollectionList';
import { CollectionDetail } from './component/storage/CollectionDetail';

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
              <Route path={'/blocks/:id'} element={<BlockDetail />} />
              <Route path={'/directories'} element={<DirectoryList />} />
              <Route path={'/directories/:id'} element={<DirectoryDetail />} />
              <Route path={'/forms'} element={<FormList />} />
              <Route path={'/forms/:id'} element={<FormDetail />} />
              <Route path={'/collections'} element={<CollectionList />} />
              <Route path={'/collections/:id'} element={<CollectionDetail />} />
            </Routes>
          </CommonLayout>
        </BrowserRouter>
      </UserProvider>
    </ApiProvider>
  );
}

export default App;
