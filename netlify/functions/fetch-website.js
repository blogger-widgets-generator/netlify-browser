const fetch = require('node-fetch');

exports.handler = async function (event) {
    const url = event.queryStringParameters.url;
    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No URL provided' })
        };
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const content = await response.text();
        return {
            statusCode: 200,
            body: JSON.stringify({ content })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch website' })
        };
    }
};