import { useEffect, useState } from "react";
import { getOutfits } from "./api";

function Outfits() {
  const [outfits, setOutfits] = useState([]);

  useEffect(() => {
    getOutfits().then(setOutfits);
  }, []);

  return (
    <div className="outfits">
      {outfits.map(o => (
        <div key={o.id} className="outfit-card">
          <h3>{o.nombre}</h3>

          <div className="outfit-grid">
            {o.prendas.map(p => (
              <img
                key={p.id}
                src={`http://localhost/armario/uploads/${p.imagen}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Outfits;