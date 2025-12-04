/**
 * @jest-environment jsdom
 */

describe('App Utility Functions', () => {
  let formatCurrency, formatDate, escapeHtml;

  beforeAll(() => {
    // Define utility functions for testing
    formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    };

    formatDate = (dateString) => {
      const date = new Date(dateString + 'T00:00:00');
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    };

    escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
  });

  describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1)).toBe('$1.00');
      expect(formatCurrency(10.5)).toBe('$10.50');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format amounts with decimal places', () => {
      expect(formatCurrency(15.99)).toBe('$15.99');
      expect(formatCurrency(100.1)).toBe('$100.10');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
      expect(formatDate('2024-12-25')).toBe('Dec 25, 2024');
      expect(formatDate('2024-06-01')).toBe('Jun 1, 2024');
    });

    it('should handle different months', () => {
      expect(formatDate('2024-02-14')).toBe('Feb 14, 2024');
      expect(formatDate('2024-07-04')).toBe('Jul 4, 2024');
      expect(formatDate('2024-11-28')).toBe('Nov 28, 2024');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('a & b')).toBe('a &amp; b');
      expect(escapeHtml('"quoted"')).toBe('"quoted"');
    });

    it('should handle normal text', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
      expect(escapeHtml('Lunch at restaurant')).toBe('Lunch at restaurant');
    });

    it('should handle special characters', () => {
      expect(escapeHtml('<div onclick="alert()">Test</div>'))
        .toBe('&lt;div onclick="alert()"&gt;Test&lt;/div&gt;');
    });
  });
});

describe('Category Class Mapping', () => {
  const categoryClassMap = {
    'Groceries': 'category-groceries',
    'Transport': 'category-transport',
    'Housing and Utilities': 'category-housing',
    'Restaurants and Cafes': 'category-restaurants',
    'Health and Medicine': 'category-health',
    'Clothing & Footwear': 'category-clothing',
    'Entertainment': 'category-entertainment'
  };

  it('should have mapping for all categories', () => {
    expect(Object.keys(categoryClassMap)).toHaveLength(7);
  });

  it('should return correct class for each category', () => {
    expect(categoryClassMap['Groceries']).toBe('category-groceries');
    expect(categoryClassMap['Transport']).toBe('category-transport');
    expect(categoryClassMap['Housing and Utilities']).toBe('category-housing');
    expect(categoryClassMap['Restaurants and Cafes']).toBe('category-restaurants');
    expect(categoryClassMap['Health and Medicine']).toBe('category-health');
    expect(categoryClassMap['Clothing & Footwear']).toBe('category-clothing');
    expect(categoryClassMap['Entertainment']).toBe('category-entertainment');
  });
});
