import React, { useEffect, useState } from 'react';

export default function Gestao({ data, setData, role, token }) {
  const [purchase, setPurchase] = useState({ item: '', value: '', provider: '' });
  const [meeting, setMeeting] = useState({ title: '', date: '', participants: '' });
  const [purchases, setPurchases] = useState(data.purchases || []);
  const [meetings, setMeetings] = useState(data.meetings || []);

  useEffect(() => {
    if (token && role === 'coord') {
      fetch('http://localhost:4000/purchases', { headers: { Authorization: 'Bearer ' + token } })
        .then((r) => r.json()).then(setPurchases).catch(() => setPurchases([]));
      fetch('http://localhost:4000/meetings', { headers: { Authorization: 'Bearer ' + token } })
        .then((r) => r.json()).then(setMeetings).catch(() => setMeetings([]));
    } else {
      setPurchases(data.purchases || []);
      setMeetings(data.meetings || []);
    }
  }, [token, role, data.purchases, data.meetings]);

  const addPurchase = async (e) => {
    e.preventDefault();
    if (token && role === 'coord') {
      await fetch('http://localhost:4000/purchases', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(purchase) });
      setPurchases(await (await fetch('http://localhost:4000/purchases', { headers: { Authorization: 'Bearer ' + token } })).json());
    } else {
      setData((current) => ({ ...current, purchases: [{ id: Date.now(), ...purchase, value: Number(purchase.value || 0) }, ...current.purchases] }));
      setPurchases((prev) => [{ id: Date.now(), ...purchase, value: Number(purchase.value || 0) }, ...prev]);
    }
    setPurchase({ item: '', value: '', provider: '' });
  };

  const addMeeting = async (e) => {
    e.preventDefault();
    if (token && role === 'coord') {
      await fetch('http://localhost:4000/meetings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(meeting) });
      setMeetings(await (await fetch('http://localhost:4000/meetings', { headers: { Authorization: 'Bearer ' + token } })).json());
    } else {
      setData((current) => ({ ...current, meetings: [{ id: Date.now(), ...meeting }, ...current.meetings] }));
      setMeetings((prev) => [{ id: Date.now(), ...meeting }, ...prev]);
    }
    setMeeting({ title: '', date: '', participants: '' });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Gestão</p>
          <h2>Compras, finanças e reuniões</h2>
        </div>
      </div>

      <div className="two-column">
        <form className="form-grid" onSubmit={addPurchase}>
          <h3>Compras</h3>
          <input value={purchase.item} onChange={(e) => setPurchase({ ...purchase, item: e.target.value })} placeholder="Material" />
          <input value={purchase.provider} onChange={(e) => setPurchase({ ...purchase, provider: e.target.value })} placeholder="Fornecedor" />
          <input type="number" value={purchase.value} onChange={(e) => setPurchase({ ...purchase, value: e.target.value })} placeholder="Valor" />
          <button type="submit">Registrar compra</button>
        </form>

        <form className="form-grid" onSubmit={addMeeting}>
          <h3>Reuniões</h3>
          <input value={meeting.title} onChange={(e) => setMeeting({ ...meeting, title: e.target.value })} placeholder="Título" />
          <input type="date" value={meeting.date} onChange={(e) => setMeeting({ ...meeting, date: e.target.value })} />
          <input value={meeting.participants} onChange={(e) => setMeeting({ ...meeting, participants: e.target.value })} placeholder="Participantes" />
          <button type="submit">Agendar reunião</button>
        </form>
      </div>

      <div className="two-column">
        <div className="card-list compact-list">
          <h3>Compras</h3>
          {purchases.map((item) => (
            <div className="card small" key={item.id}>
              <h4>{item.item}</h4>
              <p>{item.provider}</p>
              <strong>R$ {Number(item.value || 0).toFixed(2)}</strong>
            </div>
          ))}
        </div>

        <div className="card-list compact-list">
          <h3>Reuniões</h3>
          {meetings.map((item) => (
            <div className="card small" key={item.id}>
              <h4>{item.title}</h4>
              <p>{item.date}</p>
              <small>{item.participants}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
