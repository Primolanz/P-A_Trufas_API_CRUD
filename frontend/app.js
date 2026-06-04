const WHATSAPP_PHONE = '5514988360010';
const configuredApiUrl = (window.PA_TRUFAS_API_URL || '').trim().replace(/\/$/, '');
const API_URL = configuredApiUrl || `${window.location.origin}/api`;

const state = {
  trufas: [],
  cart: new Map(),
};

const catalogGrid = document.querySelector('#catalog-grid');
const emptyMessage = document.querySelector('#empty-message');
const loadingScreen = document.querySelector('#loading-screen');
const cartPanel = document.querySelector('#cart-panel');
const cartToggle = document.querySelector('#cart-toggle');
const closeCartButton = document.querySelector('#close-cart');
const scrim = document.querySelector('#scrim');
const cartItems = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const checkoutButton = document.querySelector('#checkout-button');

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildWhatsappUrl = (message) => {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
};

const fetchWithRetry = async (path, attempts = 12) => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(`${API_URL}${path}`);

      if (!response.ok) {
        throw new Error(`Resposta HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (attempt === attempts) {
        throw error;
      }

      await sleep(2200);
    }
  }
};

const openCart = () => {
  cartPanel.classList.add('is-open');
  cartPanel.setAttribute('aria-hidden', 'false');
  scrim.classList.add('is-open');
};

const closeCart = () => {
  cartPanel.classList.remove('is-open');
  cartPanel.setAttribute('aria-hidden', 'true');
  scrim.classList.remove('is-open');
};

const getCartItems = () => {
  return [...state.cart.entries()]
    .map(([id, quantidade]) => {
      const trufa = state.trufas.find((item) => item.id === id);
      return trufa ? { ...trufa, quantidade } : null;
    })
    .filter(Boolean);
};

const updateCheckoutLink = (items, total) => {
  if (items.length === 0) {
    checkoutButton.classList.add('disabled');
    checkoutButton.setAttribute('href', '#');
    return;
  }

  const lines = items.map((item) => {
    const subtotal = item.quantidade * item.preco;
    return `- ${item.quantidade}x ${item.nome} (${currency.format(subtotal)})`;
  });

  const message = [
    'opa!! gostaria de finalizar esse pedido:',
    '',
    ...lines,
    '',
    `Total: ${currency.format(total)}`,
  ].join('\n');

  checkoutButton.classList.remove('disabled');
  checkoutButton.setAttribute('href', buildWhatsappUrl(message));
};

const renderCart = () => {
  const items = getCartItems();
  const totalItems = items.reduce((sum, item) => sum + item.quantidade, 0);
  const total = items.reduce((sum, item) => sum + item.quantidade * item.preco, 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = currency.format(total);
  updateCheckoutLink(items, total);

  if (items.length === 0) {
    cartItems.innerHTML = '<p class="empty-message">Seu carrinho esta vazio.</p>';
    return;
  }

  cartItems.innerHTML = items.map((item) => `
    <article class="cart-item">
      <div class="cart-item-top">
        <div>
          <h3>${item.nome}</h3>
          <span class="price">${currency.format(item.preco)}</span>
        </div>
        <div class="quantity-controls" aria-label="Quantidade de ${item.nome}">
          <button type="button" data-action="decrement" data-id="${item.id}" aria-label="Diminuir quantidade">-</button>
          <span>${item.quantidade}</span>
          <button type="button" data-action="increment" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <button class="remove-button" type="button" data-action="remove" data-id="${item.id}">Remover</button>
    </article>
  `).join('');
};

const addToCart = (id) => {
  state.cart.set(id, (state.cart.get(id) || 0) + 1);
  renderCart();
};

const changeQuantity = (id, amount) => {
  const currentQuantity = state.cart.get(id) || 0;
  const nextQuantity = currentQuantity + amount;

  if (nextQuantity <= 0) {
    state.cart.delete(id);
  } else {
    state.cart.set(id, nextQuantity);
  }

  renderCart();
};

const renderCatalog = () => {
  const availableTrufas = state.trufas.filter((trufa) => trufa.disponivel !== false);
  emptyMessage.hidden = availableTrufas.length > 0;

  catalogGrid.innerHTML = availableTrufas.map((trufa) => {
    const message = `opa!! gostaria de uma ${trufa.nome}.`;

    return `
      <article class="trufa-card">
        <header>
          <h3>${trufa.nome}</h3>
          <span class="price">${currency.format(trufa.preco)}</span>
        </header>
        <p class="description">${trufa.descricao || 'Trufa artesanal feita sob encomenda.'}</p>
        <div class="card-actions">
          <button class="primary-button" type="button" data-action="add" data-id="${trufa.id}">
            Adicionar
          </button>
          <a class="whatsapp-link" href="${buildWhatsappUrl(message)}" target="_blank" rel="noreferrer">
            Pedir agora
          </a>
        </div>
      </article>
    `;
  }).join('');
};

const loadTrufas = async () => {
  loadingScreen.classList.remove('is-hidden');
  state.trufas = await fetchWithRetry('/trufas');
  renderCatalog();
  renderCart();
  loadingScreen.classList.add('is-hidden');
};

catalogGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="add"]');

  if (!button) {
    return;
  }

  addToCart(Number(button.dataset.id));
});

cartItems.addEventListener('click', (event) => {
  const control = event.target.closest('[data-action]');

  if (!control) {
    return;
  }

  const id = Number(control.dataset.id);

  if (control.dataset.action === 'increment') {
    changeQuantity(id, 1);
  }

  if (control.dataset.action === 'decrement') {
    changeQuantity(id, -1);
  }

  if (control.dataset.action === 'remove') {
    state.cart.delete(id);
    renderCart();
  }
});

cartToggle.addEventListener('click', openCart);
closeCartButton.addEventListener('click', closeCart);
scrim.addEventListener('click', closeCart);

loadTrufas().catch((error) => {
  console.error(error);
  loadingScreen.innerHTML = `
    <p>Nao consegui carregar o cardapio.</p>
    <small>Confira a URL da API em config.js e tente atualizar a pagina.</small>
  `;
});
