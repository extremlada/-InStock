import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DepotsPageWrapper from './components/Depots';
import DivisionPageWrapper from './components/Division';
import HomePageWrapper from './components/Home';
import Items from './components/Items';
import Login from './components/LogIn';
import ItemSaleForm from './components/ItemSaleForm';
import PreviewPage from './components/PreviewPage';
import MobileQrPage from './components/MobileQrPage';
import MobileScanPage from './components/MobileScanPage';
import TransactionList from './components/TransactionList';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Routes>
                <Route path="/" element={<HomePageWrapper />} />
                <Route path="/raktar" element={<DepotsPageWrapper />} />
                <Route path="/raktar/:id" element={<Items />} />
                <Route path="/reszleg" element={<DivisionPageWrapper />} />
                <Route path="/eladas" element={<ItemSaleForm />} />
                <Route path="/elonezet" element={<PreviewPage />} />
                <Route path="/mobil-qr" element={<MobileQrPage />} />
                <Route path="/mobile-scan" element={<MobileScanPage />} />
                <Route path="/bizonylatok" element={<TransactionList />} />
              </Routes>
            </RequireAuth>
          }
        />
      </Routes>
  );
}

export default App;
