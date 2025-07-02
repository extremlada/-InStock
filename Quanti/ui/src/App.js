import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DepotsPageWrapper from './components/Depots';
import DivisionPageWrapper from './components/Division';
import HomePageWrapper from './components/Home';
import Items from './components/Items';
import Login from './components/LogIn';
import ItemSaleForm from './components/ItemSaleForm';
import PreviewPage from './components/PreviewPage';

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePageWrapper />} />
        <Route path="/raktar" element={<DepotsPageWrapper />} />
        <Route path="/raktar/:id" element={<Items />} />
        <Route path="/reszleg" element={<DivisionPageWrapper />} />
        {/*<Route path="/reszleg/:id" element={<Items />} />*/}
        <Route path="/login" element={<Login />} />
          <Route path="/eladas" element={<ItemSaleForm />} />
          {/*<Route path="/eladas/:id" element={<Items />} />*/}
          <Route path="/elonezet" element={<PreviewPage />} />
      </Routes>
  );
}

export default App;
