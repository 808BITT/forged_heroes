const API_URL = 'http://192.168.1.209:3001/api';

export const testTool = async (toolSpec: any, testInput: Record<string, any>) => {
    try {
        const response = await fetch(`${API_URL}/test-tool`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                toolSpec,
                testInput,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error testing tool:', error);
        throw error;
    }
};
