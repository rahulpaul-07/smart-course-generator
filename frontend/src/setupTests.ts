import '@testing-library/jest-dom';

// Mock IntersectionObserver for Framer Motion / jsdom
class IntersectionObserver {
  observe = () => null;
  unobserve = () => null;
  disconnect = () => null;
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

// Mock scrollIntoView for jsdom
window.HTMLElement.prototype.scrollIntoView = function() {};
window.Element.prototype.scrollIntoView = function() {};
