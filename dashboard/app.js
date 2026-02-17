// Retailer color mapping
const RETAILER_COLORS = {
    'amazon': '#FF9900',
    'target': '#CC0000',
    'walgreens': '#7B1FA2',
    'cvs': '#E91E63',
    'walmart': '#0071CE'
};

// Store chart instances for cleanup
const chartInstances = {};

// Store product data keyed by product ID for chart re-rendering
const productDataStore = {};

// Global date range across all products (for normalizing "All" view)
let globalDateRange = { min: null, max: null };

// Deactivated datasets per product (productId -> Set of retailer names)
const deactivatedDatasets = {};
const DEACTIVATED_COLOR = '#d0d0d0';

// Per-product default time range overrides (defaults to 'all' if not listed)
const DEFAULT_RANGE_OVERRIDES = {
    'eucerin-advanced-repair-lotion-16.9oz': '60'
};

// Real product → category mapping
const REAL_PRODUCT_CATEGORIES = {
    'eucerin-eczema-5oz': 'skincare',
    'eucerin-advanced-repair-lotion-16.9oz': 'skincare',
    'pataday-max-strength': 'allergy',
};

// Fake product catalog for demo categories
// Format: [brand, productName, size, basePrice]
const FAKE_CATALOG = {
    respiratory: [
        ['Mucinex', 'DM 12-Hour Tablets', '20 ct', 18.99],
        ['Mucinex', 'Fast-Max Severe', '20 ct', 16.49],
        ['Mucinex', 'Nightshift Cold + Flu', '20 ct', 15.99],
        ['Flonase', 'Allergy Relief Spray', '120 sprays', 22.99],
        ['Flonase', 'Sensimist Spray', '120 sprays', 24.49],
    ],
    allergy: [
        ['Zyrtec', '24-Hour Tablets', '30 ct', 19.99],
        ['Zyrtec', '24-Hour Tablets', '90 ct', 39.99],
        ['Claritin', '24-Hour Non-Drowsy', '30 ct', 18.99],
        ['Claritin', 'RediTabs', '30 ct', 21.49],
    ],
    diabetes: [
        ['OneTouch', 'Verio Test Strips', '50 ct', 32.99],
        ['OneTouch', 'Ultra Test Strips', '50 ct', 29.99],
        ['FreeStyle', 'Libre 2 Sensor', '2 pk', 69.99],
        ['FreeStyle', 'Lite Test Strips', '50 ct', 28.99],
        ['Contour', 'Next Test Strips', '50 ct', 24.99],
    ],
    digestive: [
        ['Prilosec', 'OTC Acid Reducer', '42 ct', 22.99],
        ['Metamucil', 'Sugar-Free Fiber', '180 ct', 28.99],
        ['Imodium', 'A-D Caplets', '24 ct', 11.99],
        ['Gas-X', 'Extra Strength', '72 ct', 13.49],
        ['Culturelle', 'Daily Probiotic', '30 ct', 24.99],
    ],
    joint: [
        ['Voltaren', 'Arthritis Pain Gel', '3.5 oz', 16.99],
        ['Voltaren', 'Arthritis Pain Gel', '5.3 oz', 22.49],
        ['Biofreeze', 'Pain Relief Roll-On', '2.5 oz', 11.99],
        ['Biofreeze', 'Pain Relief Gel', '3 oz', 10.99],
        ['Move Free', 'Advanced Glucosamine', '80 ct', 22.99],
    ],
    vision: [
        ['Systane', 'Ultra Lubricant Drops', '10 ml', 15.99],
        ['Systane', 'Complete Drops', '10 ml', 17.49],
        ['Refresh', 'Tears Lubricant', '15 ml', 11.99],
        ['Refresh', 'Optive Drops', '15 ml', 14.99],
        ['TheraTears', 'Dry Eye Therapy', '15 ml', 12.49],
    ],
    sleep: [
        ['ResMed', 'AirFit F20 Mask', '1 ct', 89.99],
        ['ResMed', 'AirFit N20 Mask', '1 ct', 79.99],
        ['ZzzQuil', 'Pure Zzzs Melatonin', '48 ct', 16.99],
        ['Breathe Right', 'Nasal Strips', '44 ct', 14.49],
        ['Philips', 'DreamWear Mask', '1 ct', 69.99],
    ],
    pain: [
        ['Advil', 'Ibuprofen 200mg', '100 ct', 11.99],
        ['Advil', 'Dual Action', '72 ct', 14.99],
        ['Tylenol', 'Extra Strength 500mg', '100 ct', 11.49],
        ['Tylenol', 'Arthritis Pain', '170 ct', 16.99],
        ['Aleve', 'Naproxen 220mg', '100 ct', 12.99],
    ],
    heart: [
        ['Omron', 'Series 7 BP Monitor', '1 ct', 64.99],
        ['Omron', 'Series 5 BP Monitor', '1 ct', 49.99],
        ['Nature Made', 'Fish Oil 1200mg', '200 ct', 18.99],
        ['Nature Made', 'CoQ10 100mg', '72 ct', 22.49],
        ['Bayer', 'Low Dose Aspirin 81mg', '300 ct', 11.99],
    ],
    oral: [
        ['Sensodyne', 'Pronamel Toothpaste', '4 oz', 7.99],
        ['Sensodyne', 'Repair + Protect', '3.4 oz', 8.49],
        ['Crest', 'Pro-Health Paste', '4.6 oz', 6.99],
        ['Listerine', 'Total Care Rinse', '1 L', 10.99],
        ['Colgate', 'Peroxyl Rinse', '16 oz', 9.49],
    ],
    hair: [
        ['Rogaine', "Men's 5% Foam", '3 mo', 49.99],
        ['Rogaine', "Women's 2% Solution", '3 mo', 39.99],
        ['Nizoral', 'A-D Shampoo', '7 oz', 15.99],
        ['Nizoral', 'Anti-Dandruff', '14 oz', 24.99],
        ['Head + Shoulders', 'Clinical Strength', '13.5 oz', 9.99],
    ],
    incontinence: [
        ['Depend', 'FIT-FLEX Men', '32 ct', 29.99],
        ['Depend', 'FIT-FLEX Women', '32 ct', 29.99],
        ['Always Discreet', 'Maximum Pads', '39 ct', 19.99],
        ['Always Discreet', 'Underwear', '19 ct', 24.99],
        ['Poise', 'Ultra Thin Pads', '48 ct', 16.99],
    ],
    vitamins: [
        ['Nature Made', 'Vitamin D3 2000IU', '220 ct', 12.99],
        ['Nature Made', 'Vitamin B12 1000mcg', '160 ct', 11.49],
        ['Centrum', 'Silver Men 50+', '200 ct', 19.99],
        ['Centrum', 'Silver Women 50+', '200 ct', 19.99],
        ['One A Day', "Men's Multi", '200 ct', 17.99],
    ],
    hearing: [
        ['Rayovac', 'Size 312 Batteries', '48 pk', 14.99],
        ['Rayovac', 'Size 13 Batteries', '48 pk', 14.99],
        ['Energizer', 'Size 312 Batteries', '16 pk', 8.99],
        ['Energizer', 'Size 10 Batteries', '16 pk', 8.99],
        ['Duracell', 'Size 675 Batteries', '12 pk', 9.49],
    ],
    foot: [
        ["Dr. Scholl's", 'Plantar Fasciitis Insoles', '1 pr', 14.99],
        ["Dr. Scholl's", 'Blister Cushions', '8 ct', 8.49],
        ["Dr. Scholl's", 'Corn Remover', '9 ct', 7.99],
        ['Gold Bond', 'Therapeutic Foot Cream', '4 oz', 8.99],
        ['Kerasal', 'Intensive Foot Repair', '1 oz', 12.99],
    ],
    migraine: [
        ['Excedrin', 'Migraine Caplets', '100 ct', 13.99],
        ['Excedrin', 'Tension Headache', '100 ct', 12.99],
        ['Excedrin', 'PM Headache', '100 ct', 12.49],
        ['Advil', 'Migraine Liqui-Gels', '80 ct', 13.49],
        ['Motrin', 'IB Ibuprofen', '100 ct', 10.99],
    ],
    firstaid: [
        ['Neosporin', 'Original Ointment', '1 oz', 8.99],
        ['Neosporin', 'Pain Relief Ointment', '1 oz', 9.99],
        ['Band-Aid', 'Flexible Fabric', '100 ct', 8.49],
        ['Band-Aid', 'Hydro Seal', '10 ct', 7.99],
        ['Curad', 'Assorted Bandages', '80 ct', 5.99],
    ],
};

