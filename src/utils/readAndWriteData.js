const { readFile } = require('fs').promises;

const readData = async () => {
    try {
        const data = await readFile('talker.json', 'utf-8');
        const talkers = JSON.parse(data);
        return talkers;
    } catch (error) {
        const err = new Error('Error');
        err.statusCode = 500;
        throw err;
    }
};

module.exports = {
    readData,
};