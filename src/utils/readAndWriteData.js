const fs = require('fs').promises;

const readData = async () => {
    const data = await fs.readFile('./talker.json', 'utf-8');
    const talkers = JSON.parse(data);
    return talkers;
};

module.exports = {
    readData,
};