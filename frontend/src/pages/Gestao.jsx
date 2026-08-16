import React, { useState, useEffect } from 'react';

export default function Gestao({ token }){
  const [purchases, setPurchases] = useState([]);
  useEffect(()=>{
    fetch('http://localhost:4000/purchases', { headers: token ? { 'Authorization': 'Bearer '+token } : {} })
      .then(r=>r.json()).then(setPurchases).catch(()=>{});
  },[token]);
  return (
    <div>
      <h2>Gestão (Coordenação)</h2>
      <p>Compras, notas fiscais e reuniões.</p>
      <ul>{purchases.map(p=> <li key={p.id}>{p.description} — R$ {p.amount}</li>)}</ul>
    </div>
  );
}
