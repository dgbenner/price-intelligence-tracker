// Retailer color mapping
const RETAILER_COLORS = {
    'amazon': '#FF9900',
    'target': '#CC0000',
    'walgreens': '#E31837',
    'cvs': '#CC0000',
    'walmart': '#0071CE'
};

// Store chart instances for cleanup
const chartInstances = {};

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboard();
    setupModalListeners();
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

    const brandSection = brandElement.querySelector('.brand-container');
    const brandName = brandElement.querySelector('.brand-name');
    const productsWrapper = brandElement.querySelector('.products-wrapper');
    const overallBest = brandElement.querySelector('.overall-best');
    const collapseToggle = brandElement.querySelector('.collapse-toggle');

    brandName.textContent = brand.name;
    overallBest.textContent = `Overall best value: ${brand.bestRetailer} - consistently lowest average price`;

    // Add collapse functionality
    const brandHeader = brandElement.querySelector('.brand-header');
    brandHeader.addEventListener('click', () => {
        productsWrapper.classList.toggle('collapsed');
        collapseToggle.classList.toggle('collapsed');
    });

    // Add tooltip toggle
    const infoIcon = brandElement.querySelector('.info-icon');
    const tooltip = brandElement.querySelector('.footer-tooltip');
    infoIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.classList.toggle('hidden');
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

    // Set product name and logo
    const productName = productElement.querySelector('.product-name');
    const productLogo = productElement.querySelector('.product-logo');
    const logoWrapper = productElement.querySelector('.product-logo-wrapper');

    productName.textContent = product.name;

    // For now, use placeholder logo with brand name
    logoWrapper.innerHTML = `<div style="font-weight: 600; color: #666; font-size: 1.2rem;">${product.brand}</div>`;

    // Set best average price
    const bestPriceText = productElement.querySelector('.best-price-text');
    bestPriceText.textContent = `$${product.bestAvgPrice.toFixed(2)} at ${product.bestRetailer}`;

    // Add savings calculator link
    const savingsLink = productElement.querySelector('.savings-link');
    savingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSavingsModal(product);
    });

    // Set product-level best value footer
    const productBestValue = productElement.querySelector('.product-best-value');
    productBestValue.textContent = `Overall best value: ${product.bestRetailer} - consistently lowest average price`;

    // Add tooltip toggle for product footer
    const productInfoIcon = productElement.querySelector('.product-info-icon');
    const productTooltip = productElement.querySelector('.product-tooltip');
    productInfoIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        productTooltip.classList.toggle('hidden');
    });

    // Render retailer stats
    const statsBody = productElement.querySelector('.stats-table tbody');
    product.retailers.forEach(retailer => {
        renderRetailerRow(retailer, statsBody);
    });

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

    // Prepare datasets for each retailer
    const datasets = product.chartData.map(retailerData => ({
        label: capitalizeFirst(retailerData.retailer),
        data: retailerData.prices.map(p => ({
            x: new Date(p.date),
            y: p.price
        })),
        borderColor: RETAILER_COLORS[retailerData.retailer] || '#666',
        backgroundColor: RETAILER_COLORS[retailerData.retailer] || '#666',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6
    }));

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
            aspectRatio: 2,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15
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
                        display: true,
                        text: 'Date'
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

// Render retailer statistics row
function renderRetailerRow(retailer, tbody) {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td><span class="retailer-name ${retailer.name.toLowerCase()}">${capitalizeFirst(retailer.name)}</span></td>
        <td>
            $${retailer.high.toFixed(2)}
            <span class="price-date">${formatDate(retailer.highDate)}</span>
        </td>
        <td>
            $${retailer.low.toFixed(2)}
            <span class="price-date">${formatDate(retailer.lowDate)}</span>
        </td>
        <td>$${retailer.avg.toFixed(2)}</td>
        <td>
            <a href="${retailer.url}" target="_blank" rel="noopener nofollow" class="buy-button">Buy Now</a>
        </td>
    `;

    tbody.appendChild(row);
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
        Buying at the best average price of <strong>$${bestAvg.toFixed(2)}</strong>
        instead of the worst average of <strong>$${worstAvg.toFixed(2)}</strong>
        saves you <strong>$${monthlySavings.toFixed(2)}</strong> per purchase.<br><br>
        If purchased monthly, that's <strong>$${yearlySavings.toFixed(2)} saved per year!</strong>
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

// Utility functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
