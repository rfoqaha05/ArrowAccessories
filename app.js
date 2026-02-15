// app.js
(() => {
  "use strict";

  // =========================
  // بيانات المنتجات (اكسسوارات نسائية)
  // =========================
  const PRODUCTS = [
    { id: 1,  name: "سلسال قلب مطلي بالذهب",          price: 12.5, desc: "سلسال ناعم مناسب للإطلالات اليومية والمناسبات.", category: "سناسيل", glyph: "💛" },
    { id: 2,  name: "سلسال اسم (تصميم أنيق)",          price: 15,   desc: "سلسال خفيف بطابع أنثوي راقٍ.",                 category: "سناسيل", glyph: "✨" },
    { id: 3,  name: "سوار تينس ستايل كريستال",          price: 18,   desc: "سوار لامع بلمسة فاخرة.",                      category: "أساور",  glyph: "💎" },
    { id: 4,  name: "سوار خرز لؤلؤي",                   price: 9.5,  desc: "سوار لطيف وناعم يناسب الهدايا.",              category: "أساور",  glyph: "🤍" },
    { id: 5,  name: "أقراط حلق صغيرة (Hoops)",          price: 7,    desc: "أقراط خفيفة ومريحة للاستخدام اليومي.",        category: "أقراط",  glyph: "🟡" },
    { id: 6,  name: "أقراط نجمة متدلّية",               price: 8.5,  desc: "شكل أنيق ولمعة جميلة.",                       category: "أقراط",  glyph: "⭐" },
    { id: 7,  name: "خاتم قابل للتعديل (وردة)",         price: 6,    desc: "خاتم أنثوي بمقاس مرن يناسب أغلب الأصابع.",     category: "خواتم",  glyph: "🌸" },
    { id: 8,  name: "خاتم مزدوج مطلي (ستايل عصري)",     price: 7.5,  desc: "لمسة عصرية تناسب كل إطلالة.",                 category: "خواتم",  glyph: "🫧" },
    { id: 9,  name: "طقم (سلسال + سوار) كريستال",       price: 22,   desc: "طقم متناسق لهدية فخمة وبسيطة.",               category: "أطقم",   glyph: "🎁" },
    { id: 10, name: "طقم (أقراط + سلسال) قلب",          price: 19,   desc: "تصميم لطيف وناعم مع لمعة خفيفة.",             category: "أطقم",   glyph: "💖" },
    { id: 11, name: "سوار ستانلس ستيل (حروف)",          price: 11,   desc: "مناسب للتنسيق مع أكثر من سوار.",               category: "أساور",  glyph: "🔗" },
    { id: 12, name: "سلسال طبقات (3 طبقات)",            price: 16.5, desc: "ستايل طبقات يعطي شكل راقٍ ومميز.",            category: "سناسيل", glyph: "🌟" }
  ];

  // =========================
  // مفاتيح التخزين
  // =========================
  const CART_KEY = "arrow_cart_v1";
  const LAST_ORDER_KEY = "arrow_last_order_v1";

  // =========================
  // أدوات مساعدة
  // =========================
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // عملة الأردن: دينار أردني
  function formatMoney(n) {
    const val = Number(n || 0);
    const decimals = (Math.round(val * 100) % 100) === 0 ? 0 : 2;
    return `${val.toFixed(decimals)} د.أ`;
  }

  function safeText(s) {
    return String(s ?? "");
  }

  function getCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) return [];
      return cart
        .filter(x => x && Number.isFinite(+x.id) && Number.isFinite(+x.qty))
        .map(x => ({ id: Number(x.id), qty: Number(x.qty) }))
        .filter(x => x.qty > 0);
    } catch {
      return [];
    }
  }

  function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  function cartCountItems(cart = getCart()) {
    return cart.reduce((sum, it) => sum + Number(it.qty || 0), 0);
  }

  function cartTotal(cart = getCart()) {
    return cart.reduce((sum, it) => {
      const p = PRODUCTS.find(x => x.id === it.id);
      if (!p) return sum;
      return sum + p.price * it.qty;
    }, 0);
  }

  function addToCart(productId, qty = 1) {
    const id = Number(productId);
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    const cart = getCart();
    const found = cart.find(x => x.id === id);
    const addQty = Math.max(1, Math.min(99, Number(qty) || 1));

    if (found) found.qty = Math.min(99, Number(found.qty) + addQty);
    else cart.push({ id, qty: addQty });

    setCart(cart);
    toast("تمت الإضافة للسلة", product.name);
  }

  function removeFromCart(productId) {
    const id = Number(productId);
    const cart = getCart().filter(x => x.id !== id);
    setCart(cart);
  }

  function updateQty(productId, qty) {
    const id = Number(productId);
    let q = Number(qty);
    if (!Number.isFinite(q)) q = 1;
    q = Math.max(1, Math.min(99, Math.round(q)));

    const cart = getCart();
    const found = cart.find(x => x.id === id);
    if (!found) return;

    found.qty = q;
    setCart(cart);
  }

  function clearCart() {
    setCart([]);
  }

  function updateCartBadge() {
    const el = qs("#cartCount");
    if (!el) return;
    el.textContent = String(cartCountItems());
  }

  function toast(title, subtitle = "") {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `
      <span class="dot"></span>
      <div>
        <div class="msg">${safeText(title)}</div>
        ${subtitle ? `<div class="sub">${safeText(subtitle)}</div>` : ""}
      </div>
    `;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateY(6px)";
    }, 2000);
    setTimeout(() => t.remove(), 2450);
  }

  function getParam(name) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  // =========================
  // القوالب والربط
  // =========================
  function productCardHTML(p) {
    return `
      <article class="product-card">
        <a class="product-img" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="عرض ${safeText(p.name)}">
          <span class="tag">${safeText(p.category)}</span>
          <span class="glyph">${safeText(p.glyph || "↗")}</span>
        </a>
        <div class="product-body">
          <h3 class="product-name">
            <a href="product.html?id=${encodeURIComponent(p.id)}">${safeText(p.name)}</a>
          </h3>
          <p class="product-desc">${safeText(p.desc)}</p>
          <div class="product-foot">
            <div class="price">${formatMoney(p.price)} <small>/ قطعة</small></div>
            <div style="display:flex; gap:8px; align-items:center;">
              <a class="icon-btn" href="product.html?id=${encodeURIComponent(p.id)}" title="التفاصيل">ℹ️</a>
              <button class="btn-add primaryish" data-add="${p.id}">أضف</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function bindAddButtons(root = document) {
    qsa("[data-add]", root).forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-add");
        addToCart(Number(id), 1);
      });
    });
  }

  // =========================
  // الرئيسية: منتجات مختارة
  // =========================
  function renderFeatured() {
    const grid = qs("#featuredGrid");
    if (!grid) return;

    const featured = PRODUCTS.slice(0, 8);
    grid.innerHTML = featured.map(productCardHTML).join("");
    bindAddButtons(grid);

    const c = qs("#homeProductsCount");
    if (c) c.textContent = String(PRODUCTS.length);
  }

  // =========================
  // صفحة المنتجات + البحث
  // =========================
  function renderProductsPage() {
    const grid = qs("#productsGrid");
    if (!grid) return;

    const input = qs("#productsSearch");
    const resultsCount = qs("#resultsCount");
    const empty = qs("#emptyState");
    const clearBtn = qs("#clearSearchBtn");

    function applyFilter() {
      const term = (input?.value || "").trim().toLowerCase();
      const filtered = term
        ? PRODUCTS.filter(p => p.name.toLowerCase().includes(term))
        : PRODUCTS.slice();

      if (resultsCount) resultsCount.textContent = `${filtered.length} نتيجة`;

      grid.innerHTML = filtered.map(productCardHTML).join("");
      bindAddButtons(grid);

      if (empty) empty.hidden = filtered.length !== 0;
    }

    if (input) input.addEventListener("input", applyFilter);

    if (clearBtn && input) {
      clearBtn.addEventListener("click", () => {
        input.value = "";
        input.focus();
        applyFilter();
      });
    }

    applyFilter();
  }

  // =========================
  // صفحة تفاصيل المنتج ?id=
  // =========================
  function renderProductDetails() {
    const wrap = qs("#productDetails");
    if (!wrap) return;

    const id = Number(getParam("id"));
    const p = PRODUCTS.find(x => x.id === id);
    const notFound = qs("#notFound");
    const crumbName = qs("#crumbName");

    if (!p) {
      wrap.innerHTML = "";
      if (notFound) notFound.hidden = false;
      if (crumbName) crumbName.textContent = "غير موجود";
      return;
    }

    if (crumbName) crumbName.textContent = p.name;

    wrap.innerHTML = `
      <section class="product-gallery">
        <div class="big">
          <span class="glyph">${safeText(p.glyph || "↗")}</span>
        </div>
        <div class="bar">
          <span class="pill">${safeText(p.category)}</span>
          <span class="pill">كود المنتج: #${p.id}</span>
        </div>
      </section>

      <section class="product-info">
        <h1>${safeText(p.name)}</h1>
        <p class="muted" style="margin:0">${safeText(p.desc)}</p>

        <div class="kv">
          <div class="row">
            <span class="muted">السعر</span>
            <strong style="font-size:22px">${formatMoney(p.price)}</strong>
          </div>
          <div class="row">
            <span class="muted">التوفر</span>
            <strong>متوفر</strong>
          </div>
          <div class="row">
            <span class="muted">الشحن</span>
            <strong>محاكاة (بدون خادم)</strong>
          </div>
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn primary" id="addOneBtn">أضف للسلة</button>
          <button class="btn ghost" id="buyNowBtn">اشترِ الآن</button>
        </div>

        <div class="note">
          يمكنك تعديل الكمية من صفحة السلة قبل تأكيد الطلب.
        </div>
      </section>
    `;

    const addBtn = qs("#addOneBtn");
    const buyBtn = qs("#buyNowBtn");
    if (addBtn) addBtn.addEventListener("click", () => addToCart(p.id, 1));
    if (buyBtn) buyBtn.addEventListener("click", () => {
      addToCart(p.id, 1);
      window.location.href = "cart.html";
    });
  }

  // =========================
  // صفحة السلة
  // =========================
  function renderCartPage() {
    const list = qs("#cartItems");
    if (!list) return;

    const empty = qs("#cartEmpty");
    const summaryCount = qs("#summaryCount");
    const summaryTotal = qs("#summaryTotal");
    const goCheckoutBtn = qs("#goCheckoutBtn");
    const clearBtn = qs("#clearCartBtn");

    function render() {
      const cart = getCart();

      if (cart.length === 0) {
        list.innerHTML = "";
        if (empty) empty.hidden = false;
        if (summaryCount) summaryCount.textContent = "0";
        if (summaryTotal) summaryTotal.textContent = formatMoney(0);
        if (goCheckoutBtn) goCheckoutBtn.classList.add("disabled");
        return;
      }

      if (empty) empty.hidden = true;
      if (goCheckoutBtn) goCheckoutBtn.classList.remove("disabled");

      list.innerHTML = cart.map(it => {
        const p = PRODUCTS.find(x => x.id === it.id);
        if (!p) return "";
        const line = p.price * it.qty;

        return `
          <div class="cart-item" data-row="${p.id}">
            <div>
              <div class="title">${safeText(p.name)}</div>
              <div class="meta">${safeText(p.category)} • ${formatMoney(p.price)} للقطعة</div>
              <div class="meta">الإجمالي: <strong>${formatMoney(line)}</strong></div>
            </div>

            <div class="cart-controls">
              <div class="qty" aria-label="تعديل الكمية">
                <button type="button" data-dec="${p.id}" aria-label="نقص">−</button>
                <input type="number" min="1" max="99" inputmode="numeric" value="${it.qty}" data-qty="${p.id}" aria-label="الكمية" />
                <button type="button" data-inc="${p.id}" aria-label="زيادة">+</button>
              </div>
              <button class="btn remove" type="button" data-remove="${p.id}">إزالة</button>
            </div>
          </div>
        `;
      }).join("");

      if (summaryCount) summaryCount.textContent = String(cartCountItems(cart));
      if (summaryTotal) summaryTotal.textContent = formatMoney(cartTotal(cart));

      qsa("[data-remove]", list).forEach(b => {
        b.addEventListener("click", () => {
          removeFromCart(b.getAttribute("data-remove"));
          render();
        });
      });

      qsa("[data-inc]", list).forEach(b => {
        b.addEventListener("click", () => {
          const id = Number(b.getAttribute("data-inc"));
          const cartNow = getCart();
          const found = cartNow.find(x => x.id === id);
          if (!found) return;
          updateQty(id, found.qty + 1);
          render();
        });
      });

      qsa("[data-dec]", list).forEach(b => {
        b.addEventListener("click", () => {
          const id = Number(b.getAttribute("data-dec"));
          const cartNow = getCart();
          const found = cartNow.find(x => x.id === id);
          if (!found) return;
          updateQty(id, Math.max(1, found.qty - 1));
          render();
        });
      });

      qsa("[data-qty]", list).forEach(inp => {
        inp.addEventListener("change", () => {
          const id = Number(inp.getAttribute("data-qty"));
          updateQty(id, inp.value);
          render();
        });
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        clearCart();
        toast("تم تفريغ السلة");
        render();
      });
    }

    if (goCheckoutBtn) {
      goCheckoutBtn.addEventListener("click", (e) => {
        if (getCart().length === 0) {
          e.preventDefault();
          toast("السلة فارغة", "أضف منتجات أولاً");
        }
      });
    }

    render();
  }

  // =========================
  // صفحة الدفع + رسالة نجاح
  // =========================
  function renderCheckoutPage() {
    const form = qs("#checkoutForm");
    if (!form) return;

    const successBox = qs("#successBox");
    const successMsg = qs("#successMsg");
    const empty = qs("#checkoutEmpty");

    const sumItems = qs("#checkoutSummaryItems");
    const sumCount = qs("#checkoutCount");
    const sumTotalEl = qs("#checkoutTotal");

    function renderSummary() {
      const cart = getCart();

      if (cart.length === 0) {
        if (empty) empty.hidden = false;
        if (form) form.hidden = true;
        if (sumItems) sumItems.innerHTML = "";
        if (sumCount) sumCount.textContent = "0";
        if (sumTotalEl) sumTotalEl.textContent = formatMoney(0);
        return;
      }

      if (empty) empty.hidden = true;
      if (form) form.hidden = false;

      if (sumItems) {
        sumItems.innerHTML = cart.map(it => {
          const p = PRODUCTS.find(x => x.id === it.id);
          if (!p) return "";
          return `
            <div class="mini-item">
              <div>
                <div class="name">${safeText(p.name)}</div>
                <div class="meta">الكمية: ${it.qty}</div>
              </div>
              <strong>${formatMoney(p.price * it.qty)}</strong>
            </div>
          `;
        }).join("");
      }

      if (sumCount) sumCount.textContent = String(cartCountItems(cart));
      if (sumTotalEl) sumTotalEl.textContent = formatMoney(cartTotal(cart));
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const cart = getCart();
      if (cart.length === 0) {
        toast("السلة فارغة", "لا يمكن إتمام الطلب");
        renderSummary();
        return;
      }

      const fullName = qs("#fullName")?.value.trim();
      const phone = qs("#phone")?.value.trim();
      const address = qs("#address")?.value.trim();

      if (!fullName || !phone || !address) {
        toast("يرجى تعبئة البيانات", "الاسم، الجوال، العنوان");
        return;
      }

      const total = cartTotal(cart);
      const orderId = `ARW-${Date.now().toString(36).toUpperCase()}`;

      const order = {
        id: orderId,
        at: new Date().toISOString(),
        customer: { fullName, phone, address },
        items: cart,
        total
      };

      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      clearCart();

      if (form) form.hidden = true;
      if (successBox) successBox.hidden = false;
      if (successMsg) {
        successMsg.textContent = `رقم الطلب: ${orderId} — الإجمالي: ${formatMoney(total)}. سنتواصل معك (محاكاة) لتأكيد الشحن.`;
      }

      toast("تم تأكيد الطلب", `رقم الطلب: ${orderId}`);

      renderSummary();
      updateCartBadge();
    });

    renderSummary();
  }

  // =========================
  // بحث الهيدر (Enter) → products.html
  // =========================
  function bindHeaderSearch() {
    const input = qs("#headerSearch");
    if (!input) return;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const term = input.value.trim();
        if (!term) return;
        sessionStorage.setItem("arrow_search_term", term);
        window.location.href = "products.html";
      }
    });

    const isProducts = location.pathname.endsWith("products.html");
    if (isProducts) {
      const stored = sessionStorage.getItem("arrow_search_term");
      if (stored) {
        const pInput = qs("#productsSearch");
        if (pInput) pInput.value = stored;
        sessionStorage.removeItem("arrow_search_term");
      }
    }
  }

  function setYear() {
    const y = qs("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  // =========================
  // INIT
  // =========================
  function init() {
    setYear();
    updateCartBadge();
    bindHeaderSearch();

    // حسب الصفحة الموجودة
    if (qs("#featuredGrid")) renderFeatured();
    if (qs("#productsGrid")) renderProductsPage();
    if (qs("#productDetails")) renderProductDetails();
    if (qs("#cartItems")) renderCartPage();
    if (qs("#checkoutForm")) renderCheckoutPage();

    // أزرار الإضافة إن وجدت
    bindAddButtons(document);
  }

  document.addEventListener("DOMContentLoaded", init);

  // (اختياري) للتجربة من الكونسول
  window.ArrowAccessories = {
    PRODUCTS,
    getCart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart
  };
})();
