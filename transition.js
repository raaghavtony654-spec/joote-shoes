const SQ_SIZE = window.innerWidth < 768 ? 60 : 100;

function createGrid(container, isEnter) {
    if (!container) return { squares: [], cols: 0, rows: 0 };
    container.innerHTML = '';
    const cols = Math.ceil(window.innerWidth / SQ_SIZE);
    const rows = Math.ceil(window.innerHeight / SQ_SIZE);
    
    container.style.display = 'grid';
    container.style.background = 'transparent';
    container.style.pointerEvents = isEnter ? 'none' : 'all';
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    const squares = [];
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const sq = document.createElement('div');
            sq.className = 'transition-square';
            
            // Distance from bottom-left corner
            // bottom row is r = rows - 1, left col is c = 0
            const dist = c + (rows - 1 - r);
            
            // Calculate delay for stagger effect (0.04s per step)
            sq.style.transitionDelay = `${dist * 0.04}s`;
            
            if (isEnter) {
                // If entering the page, squares start fully covering the screen
                sq.style.transform = 'scale(1.02)';
            } else {
                // If exiting the page, squares start hidden
                sq.style.transform = 'scale(0)';
            }
            
            container.appendChild(sq);
            squares.push(sq);
        }
    }
    
    return { squares, cols, rows };
}

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('pageTransition');
    const initialLoader = document.getElementById('initialLoader');
    const hasLoaded = sessionStorage.getItem('jooteLoaded');
    
    // Initial loading animation
    if (initialLoader) {
        if (!hasLoaded) {
            const loaderLogo = document.getElementById('loaderLogo');
            const targetLogo = document.querySelector('.nav__logo-main');
            const logoContainer = document.querySelector('.loader-logo-container');
            
            if (targetLogo) {
                targetLogo.style.opacity = '0'; // Hide real one initially
            }
            
            // Hide grid transition overlay so it never blocks the loader or page
            if (overlay) {
                overlay.style.display = 'none';
                overlay.style.background = 'transparent';
                overlay.style.pointerEvents = 'none';
            }
            
            // 1. Start cinematic golden shimmer & bloom animation
            setTimeout(() => {
                if (logoContainer) logoContainer.classList.add('active');
                if (loaderLogo) loaderLogo.classList.add('revealing');
            }, 150);
            
            // 2. Fly to top-left after shimmer & bloom completes
            setTimeout(() => {
                if (targetLogo && loaderLogo) {
                    const targetRect = targetLogo.getBoundingClientRect();
                    const sourceRect = loaderLogo.getBoundingClientRect();
                    
                    // Calculate scale and delta
                    const scale = targetRect.height / sourceRect.height;
                    const deltaX = (targetRect.left + targetRect.width / 2) - (sourceRect.left + sourceRect.width / 2);
                    const deltaY = (targetRect.top + targetRect.height / 2) - (sourceRect.top + sourceRect.height / 2);
                    
                    // Move
                    loaderLogo.classList.add('moving');
                    loaderLogo.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
                    
                    // Fade out background to reveal site beneath
                    initialLoader.style.backgroundColor = 'transparent';
                    initialLoader.style.pointerEvents = 'none';
                    
                    // 3. Complete and clean up
                    setTimeout(() => {
                        targetLogo.style.opacity = '1';
                        if (initialLoader) initialLoader.remove();
                        sessionStorage.setItem('jooteLoaded', 'true');
                        if (overlay) {
                            overlay.style.display = 'none';
                            overlay.style.background = 'transparent';
                            overlay.style.pointerEvents = 'none';
                            overlay.innerHTML = '';
                        }
                    }, 1200); // 1.2s FLIP glide
                } else {
                    if (initialLoader) initialLoader.remove();
                    sessionStorage.setItem('jooteLoaded', 'true');
                }
            }, 2250); // 150ms delay + 1800ms shimmer + 300ms pause
            
        } else {
            // Already loaded this session, remove loader immediately
            if (initialLoader) initialLoader.remove();
            
            // Normal grid entrance animation
            if (overlay) {
                const { squares } = createGrid(overlay, true);
                overlay.style.display = 'grid';
                overlay.style.background = 'transparent';
                overlay.style.pointerEvents = 'none';
                overlay.offsetHeight;
                squares.forEach(sq => {
                    sq.style.transform = 'scale(0)';
                });
                
                setTimeout(() => {
                    overlay.style.display = 'none';
                    overlay.style.pointerEvents = 'none';
                    squares.forEach(sq => sq.remove());
                }, 1200);
            }
        }
    } else if (overlay) {
        // Fallback if no initial loader element
        const { squares } = createGrid(overlay, true);
        overlay.style.display = 'grid';
        overlay.style.background = 'transparent';
        overlay.style.pointerEvents = 'none';
        overlay.offsetHeight;
        squares.forEach(sq => {
            sq.style.transform = 'scale(0)';
        });
        
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.pointerEvents = 'none';
            squares.forEach(sq => sq.remove());
        }, 1200);
    }
    
    // Intercept navigation links
    document.querySelectorAll('a.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = e.currentTarget.href;
            if (target && target !== window.location.href && !target.includes('#')) {
                e.preventDefault();
                
                if (overlay) {
                    overlay.style.display = 'grid';
                    overlay.style.pointerEvents = 'all';
                    overlay.style.background = 'transparent';
                    
                    // Exit Animation (Leaving Page)
                    const { squares: outSquares, cols: outCols, rows: outRows } = createGrid(overlay, false);
                    const maxDist = (outCols - 1) + (outRows - 1);
                    
                    overlay.offsetHeight;
                    
                    outSquares.forEach(sq => {
                        sq.style.transform = 'scale(1.02)';
                    });
                    
                    const totalDuration = (maxDist * 0.04) + 0.6;
                    
                    setTimeout(() => {
                        window.location.href = target;
                    }, totalDuration * 1000);
                } else {
                    window.location.href = target;
                }
            }
        });
    });
});
