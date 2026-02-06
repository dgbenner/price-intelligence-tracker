// Retailer color mapping
const RETAILER_COLORS = {
    'amazon': '#FF9900',
    'target': '#CC0000',
    'walgreens': '#E31837',
    'cvs': '#c4242b',
    'walmart': '#0071CE'
};

// Store chart instances for cleanup
const chartInstances = {};

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboard();
    setupModalListeners();

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

        if (!data.brands || data.brands.length === 0) {
            dashboard.innerHTML = '<div class="loading">No price data available yet. Please check back after the first data collection run.</div>';
            return;
        }

        // Render each brand container
        data.brands.forEach(brand => {
            renderBrandContainer(brand, dashboard);
        });

    } catch (error) {
        console.error('Error loading dashboard:', error);
        dashboard.innerHTML = `<div class="loading" style="color: #d32f2f;">Error loading data: ${error.message}<br><br>Make sure the API server is running.</div>`;
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

    // Render retailer stats (retailers are already sorted by avg, first is best)
    const statsBody = productElement.querySelector('.stats-table tbody');
    product.retailers.forEach((retailer, index) => {
        const isBestValue = index === 0;
        const isTodaysBest = retailer.name.toLowerCase() === todaysBestName;
        renderRetailerRow(retailer, statsBody, isBestValue, isTodaysBest);
    });

    // Render trend insights
    const insightsScroll = productElement.querySelector('.insights-scroll');
    renderInsights(product, insightsScroll);

    // Get reference to the canvas before appending
    const canvas = productElement.querySelector('.price-chart');

    // Append to DOM first
    container.appendChild(productElement);

    // Then render chart after element is fully in DOM
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
        renderChart(canvas, product);
    });
}

// Render price chart
function renderChart(canvas, product) {
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

    // Build datasets - always include all 5 retailers in legend
    const ALL_RETAILERS = ['amazon', 'cvs', 'target', 'walgreens', 'walmart'];
    const chartDataMap = {};
    product.chartData.forEach(rd => { chartDataMap[rd.retailer] = rd; });

    const datasets = ALL_RETAILERS.map(retailer => {
        const retailerData = chartDataMap[retailer];
        return {
            label: capitalizeFirst(retailer),
            data: retailerData ? retailerData.prices.map(p => ({
                x: new Date(p.date),
                y: p.price
            })) : [],
            borderColor: RETAILER_COLORS[retailer] || '#666',
            backgroundColor: RETAILER_COLORS[retailer] || '#666',
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderDash: retailerData ? [] : [5, 5]
        };
    });

    // Create chart
    let chart;
    try {
        chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.65,
            layout: {
                padding: { bottom: -5 }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 25,
                        boxWidth: 5,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
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
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price ($)'
                    },
                    ticks: {
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
function renderRetailerRow(retailer, tbody, isBestValue, isTodaysBest) {
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
    if (isTodaysBest || isBestValue) {
        const tagRow = document.createElement('tr');
        tagRow.className = 'tag-row';
        let tags = '';
        if (isTodaysBest) tags += '<span class="retailer-tag todays-best-tag"><span class="tag-check">✓</span> Today\'s Best Price</span>';
        if (isBestValue) tags += '<span class="retailer-tag consistent-tag"><span class="tag-check tag-check-blue">✓</span> Consistent Best Value</span>';
        tagRow.innerHTML = `<td colspan="5" class="tag-cell">${tags}</td>`;
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

// Setup modal event listeners
function setupModalListeners() {
    const modal = document.getElementById('savings-modal');
    const closeBtn = modal.querySelector('.close');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
}
