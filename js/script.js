(function() {

    /* ── Efeito 3D no produto ── */
    var productContainer = document.getElementById('product3D');
    var productImage = document.getElementById('productImage3D');
    if (productContainer && productImage) {
        productContainer.addEventListener('mousemove', function(e) {
            var rect = productContainer.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var rotateX = ((y - rect.height / 2) / rect.height) * -15;
            var rotateY = ((x - rect.width  / 2) / rect.width)  *  15;
            productImage.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.05,1.05,1.05)';
        });
        productContainer.addEventListener('mouseleave', function() {
            productImage.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        });
    }

    /* ── Slider antes/depois ── */
    var divider = document.getElementById('baDivider1');
    if (divider) {
        var container = divider.parentElement;
        var afterImage = container.querySelector('.ba-image-after');
        var isDragging = false;
        var handleDrag = function(e) {
            if (!isDragging) return;
            var rect = container.getBoundingClientRect();
            var clientX = e.touches ? e.touches[0].clientX : e.clientX;
            var x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            var pct = (x / rect.width) * 100;
            afterImage.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
            divider.style.left = pct + '%';
        };
        container.addEventListener('mousedown',  function() { isDragging = true; });
        container.addEventListener('touchstart', function() { isDragging = true; }, { passive: true });
        window.addEventListener('mouseup',  function() { isDragging = false; });
        window.addEventListener('touchend', function() { isDragging = false; });
        window.addEventListener('mousemove', handleDrag);
        window.addEventListener('touchmove', handleDrag, { passive: true });
    }

    /* ── Timeline ativa ao scroll ── */
    var timelineSteps    = document.querySelectorAll('.timeline-step');
    var timelineProgress = document.getElementById('timelineProgress');

    function activateTimeline() {
        if (!timelineSteps.length) return;
        var activeIndex = 0;
        timelineSteps.forEach(function(step, index) {
            var rect = step.getBoundingClientRect();
            if (rect.left < window.innerWidth * 0.7) activeIndex = index;
        });
        timelineSteps.forEach(function(step, index) {
            step.classList.toggle('active', index <= activeIndex);
        });
        if (timelineProgress) {
            timelineProgress.style.width = (activeIndex / (timelineSteps.length - 1) * 100) + '%';
        }
    }
    window.addEventListener('scroll', activateTimeline);
    window.addEventListener('load',   activateTimeline);

    /* ── Canvas neon girando nos nós de ingredientes ── */
    document.querySelectorAll('.node-canvas').forEach(function(canvas) {
        var ctx   = canvas.getContext('2d');
        var W = 60, H = 60, cx = 30, cy = 30, frame = 0;
        function draw() {
            ctx.clearRect(0, 0, W, H);
            var angle = (frame / 80) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(cx, cy, 26, angle, angle + Math.PI * 1.4);
            ctx.strokeStyle = 'rgba(0,240,255,0.55)';
            ctx.lineWidth   = 2;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, 18, -angle * 1.3, -angle * 1.3 + Math.PI);
            ctx.strokeStyle = 'rgba(0,128,255,0.38)';
            ctx.lineWidth   = 1.5;
            ctx.stroke();
            var px = cx + 26 * Math.cos(angle + Math.PI * 1.4);
            var py = cy + 26 * Math.sin(angle + Math.PI * 1.4);
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,240,255,0.9)';
            ctx.fill();
            frame++;
            requestAnimationFrame(draw);
        }
        draw();
    });

    /* ── Gráfico de eficácia ── */
    (function() {
        var canvas = document.getElementById('efficacyChart');
        if (!canvas) return;

        function drawChart() {
            var container = canvas.parentElement;
            var W   = container.clientWidth || 500;
            var H   = 300;
            var DPR = window.devicePixelRatio || 1;
            canvas.width  = W * DPR;
            canvas.height = H * DPR;
            canvas.style.width  = W + 'px';
            canvas.style.height = H + 'px';
            var ctx = canvas.getContext('2d');
            ctx.scale(DPR, DPR);

            var labels = ['Mês 1','Mês 2','Mês 3','Mês 4','Mês 5','Mês 6'];
            var velmo  = [4.2, 8.5, 13.8, 18.1, 22.5, 26.0];
            var conv   = [1.5, 3.0,  4.2,  5.0,  5.8,  6.5];
            var maxVal = 30;
            var PAD    = { top: 28, right: 28, bottom: 48, left: 52 };
            var CW = W - PAD.left - PAD.right;
            var CH = H - PAD.top  - PAD.bottom;

            function X(i)   { return PAD.left + (i / (labels.length - 1)) * CW; }
            function Y(val) { return PAD.top  + CH - (val / maxVal) * CH; }

            [0, 10, 20, 30].forEach(function(v) {
                var y = Y(v);
                ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + CW, y);
                ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.stroke();
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
                ctx.fillText(v + 'kg', PAD.left - 8, y + 4);
            });

            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
            labels.forEach(function(lbl, i) { ctx.fillText(lbl, X(i), H - 10); });

            function drawLine(data, color, dash) {
                ctx.beginPath(); ctx.moveTo(X(0), Y(data[0]));
                data.forEach(function(v, i) { if (i > 0) ctx.lineTo(X(i), Y(v)); });
                ctx.lineTo(X(data.length - 1), Y(0)); ctx.lineTo(X(0), Y(0)); ctx.closePath();
                ctx.fillStyle = color.replace('1)', '0.15)');
                ctx.fill();
                ctx.beginPath(); ctx.moveTo(X(0), Y(data[0]));
                data.forEach(function(v, i) { if (i > 0) ctx.lineTo(X(i), Y(v)); });
                ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
                ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
                data.forEach(function(v, i) {
                    ctx.beginPath(); ctx.arc(X(i), Y(v), 5, 0, Math.PI * 2);
                    ctx.fillStyle = color; ctx.fill();
                    ctx.strokeStyle = '#050505'; ctx.lineWidth = 2; ctx.stroke();
                });
            }
            drawLine(conv,  'rgba(100,116,139,1)', [5, 5]);
            drawLine(velmo, 'rgba(0,240,255,1)');
        }

        var obs = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) { drawChart(); obs.unobserve(canvas); }
        }, { threshold: 0.1 });
        obs.observe(canvas);
    })();

    /* ── Partículas da seção ciência ── */
    var pc = document.getElementById('scienceParticles');
    if (pc) {
        for (var i = 0; i < 25; i++) {
            var p = document.createElement('div');
            p.className = 'science-particle';
            p.style.cssText = 'left:' + Math.random()*100 + '%;top:' + Math.random()*100 + '%;'
                + 'width:' + (2 + Math.random()*3) + 'px;height:' + (2 + Math.random()*3) + 'px;'
                + 'animation-delay:' + Math.random()*6 + 's;animation-duration:' + (5 + Math.random()*7) + 's;';
            pc.appendChild(p);
        }
    }

    /* ── Newsletter ── */
    var form = document.getElementById('newsletterForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var s = document.getElementById('newsletterSuccess');
            if (s) { s.style.display = 'block'; }
            form.reset();
        });
    }

    /* ── Contador de unidades restantes ── */
    var counterEl = document.querySelector('.strip-counter .counter-number');
    if (counterEl) {
        var units = parseInt(counterEl.textContent) || 6;
        function decreaseUnits() {
            if (units > 1) { units--; counterEl.textContent = units; }
            else { units = 6; counterEl.textContent = units; }
            setTimeout(decreaseUnits, Math.floor(Math.random() * 60000) + 30000);
        }
        setTimeout(decreaseUnits, 45000);
    }

})();