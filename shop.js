document.addEventListener('DOMContentLoaded', () => {
    const shopGrid = document.getElementById('shopGrid');
    const featuredContainer = document.getElementById('shopFeatured');
    
    // 1. Generate Featured Banner
    if (featuredContainer) {
        // IDs of the 5 featured shoes for the top banner (matches IDs in data.js)
        const featuredIds = [1, 3, 2, 4, 6];
        
        const featuredHtml = featuredIds.map(id => {
            const p = products.find(p => p.id === id);
            if (!p) return '';
            return `
                <a href="${p.link}" class="featured-col page-link" style="background-color: ${p.color}">
                    <img src="${p.image}" alt="${p.name}" class="featured-img" loading="lazy">
                </a>
            `;
        }).join('');
        
        featuredContainer.innerHTML = featuredHtml;
    }
    
    // 2. Generate Full Shop Grid
    if (shopGrid && typeof products !== 'undefined') {
        products.forEach(p => {
            const card = document.createElement('a');
            card.href = p.link;
            card.className = 'shop-card';
            card.style.setProperty('--card-color', p.color);
            card.target = '_blank';
            
            const priceHtml = p.price 
                ? `<div class="shop-card__price">₹${p.price.toLocaleString('en-IN')}</div>`
                : `<div class="shop-card__coming-soon">Coming Soon</div>`;
                
            card.innerHTML = `
                <div class="shop-card__bg"></div>
                <img src="${p.image}" alt="${p.name}" class="shop-card__img" loading="lazy">
                <div class="shop-card__craft">${p.craft.toUpperCase()}</div>
                <h2 class="shop-card__name">${p.name}</h2>
                <div class="shop-card__origin">${p.origin}</div>
                ${priceHtml}
            `;
            
            shopGrid.appendChild(card);
        });
    }
});
