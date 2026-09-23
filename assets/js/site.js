// Dark mode toggle. The initial theme is applied inline in <head> to avoid a flash.
(function() {
	var btn = document.querySelector('.theme-toggle');
	if (!btn) return;
	btn.addEventListener('click', function() {
		var root = document.documentElement,
			current = root.getAttribute('data-theme') ||
				(matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
			next = current === 'dark' ? 'light' : 'dark';
		root.setAttribute('data-theme', next);
		try { localStorage.setItem('theme', next); } catch (e) {}
	});
})();
