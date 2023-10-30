import React, { useState,useEffect } from 'react';
import BAppBar from './appbar'; // AppBar bileşeninizin yolu
import Sidebar from './sidebar'; // Sidebar bileşeninizin yolu


function Layout({ children }) {
    const [open, setOpen] = useState(() => {
        // localStorage'dan değeri al
        const savedOpen = localStorage.getItem('sidebarOpen');

        // Eğer değer null ise (yani localStorage'da kaydedilmemişse) true döndür
        if (savedOpen === null) return true;

        // Değilse, localStorage'dan alınan değeri boolean olarak döndür
        return JSON.parse(savedOpen);
    });

    // open durumu değiştiğinde localStorage'ı güncelle
    useEffect(() => {
        localStorage.setItem('sidebarOpen', JSON.stringify(open));
    }, [open]);

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <div>
      <BAppBar open={open} handleToggle={handleToggle} />
      <Sidebar open={open} handleToggle={handleToggle} />
      <main style={{ marginLeft: open ? 240 : 0, transition: 'margin 0.3s' }}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
