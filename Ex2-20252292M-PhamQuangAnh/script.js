const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav-links');
const navigationLinks = [...document.querySelectorAll('.nav-links a')];
const pageSections = navigationLinks
	.map((link) => document.querySelector(link.getAttribute('href')))
	.filter(Boolean);

function applyTheme(theme) {
	root.dataset.theme = theme;
	const isLight = theme === 'light';
	themeToggle.setAttribute('aria-label', isLight ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng');
	themeToggle.querySelector('span').textContent = isLight ? '☾' : '☼';
}

let savedTheme = 'dark';
try {
	savedTheme = localStorage.getItem('traygo-theme') || 'dark';
} catch {
	// Trang vẫn hoạt động nếu trình duyệt chặn localStorage.
}
applyTheme(savedTheme === 'light' ? 'light' : 'dark');

themeToggle.addEventListener('click', () => {
	const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
	applyTheme(nextTheme);
	try {
		localStorage.setItem('traygo-theme', nextTheme);
	} catch {
		// Không làm gián đoạn thao tác đổi giao diện khi không thể lưu.
	}
});

menuToggle.addEventListener('click', () => {
	const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
	menuToggle.setAttribute('aria-expanded', String(!isOpen));
	menuToggle.setAttribute('aria-label', isOpen ? 'Mở menu' : 'Đóng menu');
	menuToggle.querySelector('span').textContent = isOpen ? '☰' : '×';
	navigation.classList.toggle('is-open', !isOpen);
});

navigationLinks.forEach((link) => {
	link.addEventListener('click', () => {
		navigation.classList.remove('is-open');
		menuToggle.setAttribute('aria-expanded', 'false');
		menuToggle.setAttribute('aria-label', 'Mở menu');
		menuToggle.querySelector('span').textContent = '☰';
	});
});

function updateCurrentSection() {
	let currentSection = null;
	for (const section of pageSections) {
		if (section.getBoundingClientRect().top <= 150) currentSection = section;
	}
	navigationLinks.forEach((link) => {
		const isCurrent = currentSection && link.getAttribute('href') === `#${currentSection.id}`;
		link.classList.toggle('is-current', isCurrent);
		if (isCurrent) link.setAttribute('aria-current', 'location');
		else link.removeAttribute('aria-current');
	});
}

let scrollFrame = 0;
window.addEventListener('scroll', () => {
	if (scrollFrame) return;
	scrollFrame = window.requestAnimationFrame(() => {
		updateCurrentSection();
		scrollFrame = 0;
	});
}, { passive: true });
updateCurrentSection();

const slides = [...document.querySelectorAll('.slide')];
const sliderDots = [...document.querySelectorAll('.slider-dot')];
let activeSlide = 0;

function showSlide(index) {
	activeSlide = (index + slides.length) % slides.length;
	slides.forEach((slide, slideIndex) => {
		const isActive = slideIndex === activeSlide;
		slide.hidden = !isActive;
		slide.classList.toggle('is-active', isActive);
		slide.setAttribute('aria-hidden', String(!isActive));
		sliderDots[slideIndex].classList.toggle('is-active', isActive);
		sliderDots[slideIndex].setAttribute('aria-current', String(isActive));
	});
}

document.querySelectorAll('.slider-arrow').forEach((button) => {
	button.addEventListener('click', () => showSlide(activeSlide + (button.dataset.direction === 'next' ? 1 : -1)));
});
sliderDots.forEach((button) => button.addEventListener('click', () => showSlide(Number(button.dataset.slide))));

const reviews = [
	{ name: 'Minh Anh', location: 'Cầu Giấy', topic: 'speed', rating: 5, text: 'TrayGo giao rất nhanh, đồ ăn vẫn nóng và mình luôn theo dõi được tài xế đang ở đâu.' },
	{ name: 'Tuấn Dũng', location: 'Hai Bà Trưng', topic: 'value', rating: 5, text: 'Mình tìm được nhiều quán quen trên TrayGo, giá rõ ràng và đặt món cực kỳ tiện.' },
	{ name: 'Ngọc Hà', location: 'Đống Đa', topic: 'variety', rating: 5, text: 'Có nhiều lựa chọn cho cả nhóm, ai cũng tìm được món hợp khẩu vị của mình.' },
	{ name: 'Quang Huy', location: 'Ba Đình', topic: 'speed', rating: 4, text: 'Ứng dụng cập nhật đơn dễ hiểu, bữa trưa văn phòng đến đúng lúc nghỉ.' },
	{ name: 'Lan Phương', location: 'Thanh Xuân', topic: 'value', rating: 5, text: 'Phí giao và giá món hiển thị rõ ràng trước khi đặt, không có khoản nào bất ngờ.' },
	{ name: 'Đức Anh', location: 'Tây Hồ', topic: 'variety', rating: 5, text: 'Từ món ăn nhẹ đến bữa tối đều có quán gần nhà để chọn.' }
];

const reviewList = document.querySelector('#review-list');
const reviewSearch = document.querySelector('#review-search');
const reviewFilter = document.querySelector('#review-filter');
const reviewCount = document.querySelector('#review-count');
const reviewEmpty = document.querySelector('#review-empty');

function renderItems(data) {
	const cards = data.map((review) => {
		const article = document.createElement('article');
		article.className = 'review-card';

		const rating = document.createElement('p');
		rating.className = 'review-rating';
		rating.setAttribute('aria-label', `Đánh giá ${review.rating} trên 5 sao`);
		rating.textContent = `${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}`;

		const quote = document.createElement('blockquote');
		quote.textContent = `“${review.text}”`;

		const author = document.createElement('p');
		author.className = 'review-author';
		author.textContent = review.name;

		const location = document.createElement('p');
		location.className = 'review-location';
		location.textContent = review.location;

		article.append(rating, quote, author, location);
		return article;
	});

	reviewList.replaceChildren(...cards);
	reviewCount.textContent = `${data.length} đánh giá`;
	reviewEmpty.hidden = data.length > 0;
}

function filterReviews() {
	const searchTerm = reviewSearch.value.trim().toLocaleLowerCase('vi');
	const selectedTopic = reviewFilter.value;
	const filteredReviews = reviews.filter((review) => {
		const matchesSearch = `${review.name} ${review.location} ${review.text}`.toLocaleLowerCase('vi').includes(searchTerm);
		const matchesTopic = selectedTopic === 'all' || review.topic === selectedTopic;
		return matchesSearch && matchesTopic;
	});
	renderItems(filteredReviews);
}

reviewSearch.addEventListener('input', filterReviews);
reviewFilter.addEventListener('change', filterReviews);
renderItems(reviews);

const orderForm = document.querySelector('#order-form');
const nameInput = document.querySelector('#customer-name');
const emailInput = document.querySelector('#customer-email');
const formStatus = document.querySelector('#form-status');

function setFieldError(input, message) {
	const error = document.querySelector(`#${input.id.replace('customer-', '')}-error`);
	input.setAttribute('aria-invalid', String(Boolean(message)));
	error.textContent = message;
}

orderForm.addEventListener('submit', (event) => {
	event.preventDefault();
	formStatus.textContent = '';
	const name = nameInput.value.trim();
	const email = emailInput.value.trim();
	const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	setFieldError(nameInput, name ? '' : 'Vui lòng nhập họ và tên.');
	setFieldError(emailInput, !email ? 'Vui lòng nhập email.' : validEmail ? '' : 'Email chưa đúng định dạng, ví dụ ten@domain.com.');

	if (!name || !validEmail) {
		(name ? emailInput : nameInput).focus();
		return;
	}

	formStatus.textContent = `Cảm ơn ${name}, yêu cầu đã được ghi nhận.`;
	orderForm.reset();
});

[nameInput, emailInput].forEach((input) => {
	input.addEventListener('input', () => {
		if (input.value.trim()) setFieldError(input, '');
		formStatus.textContent = '';
	});
});