(function(){
  'use strict';

  const script = document.currentScript;
  const scriptSrc = script ? script.getAttribute('src') || '' : '';
  const rootPrefix = scriptSrc.replace(/assets\/js\/bw-header\.js(?:\?.*)?$/, '');
  const path = window.location.pathname;
  const file = path.split('/').pop() || 'index.html';
  const folder = path.split('/').slice(-2, -1)[0] || '';
  const isHome = file === 'index.html' && !/\/products\/|\/product-taxonomy\//.test(path);

  function homeHref(){ return rootPrefix + 'index.html'; }

  function pageHasProductLayout(){
    return !!document.querySelector('.product-layout, .angular-layout, [data-product-slug]');
  }

  function pageLooksLikeProductGuideItem(){
    const title = (document.title || '').toLowerCase();
    return file !== 'product-guide.html' && title.includes('bw product guide');
  }

  function backHref(){
    if (isHome) return homeHref();

    const bodyBack = document.body && document.body.getAttribute('data-back');
    if (bodyBack) return rootPrefix + bodyBack.replace(/^\.\//, '');

    if (folder === 'products') return rootPrefix + 'product-guide.html';
    if (folder === 'product-taxonomy') return rootPrefix + 'product-taxonomy.html';

    // New product-page system: all product detail pages use the same shell and return to Product Guide.
    if (
  file !== 'product-guide.html' &&
  (pageHasProductLayout() || pageLooksLikeProductGuideItem())
){
  return rootPrefix + 'product-guide.html';
}

    const parentMap = {
      // Secondary pages
      'product-guide.html': 'index.html',
      'resources.html': 'index.html',
      'sops.html': 'index.html',
      'sales.html': 'index.html',
      'faqs.html': 'index.html',
      'photos.html': 'index.html',
      'admin.html': 'index.html',
      'settings.html': 'index.html',

      // Resources children
      'product-taxonomy.html': 'resources.html',
      'rack-builder.html': 'resources.html',
      'rack-builder-individual.html': 'rack-builder.html',
      'warehouse-map.html': 'rack-builder.html',
      'rack-builder 2.html': 'resources.html',
      'order.html': 'resources.html',
      'crm1.html': 'resources.html',
      'account-applications.html': 'resources.html',
      'supplier-directory.html': 'resources.html',
      'resources-accounts.html': 'resources.html',
      'resources-calculators.html': 'resources.html',
      'resources-core.html': 'resources.html',
      'resources-templates.html': 'resources.html',
      'resources-tools.html': 'resources.html',

      // SOP children
      'sop-sales.html': 'sops.html',
      'sop-purchasing.html': 'sops.html',
      'sop-inventory.html': 'sops.html',
      'sop-reports.html': 'sops.html',
      'sop-safety.html': 'sops.html',
      'sop-accounts.html': 'sops.html',

      // Product taxonomy children
      'product-taxonomy-category.html': 'product-taxonomy.html'
    };
    return rootPrefix + (parentMap[file] || 'index.html');
  }

  function mailHref(){
    const subject = encodeURIComponent('Suggested edit');
    const body = encodeURIComponent(window.location.href + '\n\nSuggested edit:\n');
    return 'mailto:sales@bearingwholesalers.com.au?subject=' + subject + '&body=' + body;
  }

  function buildHeader(){
    const mount = document.getElementById('bw-global-header');
    if (!mount) return;

    mount.innerHTML = '';
    const header = document.createElement('header');
    header.className = 'bw-site-header';

    const navButtons = isHome ? '' : `
      <a class="btn bw-nav-btn" id="bwBackBtn" href="${backHref()}">← Back</a>
      <a class="btn bw-nav-btn" id="bwHomeBtn" href="${homeHref()}">⌂ Home</a>`;

    header.innerHTML = `
      <div class="bw-header-inner">
        <a class="bw-header-logo logoBanner" href="${homeHref()}" aria-label="Home">
          <img alt="Bearing Wholesalers" class="siteLogo" src="${rootPrefix}assets/img/logo-cropped-white.png" />
        </a>
        <nav class="bw-header-nav" aria-label="Page navigation">
          ${navButtons}
          <span class="bw-store-label">Bayswater</span>
          <button class="btn bw-extra-btn" id="bwChangeStoreBtn" type="button">Change Store</button>
          <a class="btn bw-extra-btn" id="bwSuggestEditBtn" href="${mailHref()}">Suggest Edit</a>
        </nav>
      </div>`;

    mount.appendChild(header);


    // Subtle project signature, injected by the shared header so it travels with the dashboard shell.
    if (!document.getElementById('bwBuiltSignatureStyle')) {
      const sigStyle = document.createElement('style');
      sigStyle.id = 'bwBuiltSignatureStyle';
      sigStyle.textContent = `
        .bw-built-signature{
          position:fixed;
          right:10px;
          bottom:7px;
          z-index:20;
          font-size:10px;
          letter-spacing:.04em;
          color:rgba(229,231,235,.30);
          pointer-events:none;
          user-select:none;
          text-shadow:0 1px 2px rgba(0,0,0,.35);
        }
        @media print{.bw-built-signature{position:fixed;right:8mm;bottom:4mm;color:rgba(16,32,51,.25);font-size:7px}}
      `;
      document.head.appendChild(sigStyle);
    }
    if (!document.querySelector('.bw-built-signature')) {
      const sig = document.createElement('div');
      sig.className = 'bw-built-signature';
      sig.setAttribute('aria-hidden', 'true');
      sig.dataset.buildCredit = 'H. Fitzgerald';
      sig.textContent = String.fromCharCode(68,101,115,105,103,110,101,100,32,97,110,100,32,98,117,105,108,116,32,98,121,32,72,46,32,70,105,116,122,103,101,114,97,108,100);
      document.body.appendChild(sig);
    }

    const extras = document.querySelector('.bw-page-actions');
    const right = header.querySelector('.bw-header-nav');
    if (extras && right) {
      Array.from(extras.children).forEach(node => {
        const label = (node.textContent || '').trim().toLowerCase();
        const action = (node.getAttribute('data-action') || '').toLowerCase();
        if (label === 'dev notes' || label === 'admin' || action === 'devnote' || action === 'admin') return;
        node.classList.add('bw-extra-btn');
        right.appendChild(node);
      });
      extras.remove();
    }

    const change = document.getElementById('bwChangeStoreBtn');
    if (change) {
      change.addEventListener('click', function(){
        window.dispatchEvent(new CustomEvent('bw:change-store'));
        if (!window.BW_CHANGE_STORE_HANDLED) {
          alert('Store selection is not connected yet. Current store: Bayswater');
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildHeader);
  } else {
    buildHeader();
  }
})();
