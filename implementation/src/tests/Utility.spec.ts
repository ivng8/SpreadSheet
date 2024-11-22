import { Utility } from 'model/Utility';

describe('Utility', () => {
  describe('Column Letter to Number Conversion', () => {
    it('should convert single letters to correct numbers', () => {
      expect(Utility.columnLetterToNumber('A')).toBe(1);
      expect(Utility.columnLetterToNumber('B')).toBe(2);
      expect(Utility.columnLetterToNumber('Y')).toBe(25);
      expect(Utility.columnLetterToNumber('Z')).toBe(26);
    });

    it('should convert two letters to correct numbers', () => {
      expect(Utility.columnLetterToNumber('AA')).toBe(27);
      expect(Utility.columnLetterToNumber('AB')).toBe(28);
      expect(Utility.columnLetterToNumber('AZ')).toBe(52);
      expect(Utility.columnLetterToNumber('BA')).toBe(53);
    });

    it('should convert three letters to correct numbers', () => {
      expect(Utility.columnLetterToNumber('AAA')).toBe(703);
      expect(Utility.columnLetterToNumber('AAB')).toBe(704);
    });
  });

  describe('Number to Column Letter Conversion', () => {
    it('should convert numbers to single letters', () => {
      expect(Utility.numberToColumnLetter(1)).toBe('A');
      expect(Utility.numberToColumnLetter(2)).toBe('B');
      expect(Utility.numberToColumnLetter(25)).toBe('Y');
      expect(Utility.numberToColumnLetter(26)).toBe('Z');
    });

    it('should convert numbers to two letters', () => {
      expect(Utility.numberToColumnLetter(27)).toBe('AA');
      expect(Utility.numberToColumnLetter(28)).toBe('AB');
      expect(Utility.numberToColumnLetter(52)).toBe('AZ');
      expect(Utility.numberToColumnLetter(53)).toBe('BA');
      expect(Utility.numberToColumnLetter(701)).toBe('ZY');
      expect(Utility.numberToColumnLetter(702)).toBe('ZZ');
    });

    it('should convert numbers to three letters', () => {
      expect(Utility.numberToColumnLetter(703)).toBe('AAA');
      expect(Utility.numberToColumnLetter(704)).toBe('AAB');
    });

    it('should handle edge cases', () => {
      expect(Utility.numberToColumnLetter(0)).toBe('');
      expect(Utility.numberToColumnLetter(-1)).toBe('');
    });
  });

  describe('Bidirectional Conversion', () => {
    it('should correctly convert back and forth', () => {
      const testCases = ['A', 'B', 'Z', 'AA', 'AZ', 'BA', 'ZZ', 'AAA', 'XFD'];

      testCases.forEach(letter => {
        const number = Utility.columnLetterToNumber(letter);
        const convertedBack = Utility.numberToColumnLetter(number);
        expect(convertedBack).toBe(letter.toUpperCase());
      });
    });

    it('should handle all columns up to ZZ correctly', () => {
      for (let i = 1; i <= 702; i++) {
        const letter = Utility.numberToColumnLetter(i);
        const convertedBack = Utility.columnLetterToNumber(letter);
        expect(convertedBack).toBe(i);
      }
    });
  });
});
