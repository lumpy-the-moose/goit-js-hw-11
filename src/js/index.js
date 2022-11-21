import '../css/styles.css';
import fetchImages from './fetch';
import renderMarkup from './markup';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
Notify.init({
  width: '360px',
  position: 'right-top',
  fontSize: '18px',
});

const searchForm = document.querySelector('#search-form');
const searchBox = document.querySelector('#search-box');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');

const per_page = 40;
let page = 1;

const lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

searchForm.addEventListener('submit', async e => {
  e.preventDefault();

  loadMore.style.display = 'none';
  gallery.innerHTML = '';
  page = 1;

  if (!searchBox.value) {
    return;
  }

  const fetchedImages = await fetchImages(searchBox.value, page, per_page);

  if (fetchedImages.total == 0) {
    Notify.info(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  Notify.info(`Hooray! We found ${fetchedImages.totalHits} images.`);
  gallery.insertAdjacentHTML('beforeend', renderMarkup(fetchedImages.hits));

  lightbox.refresh();

  if (per_page * page >= fetchedImages.totalHits) {
    loadMore.style.display = 'none';
    return;
  }

  loadMore.style.display = 'block';
});

loadMore.addEventListener('click', e => {
  page += 1;

  fetchImages(searchBox.value, page, per_page).then(result => {
    gallery.insertAdjacentHTML('beforeend', renderMarkup(result.hits));

    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2 - 170,
      behavior: 'smooth',
    });

    lightbox.refresh();

    if (per_page * page >= result.totalHits) {
      loadMore.style.display = 'none';
      page = 1;
      Notify.info("We're sorry, but you've reached the end of search results.");
      return;
    }
  });
});
