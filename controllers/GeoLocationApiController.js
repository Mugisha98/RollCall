const axios = require('axios');
 
async function getCoordinates(address) {
    const params = {
        access_key: '0a25901136f83d0a411d4c204bca9567',
        query: address
    }
    const response = await axios.get('http://api.positionstack.com/v1/forward', {params})
    return response.data;
}
 
module.exports = {
    getCoordinates
};