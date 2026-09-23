/*
	Lightbox for the photo gallery.
	Each .gallery-item is a link to the large image, so the page still works without JS.
	Keys: Esc closes, Left/Right navigate. Swipe on touch screens.
*/
(function() {
	var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
	if (!items.length) return;

	// Photos uploaded from /admin have no stored size; take the aspect ratio from the loaded image.
	items.forEach(function(it) {
		if (it.style.getPropertyValue('--ar')) return;
		var thumb = it.querySelector('img');
		function setRatio() {
			if (thumb.naturalWidth) it.style.setProperty('--ar', (thumb.naturalWidth / thumb.naturalHeight).toFixed(3));
		}
		thumb.addEventListener('load', setRatio);
		setRatio();
	});

	var box = document.createElement('div');
	box.className = 'lb';
	box.setAttribute('role', 'dialog');
	box.setAttribute('aria-modal', 'true');
	box.setAttribute('aria-label', 'Photo viewer');
	box.innerHTML =
		'<div class="lb-stage"><div class="lb-spinner"></div><img class="lb-img" alt="" /></div>' +
		'<button class="lb-btn lb-close" aria-label="Close">&times;</button>' +
		'<button class="lb-btn lb-prev" aria-label="Previous photo">&#8249;</button>' +
		'<button class="lb-btn lb-next" aria-label="Next photo">&#8250;</button>' +
		'<div class="lb-bar"><span class="lb-caption"></span>' +
		'<span class="lb-right"><span class="lb-count"></span>' +
		'<a class="lb-original" target="_blank" rel="noopener">Original &#8599;</a></span></div>';
	document.body.appendChild(box);

	var img = box.querySelector('.lb-img'),
		caption = box.querySelector('.lb-caption'),
		count = box.querySelector('.lb-count'),
		original = box.querySelector('.lb-original'),
		index = 0,
		lastFocus = null;

	function preload(i) {
		var it = items[(i + items.length) % items.length];
		new Image().src = it.getAttribute('href');
	}

	function show(i) {
		index = (i + items.length) % items.length;
		var it = items[index];
		box.classList.add('is-loading');
		img.onload = function() { box.classList.remove('is-loading'); };
		img.src = it.getAttribute('href');
		img.alt = it.querySelector('img').alt;
		caption.textContent = it.getAttribute('data-caption') || '';
		count.textContent = (index + 1) + ' / ' + items.length;
		original.hidden = !it.hasAttribute('data-original');
		original.href = it.getAttribute('data-original') || it.getAttribute('href');
		preload(index + 1);
		preload(index - 1);
	}

	function open(i) {
		lastFocus = document.activeElement;
		show(i);
		box.classList.add('is-open');
		document.documentElement.classList.add('lb-lock');
		box.querySelector('.lb-close').focus();
	}

	function close() {
		box.classList.remove('is-open');
		document.documentElement.classList.remove('lb-lock');
		img.removeAttribute('src');
		if (lastFocus) lastFocus.focus();
	}

	items.forEach(function(it, i) {
		it.addEventListener('click', function(e) {
			if (e.metaKey || e.ctrlKey || e.shiftKey) return;
			e.preventDefault();
			open(i);
		});
	});

	box.querySelector('.lb-close').addEventListener('click', close);
	box.querySelector('.lb-prev').addEventListener('click', function() { show(index - 1); });
	box.querySelector('.lb-next').addEventListener('click', function() { show(index + 1); });
	box.addEventListener('click', function(e) {
		if (e.target === box || e.target.classList.contains('lb-stage')) close();
	});

	document.addEventListener('keydown', function(e) {
		if (!box.classList.contains('is-open')) return;
		if (e.key === 'Escape') close();
		else if (e.key === 'ArrowLeft') show(index - 1);
		else if (e.key === 'ArrowRight') show(index + 1);
	});

	var startX = null, startY = null;
	box.addEventListener('touchstart', function(e) {
		startX = e.touches[0].clientX;
		startY = e.touches[0].clientY;
	}, { passive: true });
	box.addEventListener('touchend', function(e) {
		if (startX === null) return;
		var dx = e.changedTouches[0].clientX - startX,
			dy = e.changedTouches[0].clientY - startY;
		if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
		else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) close();
		startX = null;
	});
})();
