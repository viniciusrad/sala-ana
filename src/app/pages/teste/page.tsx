'use client';

import { useState } from 'react';

const PaginaTeste = () => {
  const [cor, setCor] = useState('#000000');

  // Função para gerar cor aleatória em formato hexadecimal
  const gerarCorAleatoria = () => {
    const corAleatoria = '#' + Math.floor(Math.random()*16777215).toString(16);
    setCor(corAleatoria);
  };

  return (
    <div 
      style={{ 
        color: cor,
        cursor: 'pointer',
        fontSize: '2rem',
        padding: '2rem'
      }}
      onMouseEnter={gerarCorAleatoria}
      onMouseLeave={() => setCor('#000000')}
    >
      Hello World
    </div>
  );
};

export default PaginaTeste;
