// Component definitions and management
const Components = (function() {
  const DEFS = {
    battery: {
      id: 'battery',
      name: 'Battery',
      widthCells: 2,
      heightCells: 1,
      pixelWidth: 90,
      pixelHeight: 44,
      ports: [
        { id: 'pos', type: 'positive', side: 'right', offsetX: 90, offsetY: 22, label: '+', labelClass: 'label-pos' },
        { id: 'neg', type: 'negative', side: 'left', offsetX: -6, offsetY: 22, label: '-', labelClass: 'label-neg' }
      ],
      render: function() {
        return '<div class="comp-body">' +
          '<div style="width:80px;height:40px;background:linear-gradient(180deg,#B0B0B0,#909090);border:3px solid #5D4037;border-radius:6px;position:relative;">' +
          '<div style="position:absolute;right:-10px;top:8px;width:10px;height:24px;background:#C0C0C0;border:2px solid #5D4037;border-left:none;border-radius:0 4px 4px 0;"></div>' +
          '<span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#E74C3C;font-weight:900;font-size:16px;">+</span>' +
          '<span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#333;font-weight:900;font-size:16px;">-</span>' +
          '</div></div>';
      }
    },
    bulb: {
      id: 'bulb',
      name: 'Bulb',
      widthCells: 1,
      heightCells: 2,
      pixelWidth: 52,
      pixelHeight: 72,
      ports: [
        { id: 'left', type: 'neutral', side: 'left', offsetX: -2, offsetY: 26 },
        { id: 'right', type: 'neutral', side: 'right', offsetX: 52, offsetY: 26 }
      ],
      render: function() {
        return '<div class="comp-body">' +
          '<div class="bulb-glass" style="width:40px;height:40px;background:#E0E0E0;border:3px solid #5D4037;border-radius:50% 50% 30% 30%;margin:0 auto;"></div>' +
          '<div style="width:28px;height:14px;background:#A0A0A0;border:2px solid #5D4037;border-top:none;margin:0 auto;border-radius:0 0 4px 4px;"></div>' +
          '</div>';
      }
    }
  };

  let placedComponents = [];
  let nextId = 1;

  function getDef(type) {
    return DEFS[type];
  }

  function create(type, col, row) {
    const def = DEFS[type];
    if (!def) return null;
    const comp = {
      uid: 'comp_' + nextId++,
      type: type,
      def: def,
      col: col,
      row: row,
      element: null
    };
    placedComponents.push(comp);
    return comp;
  }

  function remove(uid) {
    const idx = placedComponents.findIndex(c => c.uid === uid);
    if (idx >= 0) {
      const comp = placedComponents[idx];
      if (comp.element) comp.element.remove();
      placedComponents.splice(idx, 1);
      return comp;
    }
    return null;
  }

  function getAll() {
    return placedComponents;
  }

  function getByUid(uid) {
    return placedComponents.find(c => c.uid === uid);
  }

  function getByType(type) {
    return placedComponents.filter(c => c.type === type);
  }

  function clearAll() {
    placedComponents.forEach(c => { if (c.element) c.element.remove(); });
    placedComponents = [];
  }

  function renderToDOM(comp) {
    const layer = document.getElementById('componentsLayer');
    const pos = Grid.gridToPixel(comp.col, comp.row);
    const el = document.createElement('div');
    el.className = 'placed-component ' + comp.type + '-placed';
    el.dataset.uid = comp.uid;
    el.style.left = (pos.x - comp.def.pixelWidth / 2) + 'px';
    el.style.top = (pos.y - comp.def.pixelHeight / 2) + 'px';
    el.innerHTML = comp.def.render();

    // Add ports
    comp.def.ports.forEach(port => {
      const portEl = document.createElement('div');
      portEl.className = 'port';
      portEl.dataset.uid = comp.uid;
      portEl.dataset.portId = port.id;
      portEl.dataset.portType = port.type;
      portEl.style.left = (port.offsetX - 7) + 'px';
      portEl.style.top = (port.offsetY - 7) + 'px';
      el.appendChild(portEl);

      if (port.label) {
        const lbl = document.createElement('span');
        lbl.className = 'port-label ' + port.labelClass;
        lbl.textContent = port.label;
        portEl.appendChild(lbl);
      }
    });

    layer.appendChild(el);
    comp.element = el;
    return el;
  }

  function updatePosition(comp) {
    if (!comp.element) return;
    const pos = Grid.gridToPixel(comp.col, comp.row);
    comp.element.style.left = (pos.x - comp.def.pixelWidth / 2) + 'px';
    comp.element.style.top = (pos.y - comp.def.pixelHeight / 2) + 'px';
  }

  function setBulbLit(uid, lit) {
    const comp = getByUid(uid);
    if (!comp || comp.type !== 'bulb') return;
    const glass = comp.element.querySelector('.bulb-glass');
    if (glass) {
      if (lit) {
        glass.classList.add('lit');
        glass.style.background = '#FFD700';
        glass.style.boxShadow = '0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,215,0,0.3)';
      } else {
        glass.classList.remove('lit');
        glass.style.background = '#E0E0E0';
        glass.style.boxShadow = 'none';
      }
    }
  }

  return {
    getDef, create, remove, getAll, getByUid, getByType, clearAll,
    renderToDOM, updatePosition, setBulbLit, DEFS
  };
})();
