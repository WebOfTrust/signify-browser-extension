import React from 'react';
import logo from '@assets/img/128_keri_logo.png';

export default function Popup(): JSX.Element {

  return (
    <div className="absolute top-20 right-20 text-center p-3 bg-white">
      <header className="items-center justify-center">
      {/* <img src={logo} className="w-32 h-32" alt="logo" /> */}
      <p className="text-2xl font-bold">Dialog from extension</p>
      </header>
    </div>
  );
}