// Category data stores for lazy rendering
const categoryDataStore = {};
const renderedCategories = new Set();

// Generate fake chart data with correlated retailer pricing
function generateFakeChartData(basePrice) {
    const retailers = ['amazon', 'target', 'walmart', 'walgreens', 'cvs'];
    const count = 3 + Math.floor(Math.random() * 3);
    const selected = [...retailers].sort(() => 0.5 - Math.random()).slice(0, count);
    const days = 90;
    const trend = [];
    for (let i = 0; i <= days; i++) {
        trend.push(Math.sin(i * 0.07) * 0.03 + Math.sin(i * 0.02) * 0.05);
    }
    return selected.map(retailer => {
        const prices = [];
        const now = new Date();
        const bias = (retailer.charCodeAt(0) % 10 - 5) * 0.01;
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dayIdx = days - i;
            const noise = (Math.random() - 0.5) * 0.04;
            const price = Math.round(basePrice * (1 + trend[dayIdx] + bias + noise) * 100) / 100;
            prices.push({ date: date.toISOString().split('T')[0], price: Math.max(price, basePrice * 0.85) });
        }
        return { retailer, prices };
    });
}

// Derive retailer summary stats from chart data
function deriveRetailerStats(chartData) {
    return chartData.map(rd => {
        const prices = rd.prices.map(p => p.price);
        const high = Math.max(...prices);
        const low = Math.min(...prices);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        return {
            name: rd.retailer,
            high, highDate: rd.prices.find(p => p.price === high).date,
            low, lowDate: rd.prices.find(p => p.price === low).date,
            avg: Math.round(avg * 100) / 100,
            url: '#'
        };
    }).sort((a, b) => a.avg - b.avg);
}

