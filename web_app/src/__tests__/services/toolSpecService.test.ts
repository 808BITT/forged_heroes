// Tell Jest to use our manual mock for toolSpecService
jest.mock('../../services/toolSpecService');

import { parseFunctionSignature } from '../../services/toolSpecService';

describe('parseFunctionSignature', () => {
    it('should parse a valid function signature correctly', () => {
        const signature = 'function myFunction(param1: string, param2: number)';
        const result = parseFunctionSignature(signature);

        expect(result).toEqual({
            name: 'myFunction',
            params: [
                { name: 'param1', type: 'string' },
                { name: 'param2', type: 'number' }
            ]
        });
    });

    it('should parse a valid arrow function signature correctly', () => {
        const signature = 'const myFunction = (param1: string, param2: boolean) => {}';
        const result = parseFunctionSignature(signature);

        expect(result).toEqual({
            name: 'myFunction',
            params: [
                { name: 'param1', type: 'string' },
                { name: 'param2', type: 'boolean' }
            ]
        });
    });

    it('should return null for an invalid function signature', () => {
        const signature = 'invalid signature';
        const result = parseFunctionSignature(signature);

        expect(result).toBeNull();
    });

    it('should handle functions with no parameters', () => {
        const signature = 'function noParams()';
        const result = parseFunctionSignature(signature);

        expect(result).toEqual({
            name: 'noParams',
            params: []
        });
    });

    it('should handle arrow functions with no parameters', () => {
        const signature = 'const noParams = () => {}';
        const result = parseFunctionSignature(signature);

        expect(result).toEqual({
            name: 'noParams',
            params: []
        });
    });

    it('should handle functions with complex parameter types', () => {
        const signature = 'function complexParams(param1: any, param2: object, param3: any[])';
        const result = parseFunctionSignature(signature);

        expect(result).toEqual({
            name: 'complexParams',
            params: [
                { name: 'param1', type: 'object' },
                { name: 'param2', type: 'object' },
                { name: 'param3', type: 'array' }
            ]
        });
    });

    it('should log a warning for unparseable signatures', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const signature = 'unparseable signature';
        parseFunctionSignature(signature);

        expect(consoleWarnSpy).toHaveBeenCalledWith('Could not parse function signature:', signature);
        consoleWarnSpy.mockRestore();
    });
});
