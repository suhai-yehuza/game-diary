// @ts-check

/**
 * Initialize mock mode flags before React hydration.
 * Reads from the data-mock-mode attribute on the HTML element
 * to ensure consistent state between server and client.
 *
 * @typedef {Object} CustomWindow
 * @property {boolean} [__MOCK_MODE__]
 * @property {boolean} [__SERVER_MOCK_MODE__]
 */

(function () {
  if (typeof window !== 'undefined') {
    const mockMode = document.documentElement.getAttribute('data-mock-mode') === 'true';

    /** @type {Window & CustomWindow} */
    const customWindow = window;
    customWindow.__MOCK_MODE__ = mockMode;
    customWindow.__SERVER_MOCK_MODE__ = mockMode;
  }
})();