// Build full product object from compact catalog entry
function buildFakeProduct(brand, name, size, basePrice, category) {
    const id = `${brand}-${name}-${size}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const chartData = generateFakeChartData(basePrice);
    const retailers = deriveRetailerStats(chartData);
    return { id, name, brand, size, category, retailers, chartData, fake: true };
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboard();
    setupModalListeners();

    // How It Works modal trigger
    document.getElementById('how-it-works-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('how-it-works-modal').classList.add('show');
    });

    // Category card toggle (multi-select on/off)
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            card.classList.toggle('active');
            filterCategories();
        });
    });

    // Category scroll arrows
    const categoriesContainer = document.querySelector('.header-categories');
    const leftArrow = document.querySelector('.category-arrow-left');
    const rightArrow = document.querySelector('.category-arrow-right');

    if (categoriesContainer && leftArrow && rightArrow) {
        const scrollAmount = 150;

        // Start scrolled all the way to the left
        categoriesContainer.scrollLeft = 0;

        const updateArrowVisibility = () => {
            const { scrollLeft, scrollWidth, clientWidth } = categoriesContainer;
            const atStart = scrollLeft <= 0;
            const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
            leftArrow.classList.toggle('hidden', atStart);
            rightArrow.classList.toggle('hidden', atEnd);
            // Only fade edges that have more content to scroll to
            const leftFade = atStart ? 'black' : 'transparent, black 24px';
            const rightFade = atEnd ? 'black' : 'black calc(100% - 24px), transparent';
            const mask = `linear-gradient(to right, ${leftFade}, ${rightFade})`;
            categoriesContainer.style.maskImage = mask;
            categoriesContainer.style.webkitMaskImage = mask;
        };

        leftArrow.addEventListener('click', () => {
            categoriesContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        rightArrow.addEventListener('click', () => {
            categoriesContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        categoriesContainer.addEventListener('scroll', updateArrowVisibility);
        updateArrowVisibility();
    }

    // Close tooltips when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.callout-tooltip:not(.hidden)').forEach(t => {
            t.classList.add('hidden');
        });
    });
});

// Load dashboard data
async function loadDashboard() {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = '<div class="loading">Loading price data...</div>';

    try {
        const response = await fetch('/api/dashboard-data');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        dashboard.innerHTML = '';

        // Compute global date range across real data
        globalDateRange = { min: null, max: null };
        if (data.brands) {
            data.brands.forEach(brand => {
                brand.products.forEach(product => {
                    product.chartData.forEach(rd => {
                        rd.prices.forEach(p => {
                            const d = new Date(p.date);
                            if (!globalDateRange.min || d < globalDateRange.min) globalDateRange.min = d;
                            if (!globalDateRange.max || d > globalDateRange.max) globalDateRange.max = d;
                        });
                    });
                });
            });
        }

        // Extend to cover fake data range (last 90 days)
        const now = new Date();
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        if (!globalDateRange.min || ninetyDaysAgo < globalDateRange.min) globalDateRange.min = ninetyDaysAgo;
        if (!globalDateRange.max || now > globalDateRange.max) globalDateRange.max = now;

        // Tag real products with categories and organize into categoryDataStore
        if (data.brands) {
            data.brands.forEach(brand => {
                brand.products.forEach(product => {
                    const cat = REAL_PRODUCT_CATEGORIES[product.id] || 'skincare';
                    if (!categoryDataStore[cat]) categoryDataStore[cat] = {};
                    if (!categoryDataStore[cat][brand.name]) categoryDataStore[cat][brand.name] = [];
                    categoryDataStore[cat][brand.name].push(product);
                });
            });
        }

        // Generate fake data and add to categoryDataStore
        Object.entries(FAKE_CATALOG).forEach(([category, entries]) => {
            if (!categoryDataStore[category]) categoryDataStore[category] = {};
            entries.forEach(([brand, name, size, basePrice]) => {
                const product = buildFakeProduct(brand, name, size, basePrice, category);
                if (!categoryDataStore[category][brand]) categoryDataStore[category][brand] = [];
                categoryDataStore[category][brand].push(product);
            });
        });

        // Render initially active categories
        const activeCategories = [...document.querySelectorAll('.category-card.active')]
            .map(c => c.dataset.category);

        if (activeCategories.length === 0) {
            dashboard.innerHTML = '<div class="loading no-categories-msg">Toggle a category above to browse products.</div>';
            return;
        }

        activeCategories.forEach(cat => renderCategorySection(cat, dashboard));

    } catch (error) {
        console.error('Error loading dashboard:', error);
        dashboard.innerHTML = `<div class="loading" style="color: #d32f2f;">Error loading data: ${error.message}<br><br>Make sure the API server is running.</div>`;
    }
}

// Render all brand containers for a category (lazy — only renders once)
function renderCategorySection(category, dashboard) {
    if (renderedCategories.has(category)) {
        const section = dashboard.querySelector(`.category-section[data-category="${category}"]`);
        if (section) section.style.display = '';
        return;
    }

    const categoryBrands = categoryDataStore[category];
    if (!categoryBrands || Object.keys(categoryBrands).length === 0) return;

    const section = document.createElement('div');
    section.className = 'category-section';
    section.dataset.category = category;

    Object.entries(categoryBrands).forEach(([brandName, products]) => {
        renderBrandContainer({ name: brandName, products }, section);
    });

    dashboard.appendChild(section);
    renderedCategories.add(category);
}

// Show/hide category sections based on active toggles
function filterCategories() {
    const dashboard = document.getElementById('dashboard');
    const activeCategories = new Set(
        [...document.querySelectorAll('.category-card.active')].map(c => c.dataset.category)
    );

    // Hide all rendered sections first
    document.querySelectorAll('.category-section').forEach(section => {
        section.style.display = activeCategories.has(section.dataset.category) ? '' : 'none';
    });

    // Render any newly active categories not yet rendered
    activeCategories.forEach(cat => {
        if (!renderedCategories.has(cat)) {
            renderCategorySection(cat, dashboard);
        }
    });

    // Show message if nothing is active
    const emptyMsg = dashboard.querySelector('.no-categories-msg');
    if (activeCategories.size === 0) {
        if (!emptyMsg) {
            const msg = document.createElement('div');
            msg.className = 'loading no-categories-msg';
            msg.textContent = 'Toggle a category above to browse products.';
            dashboard.appendChild(msg);
        }
    } else if (emptyMsg) {
        emptyMsg.remove();
    }
}

// Render a brand container with its products
function renderBrandContainer(brand, container) {
    const template = document.getElementById('brand-container-template');
    const brandElement = template.content.cloneNode(true);

    const brandName = brandElement.querySelector('.brand-name');
    const productsWrapper = brandElement.querySelector('.products-wrapper');
    const collapseToggle = brandElement.querySelector('.collapse-toggle');

    brandName.textContent = brand.name;

    // Add Product button
    const addProductBtn = brandElement.querySelector('.add-product-btn');
    addProductBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openAddProductModal(brand.name);
    });

    // Add collapse functionality
    const brandHeader = brandElement.querySelector('.brand-header');
    brandHeader.addEventListener('click', () => {
        productsWrapper.classList.toggle('collapsed');
        collapseToggle.classList.toggle('collapsed');
    });

    // Render products
    brand.products.forEach(product => {
        renderProduct(product, productsWrapper);
    });

    container.appendChild(brandElement);
}

// Render a single product row
function renderProduct(product, container) {
    const template = document.getElementById('product-row-template');
    const productElement = template.content.cloneNode(true);

    // Set product name and image
    const productName = productElement.querySelector('.product-name');
    const productImage = productElement.querySelector('.product-image');
    const sizeTag = productElement.querySelector('.product-size-tag');

    productName.textContent = product.name;

    // Set product image - try multiple extensions
    const extensions = ['png', 'jpg', 'webp'];
    const productId = product.id;
    productImage.src = `images/products/${productId}.png`;
    productImage.alt = product.name;

    // Try fallback extensions if the first doesn't load
    let extIndex = 0;
    productImage.addEventListener('error', function handler() {
        extIndex++;
        if (extIndex < extensions.length) {
            productImage.src = `images/products/${productId}.${extensions[extIndex]}`;
        } else {
            // Final fallback: brand logo
            if (product.brand) {
                const brandSlug = product.brand.toLowerCase().replace(/\s+/g, '-');
                productImage.src = `images/logos/${brandSlug}.png`;
            }
            productImage.removeEventListener('error', handler);
        }
    });

    // Set size tag
    if (product.size) {
        sizeTag.textContent = product.size;
    } else {
        sizeTag.style.display = 'none';
    }

    // Determine "Consistent Best Value" (lowest avg - already sorted, index 0)
    const bestValueRetailerName = product.retailers[0].name.toLowerCase();
    const bestValueLogoExt = RETAILER_LOGO_EXT[bestValueRetailerName] || 'png';

    // Determine "Today's Best Price" (lowest most recent price per retailer)
    const todaysBest = getTodaysBestPrice(product);
    const todaysBestName = todaysBest.retailer;
    const todaysBestLogoExt = RETAILER_LOGO_EXT[todaysBestName] || 'png';

    // Populate "Today's Best Price" callout
    const bestPriceLogo = productElement.querySelector('.callout-best-price .callout-retailer-logo');
    bestPriceLogo.src = `images/retailers/${todaysBestName}.${todaysBestLogoExt}`;
    bestPriceLogo.alt = capitalizeFirst(todaysBestName);
    const calloutPrice = productElement.querySelector('.callout-best-price .callout-price');
    calloutPrice.innerHTML = priceHtml(todaysBest.price);

    // Add savings calculator link
    const savingsLink = productElement.querySelector('.savings-link');
    savingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSavingsModal(product);
    });

    // Populate "Consistent Best Value" callout
    const bestValueLogo = productElement.querySelector('.callout-best-value .callout-retailer-logo');
    bestValueLogo.src = `images/retailers/${bestValueRetailerName}.${bestValueLogoExt}`;
    bestValueLogo.alt = capitalizeFirst(bestValueRetailerName);
    const bestValuePrice = productElement.querySelector('.callout-best-value .callout-price');
    bestValuePrice.innerHTML = priceHtml(product.retailers[0].avg);

    // Calculate number of days tracked for the subtitle
    const bestRetailerChart = product.chartData.find(
        rd => rd.retailer === bestValueRetailerName
    );
    let daysTracked = 0;
    if (bestRetailerChart && bestRetailerChart.prices.length > 1) {
        const dates = bestRetailerChart.prices.map(p => new Date(p.date));
        const earliest = Math.min(...dates);
        const latest = Math.max(...dates);
        daysTracked = Math.round((latest - earliest) / (1000 * 60 * 60 * 24));
    }
    const subtitle = productElement.querySelector('.callout-subtitle');
    subtitle.textContent = daysTracked > 0
        ? `average price over ${daysTracked} days`
        : `average price`;

    // Add tooltip toggles for both callout cards
    productElement.querySelectorAll('.callout-card').forEach(card => {
        const infoBtn = card.querySelector('.callout-info');
        if (!infoBtn) return;
        const tooltip = card.querySelector('.callout-tooltip');
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close any other open tooltips first
            document.querySelectorAll('.callout-tooltip:not(.hidden)').forEach(t => {
                if (t !== tooltip) t.classList.add('hidden');
            });
            tooltip.classList.toggle('hidden');
        });
    });

    // Determine "Lowest Price Ever" across all retailers
    const lowestEver = getLowestPriceEver(product);

    // Populate "Lowest Price Ever" callout
    const lowestEverCard = productElement.querySelector('.callout-lowest-ever');
    const lowestEverLogo = lowestEverCard.querySelector('.callout-retailer-logo');
    const lowestEverLogoExt = RETAILER_LOGO_EXT[lowestEver.retailer] || 'png';
    lowestEverLogo.src = `images/retailers/${lowestEver.retailer}.${lowestEverLogoExt}`;
    lowestEverLogo.alt = capitalizeFirst(lowestEver.retailer);
    const lowestEverPrice = lowestEverCard.querySelector('.callout-price');
    lowestEverPrice.innerHTML = priceHtml(lowestEver.price);
    const lowestEverSubtitle = lowestEverCard.querySelector('.callout-subtitle');
    lowestEverSubtitle.textContent = `on ${formatDateReadable(lowestEver.date)}`;

    // Render retailer stats (retailers are already sorted by avg, first is best)
    const statsBody = productElement.querySelector('.stats-table tbody');
    product.retailers.forEach((retailer, index) => {
        const isBestValue = index === 0;
        const isTodaysBest = retailer.name.toLowerCase() === todaysBestName;
        const isLowestEver = retailer.name.toLowerCase() === lowestEver.retailer;
        renderRetailerRow(retailer, statsBody, isBestValue, isTodaysBest, isLowestEver);
    });

    // Render trend insights
    const insightsScroll = productElement.querySelector('.insights-scroll');
    renderInsights(product, insightsScroll);

    // Get reference to the canvas before appending
    const canvas = productElement.querySelector('.price-chart');

    // Store product data for re-rendering on range change
    productDataStore[product.id] = product;

    // Append to DOM first
    container.appendChild(productElement);

    // Wire up time range buttons
    const chartWrapper = canvas.closest('.price-chart-wrapper');
    const rangeButtons = chartWrapper.querySelectorAll('.range-btn');
    rangeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            rangeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Re-render chart with selected range
            const range = btn.dataset.range;
            renderChart(canvas, product, range);
        });
    });

    // Build HTML legend with toggle controls
    const legendContainer = chartWrapper.querySelector('.chart-legend');
    const ALL_RETAILERS_LEGEND = ['amazon', 'cvs', 'target', 'walgreens', 'walmart'];
    const retailersWithData = new Set(product.chartData.map(rd => rd.retailer));
    deactivatedDatasets[product.id] = new Set();

    ALL_RETAILERS_LEGEND.forEach(retailer => {
        const hasData = retailersWithData.has(retailer);
        const item = document.createElement('span');
        item.className = 'legend-item';
        item.dataset.retailer = retailer;

        // Auto-deactivate retailers with no data
        if (!hasData) {
            deactivatedDatasets[product.id].add(retailer);
            item.classList.add('inactive');
        }

        const dot = document.createElement('span');
        dot.className = 'legend-dot';
        dot.style.backgroundColor = hasData ? RETAILER_COLORS[retailer] : '';

        const check = document.createElement('span');
        check.className = 'legend-check';
        check.textContent = '✓';
        dot.appendChild(check);

        const label = document.createElement('span');
        label.className = 'legend-label';
        label.textContent = retailerDisplayName(retailer);

        item.appendChild(dot);
        item.appendChild(label);
        legendContainer.appendChild(item);

        item.addEventListener('click', () => {
            if (deactivatedDatasets[product.id].has(retailer)) {
                deactivatedDatasets[product.id].delete(retailer);
                item.classList.remove('inactive');
                dot.style.backgroundColor = RETAILER_COLORS[retailer];
            } else {
                deactivatedDatasets[product.id].add(retailer);
                item.classList.add('inactive');
                dot.style.backgroundColor = '';
            }
            const activeBtn = chartWrapper.querySelector('.range-btn.active');
            const range = activeBtn ? activeBtn.dataset.range : 'all';
            renderChart(canvas, product, range);
        });
    });

    // Determine default range: fake products show 7d, real products use override or 'all'
    const defaultRange = product.fake ? '7d' : (DEFAULT_RANGE_OVERRIDES[product.id] || 'all');
    if (defaultRange !== 'all') {
        rangeButtons.forEach(b => b.classList.remove('active'));
        const defaultBtn = chartWrapper.querySelector(`.range-btn[data-range="${defaultRange}"]`);
        if (defaultBtn) defaultBtn.classList.add('active');
    }

    // Then render chart after element is fully in DOM
    requestAnimationFrame(() => {
        renderChart(canvas, product, defaultRange);
    });
}

// Render price chart with optional time range filter
function renderChart(canvas, product, range) {
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

    // Destroy existing chart instance if re-rendering
    if (chartInstances[product.id]) {
        chartInstances[product.id].destroy();
        delete chartInstances[product.id];
    }

    // Calculate time range bounds
    const now = new Date();
    let rangeMin = null;
    const rangeMax = now;

    if (range && range !== 'all') {
        const days = parseInt(range);
        rangeMin = new Date(now);
        rangeMin.setDate(rangeMin.getDate() - days);
    }

    // Build datasets - always include all 5 retailers in legend
    const ALL_RETAILERS = ['amazon', 'cvs', 'target', 'walgreens', 'walmart'];
    const chartDataMap = {};
    product.chartData.forEach(rd => { chartDataMap[rd.retailer] = rd; });

    const productDeactivated = deactivatedDatasets[product.id] || new Set();

    const datasets = ALL_RETAILERS.map(retailer => {
        const retailerData = chartDataMap[retailer];
        const isDeactivated = productDeactivated.has(retailer);
        const color = isDeactivated ? DEACTIVATED_COLOR : (RETAILER_COLORS[retailer] || '#666');
        let points = [];
        if (retailerData) {
            points = retailerData.prices
                .map(p => ({ x: new Date(p.date), y: p.price }))
                .filter(p => !rangeMin || p.x >= rangeMin);
        }
        return {
            label: retailerDisplayName(retailer),
            data: points,
            borderColor: color,
            backgroundColor: color,
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderDash: retailerData ? [] : [5, 5],
            order: isDeactivated ? 0 : 1
        };
    });

    // Build x-axis config with fixed bounds
    const xScaleConfig = {
        type: 'time',
        time: {
            unit: 'day',
            displayFormats: {
                day: 'MMM d'
            }
        },
        title: {
            display: false
        }
    };

    // Set fixed min/max so all charts share the same width
    if (rangeMin) {
        xScaleConfig.min = rangeMin.toISOString();
        xScaleConfig.max = rangeMax.toISOString();
    } else if (globalDateRange.min && globalDateRange.max) {
        // "All" view: use global date range so all charts have the same x-axis span
        xScaleConfig.min = globalDateRange.min.toISOString();
        xScaleConfig.max = globalDateRange.max.toISOString();
    }

    // Add "Lowest Price Ever" marker dataset (down triangle, stroke only)
    const lowestEver = getLowestPriceEver(product);
    if (lowestEver.retailer && lowestEver.date) {
        const lowestDate = new Date(lowestEver.date);
        // Only show marker if it falls within the current range
        if (!rangeMin || lowestDate >= rangeMin) {
            datasets.push({
                label: 'Lowest Ever',
                data: [{ x: lowestDate, y: lowestEver.price }],
                borderColor: '#999',
                backgroundColor: '#ffffff',
                pointStyle: 'triangle',
                pointRotation: 180,
                pointRadius: 5.5,
                pointHoverRadius: 7,
                pointBorderWidth: 2,
                pointBorderColor: '#999',
                showLine: false,
                order: 0
            });
        }
    }

    // Plugin to draw horizontal dashed line at lowest-ever price
    const lowestEverLinePlugin = {
        id: 'lowestEverLine',
        afterDraw(chart) {
            if (!lowestEver.price || lowestEver.price === Infinity) return;
            const yScale = chart.scales.y;
            const yPixel = yScale.getPixelForValue(lowestEver.price);
            if (yPixel < yScale.top || yPixel > yScale.bottom) return;
            const ctx = chart.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = '#bbb';
            ctx.lineWidth = 1;
            ctx.moveTo(chart.chartArea.left, yPixel);
            ctx.lineTo(chart.chartArea.right, yPixel);
            ctx.stroke();
            ctx.restore();
        }
    };

    // Create chart
    let chart;
    try {
        chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        plugins: [lowestEverLinePlugin],
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.65,
            layout: {
                padding: { bottom: -5 }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    filter: function(tooltipItem) {
                        return tooltipItem.dataset.label !== 'Lowest Ever';
                    },
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: xScaleConfig,
                y: {
                    beginAtZero: false,
                    title: {
                        display: false
                    },
                    ticks: {
                        font: { size: 10 },
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
        });

        // Store chart instance for potential cleanup
        chartInstances[product.id] = chart;
    } catch (error) {
        console.error('Error creating chart:', error);
        canvas.parentElement.innerHTML = '<p style="color: #d32f2f; padding: 20px;">Chart could not be rendered</p>';
    }
}

// Retailer logo file extensions
const RETAILER_LOGO_EXT = {
    'walmart': 'svg',
    'target': 'jpg',
    'amazon': 'png',
    'walgreens': 'png',
    'cvs': 'png'
};

// Render retailer statistics row
function renderRetailerRow(retailer, tbody, isBestValue, isTodaysBest, isLowestEver) {
    const row = document.createElement('tr');
    const name = retailer.name.toLowerCase();
    const ext = RETAILER_LOGO_EXT[name] || 'png';

    // Button color: blue (consistent value) overrides green (today's best)
    let btnClass = 'buy-button';
    if (isBestValue) btnClass = 'buy-button consistent-value';
    else if (isTodaysBest) btnClass = 'buy-button todays-best';

    row.innerHTML = `
        <td><img class="retailer-logo" src="images/retailers/${name}.${ext}" alt="${capitalizeFirst(retailer.name)}"></td>
        <td class="price-cell">
            ${priceHtml(retailer.high)}
            <span class="price-date">${formatDate(retailer.highDate)}</span>
        </td>
        <td class="price-cell">
            ${priceHtml(retailer.low)}
            <span class="price-date">${formatDate(retailer.lowDate)}</span>
        </td>
        <td class="avg-cell">${priceHtml(retailer.avg)}</td>
        <td>
            <a href="${retailer.url}" target="_blank" rel="noopener nofollow" class="${btnClass}">Buy Now</a>
        </td>
    `;

    tbody.appendChild(row);

    // Add tag row underneath if this retailer has any designations
    if (isTodaysBest || isBestValue || isLowestEver) {
        const tagRow = document.createElement('tr');
        tagRow.className = 'tag-row';
        let tags = '';
        if (isTodaysBest) tags += '<span class="retailer-tag todays-best-tag"><span class="tag-check">✓</span> Today\'s Best Price</span>';
        if (isBestValue) tags += '<span class="retailer-tag consistent-tag"><span class="tag-check tag-check-blue">✓</span> Consistent Best Value</span>';
        // Lowest Ever badge removed — was causing layout overflow
        // if (isLowestEver) tags += '<span class="retailer-tag lowest-ever-tag"><span style="font-size:0.8rem;margin-right:-1px">▾</span> Lowest Ever</span>';
        tagRow.innerHTML = `<td colspan="5" style="padding:0;border:none;"><div class="tag-cell">${tags}</div></td>`;
        tbody.appendChild(tagRow);
    }
}

// Show savings calculator modal
function showSavingsModal(product) {
    const modal = document.getElementById('savings-modal');
    const calculation = document.getElementById('savings-calculation');

    // Find best and worst average prices
    const prices = product.retailers.map(r => r.avg).sort((a, b) => a - b);
    const bestAvg = prices[0];
    const worstAvg = prices[prices.length - 1];

    const monthlySavings = worstAvg - bestAvg;
    const yearlySavings = monthlySavings * 12;

    calculation.innerHTML = `
        <strong>Potential Savings Analysis</strong><br><br>
        Buying at the best average price of <strong>${priceHtml(bestAvg)}</strong>
        instead of the worst average of <strong>${priceHtml(worstAvg)}</strong>
        saves you <strong>${priceHtml(monthlySavings)}</strong> per purchase.<br><br>
        If purchased monthly, that's <strong>${priceHtml(yearlySavings)} saved per year!</strong>
    `;

    modal.classList.add('show');
}

// Setup modal event listeners for all modals
function setupModalListeners() {
    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Close any open modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                modal.classList.remove('show');
            });
        }
    });
}

// Get today's best price (lowest most recent price across retailers)
function getTodaysBestPrice(product) {
    let bestRetailer = null;
    let bestPrice = Infinity;

    product.chartData.forEach(rd => {
        if (rd.prices.length > 0) {
            // Get the most recent price for this retailer
            const latest = rd.prices[rd.prices.length - 1];
            if (latest.price < bestPrice) {
                bestPrice = latest.price;
                bestRetailer = rd.retailer;
            }
        }
    });

    return { retailer: bestRetailer, price: bestPrice };
}

// Get lowest price ever recorded across all retailers
function getLowestPriceEver(product) {
    let lowestRetailer = null;
    let lowestPrice = Infinity;
    let lowestDate = null;

    product.chartData.forEach(rd => {
        rd.prices.forEach(p => {
            if (p.price < lowestPrice) {
                lowestPrice = p.price;
                lowestRetailer = rd.retailer;
                lowestDate = p.date;
            }
        });
    });

    return { retailer: lowestRetailer, price: lowestPrice, date: lowestDate };
}

// Placeholder trend insights per retailer
const TREND_INSIGHTS = [
    {
        retailer: 'amazon',
        text: 'Amazon appears to adjust pricing on this category in early December, possibly tied to holiday fulfillment cost changes. Prices rose ~8% before stabilizing in January.',
        confidence: 22,
        date: 'Observed Dec 2025'
    },
    {
        retailer: 'walgreens',
        text: 'Walgreens shows a pattern of dropping prices during summer months (Jun\u2013Aug), possibly due to seasonal promotions or inventory cycling.',
        confidence: 18,
        date: 'Observed Jul\u2013Aug 2025'
    },
    {
        retailer: 'cvs',
        text: 'CVS pricing spiked after an apparent stock shortage. When inventory was restored, prices settled ~3% above pre-shortage levels rather than returning to baseline.',
        confidence: 30,
        date: 'Observed Oct 2025'
    },
    {
        retailer: 'walmart',
        text: 'Walmart maintains the most stable pricing of all tracked retailers. Price variance is under 2% across the full tracking period, suggesting centralized price management.',
        confidence: 55,
        date: 'Ongoing observation'
    },
    {
        retailer: 'target',
        text: 'Target tends to match Amazon\u2019s price within 48\u201372 hours of a change, but rarely initiates price movements independently.',
        confidence: 15,
        date: 'Observed Nov\u2013Dec 2025'
    }
];

// Render trend insight cards for a product
function renderInsights(product, container) {
    // Get which retailers this product has data for
    const activeRetailers = new Set(product.chartData.map(rd => rd.retailer));

    // Filter insights to only relevant retailers, sort by confidence descending
    const relevant = TREND_INSIGHTS.filter(i => activeRetailers.has(i.retailer))
        .sort((a, b) => b.confidence - a.confidence);

    relevant.forEach(insight => {
        const color = RETAILER_COLORS[insight.retailer] || '#999';
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.style.borderLeftColor = color;

        // Determine confidence color
        let confColor = '#e57373'; // red/low
        if (insight.confidence >= 50) confColor = '#4caf50'; // green/high
        else if (insight.confidence >= 30) confColor = '#ffb74d'; // orange/medium

        card.innerHTML = `
            <div class="insight-card-header">
                <span class="insight-retailer" style="color: ${color}">${capitalizeFirst(insight.retailer)}</span>
                <div class="insight-confidence">
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${insight.confidence}%; background-color: ${confColor}"></div>
                    </div>
                    <span class="confidence-value">${insight.confidence}%</span>
                    <span class="confidence-label">AI certainty</span>
                </div>
            </div>
            <p class="insight-text">${insight.text}</p>
            <span class="insight-date">${insight.date}</span>
        `;

        container.appendChild(card);
    });
}

// Utility functions
function priceHtml(value) {
    return `<span class="dollar">$</span>${value.toFixed(2)}`;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function retailerDisplayName(retailer) {
    const special = { 'cvs': 'CVS' };
    return special[retailer] || capitalizeFirst(retailer);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
}

function formatDateReadable(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Product catalog for "Add Product" modal
const PRODUCT_CATALOG = {
    'Eucerin': [
        { id: 'eucerin-eczema-relief-5oz', name: 'Eczema Relief Cream', size: '5 oz' },
        { id: 'eucerin-eczema-relief-8oz', name: 'Eczema Relief Cream', size: '8 oz' },
        { id: 'eucerin-eczema-relief-14oz', name: 'Eczema Relief Cream', size: '14 oz' },
        { id: 'eucerin-eczema-relief-2x8oz', name: 'Eczema Relief Cream', size: '2 x 8 oz' },
        { id: 'eucerin-eczema-relief-body-wash-13.5oz', name: 'Eczema Relief Body Wash', size: '13.5 oz' },
        { id: 'eucerin-eczema-relief-flare-up-2oz', name: 'Eczema Relief Flare-Up Treatment', size: '2 oz' },
        { id: 'eucerin-advanced-repair-16oz', name: 'Advanced Repair Lotion', size: '16 oz' },
        { id: 'eucerin-advanced-repair-2x16oz', name: 'Advanced Repair Lotion', size: '2 x 16 oz' },
        { id: 'eucerin-daily-hydration-16.9oz', name: 'Daily Hydration Lotion', size: '16.9 oz' },
        { id: 'eucerin-original-healing-16oz', name: 'Original Healing Cream', size: '16 oz' },
        { id: 'eucerin-original-healing-2oz', name: 'Original Healing Cream', size: '2 oz' },
        { id: 'eucerin-roughness-relief-16.9oz', name: 'Roughness Relief Lotion', size: '16.9 oz' },
        { id: 'eucerin-intensive-repair-16.9oz', name: 'Intensive Repair Lotion', size: '16.9 oz' },
    ],
    'Pataday': [
        { id: 'pataday-once-daily-2.5ml', name: 'Once Daily Relief', size: '2.5 mL' },
        { id: 'pataday-once-daily-2x2.5ml', name: 'Once Daily Relief', size: '2 x 2.5 mL' },
        { id: 'pataday-once-daily-3x2.5ml', name: 'Once Daily Relief', size: '3 x 2.5 mL' },
        { id: 'pataday-once-daily-8ml', name: 'Once Daily Relief', size: '8 mL' },
        { id: 'pataday-extra-strength-2.5ml', name: 'Extra Strength', size: '2.5 mL' },
        { id: 'pataday-extra-strength-2x2.5ml', name: 'Extra Strength', size: '2 x 2.5 mL' },
        { id: 'pataday-extra-strength-3x2.5ml', name: 'Extra Strength', size: '3 x 2.5 mL' },
        { id: 'pataday-extra-strength-8ml', name: 'Extra Strength', size: '8 mL' },
        { id: 'pataday-twice-daily-5ml', name: 'Twice Daily Relief', size: '5 mL' },
        { id: 'pataday-twice-daily-2x5ml', name: 'Twice Daily Relief', size: '2 x 5 mL' },
        { id: 'olopatadine-0.1-5ml', name: 'Olopatadine 0.1%', size: '5 mL' },
        { id: 'olopatadine-0.2-2.5ml', name: 'Olopatadine 0.2%', size: '2.5 mL' },
        { id: 'olopatadine-0.7-2.5ml', name: 'Olopatadine 0.7%', size: '2.5 mL' },
    ]
};

// Track selected products in Add Product modal
let addProductSelections = new Set();

// Add Product modal logic
function openAddProductModal(brandName) {
    const modal = document.getElementById('add-product-modal');
    const title = document.getElementById('add-product-brand-name');
    const list = modal.querySelector('.add-product-list');

    title.textContent = `Add Product — ${brandName}`;
    list.innerHTML = '';
    addProductSelections.clear();

    const products = PRODUCT_CATALOG[brandName] || [];
    if (products.length === 0) {
        list.innerHTML = '<p style="color: #999; font-size: 0.9rem;">No products available yet.</p>';
    } else {
        products.forEach(product => {
            const item = document.createElement('div');
            item.className = 'add-product-item';
            item.dataset.productId = product.id;
            item.innerHTML = `
                <span class="add-product-toggle">✓</span>
                <div class="add-product-item-info">
                    <span class="add-product-item-name">${product.name}</span>
                    <span class="add-product-item-size">${product.size}</span>
                </div>
            `;
            item.addEventListener('click', () => {
                item.classList.toggle('active');
                if (item.classList.contains('active')) {
                    addProductSelections.add(product.id);
                } else {
                    addProductSelections.delete(product.id);
                }
            });
            list.appendChild(item);
        });
    }

    modal.classList.add('show');

    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.add-product-cancel');
    const saveBtn = modal.querySelector('.add-product-save');

    const closeModal = () => modal.classList.remove('show');

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    saveBtn.onclick = () => {
        if (addProductSelections.size === 0) {
            closeModal();
            return;
        }
        // Placeholder — will wire to backend later
        const selected = Array.from(addProductSelections);
        console.log('Products to add:', selected);
        alert(`Selected ${selected.length} product(s):\n${selected.join('\n')}`);
        closeModal();
    };
}
