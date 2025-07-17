import { formatCurrency, formatDate, formatDocument, formatPhone } from '../format';

describe('Format Utils', () => {
  describe('formatCurrency', () => {
    it('should format a number as BRL currency', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
    });
    
    it('should handle null values', () => {
      expect(formatCurrency(null)).toBe('R$ 0,00');
    });
    
    it('should handle undefined values', () => {
      expect(formatCurrency(undefined)).toBe('R$ 0,00');
    });
  });
  
  describe('formatDate', () => {
    it('should format a date string to Brazilian format', () => {
      expect(formatDate('2025-07-17T00:00:00Z')).toBe('17/07/2025');
    });
    
    it('should handle Date objects', () => {
      const date = new Date('2025-07-17T00:00:00Z');
      expect(formatDate(date)).toBe('17/07/2025');
    });
    
    it('should handle null values', () => {
      expect(formatDate(null)).toBe('-');
    });
    
    it('should handle undefined values', () => {
      expect(formatDate(undefined)).toBe('-');
    });
  });
  
  describe('formatDocument', () => {
    it('should format a CPF', () => {
      expect(formatDocument('12345678901')).toBe('123.456.789-01');
    });
    
    it('should format a CNPJ', () => {
      expect(formatDocument('12345678901234')).toBe('12.345.678/9012-34');
    });
    
    it('should handle null values', () => {
      expect(formatDocument(null)).toBe('-');
    });
    
    it('should handle undefined values', () => {
      expect(formatDocument(undefined)).toBe('-');
    });
    
    it('should return the original value if not a valid CPF or CNPJ', () => {
      expect(formatDocument('123')).toBe('123');
    });
  });
  
  describe('formatPhone', () => {
    it('should format a mobile phone number', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    });
    
    it('should format a landline phone number', () => {
      expect(formatPhone('1123456789')).toBe('(11) 2345-6789');
    });
    
    it('should handle null values', () => {
      expect(formatPhone(null)).toBe('-');
    });
    
    it('should handle undefined values', () => {
      expect(formatPhone(undefined)).toBe('-');
    });
    
    it('should return the original value if not a valid phone number', () => {
      expect(formatPhone('123')).toBe('123');
    });
  });
});