const fetch = require('node-fetch');
const cheerio = require('cheerio');

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
        let content = await response.text();
        const contentType = response.headers.get('content-type');

        // Sirf HTML content ko rewrite karo
        if (contentType && contentType.includes('text/html')) {
            const $ = cheerio.load(content);
            const baseUrl = new URL(url).origin; // Original site ka base URL

            // Saare links rewrite karo (a tags)
            $('a[href]').each((i, link) => {
                let href = $(link).attr('href');
                if (href) {
                    const fullHref = new URL(href, baseUrl).href;
                    $(link).attr('href', `/.netlify/functions/fetch-website?url=${encodeURIComponent(fullHref)}`);
                }
            });

            // Images rewrite (img src)
            $('img[src]').each((i, img) => {
                let src = $(img).attr('src');
                if (src) {
                    const fullSrc = new URL(src, baseUrl).href;
                    $(img).attr('src', fullSrc); // Direct load, lekin agar proxy chahiye to yahan bhi function use karo
                }
            });

            // Scripts rewrite (script src)
            $('script[src]').each((i, script) => {
                let src = $(script).attr('src');
                if (src) {
                    const fullSrc = new URL(src, baseUrl).href;
                    $(script).attr('src', fullSrc);
                }
            });

            // CSS links rewrite (link href)
            $('link[href]').each((i, link) => {
                let href = $(link).attr('href');
                if (href && $(link).attr('rel') === 'stylesheet') {
                    const fullHref = new URL(href, baseUrl).href;
                    $(link).attr('href', fullHref);
                }
            });

            // Form actions bhi rewrite (optional, agar forms hain)
            $('form[action]').each((i, form) => {
                let action = $(form).attr('action');
                if (action) {
                    const fullAction = new URL(action, baseUrl).href;
                    $(form).attr('action', `/.netlify/functions/fetch-website?url=${encodeURIComponent(fullAction)}`);
                }
            });

            content = $.html(); // Rewritten HTML
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': contentType || 'text/html' },
            body: JSON.stringify({ content })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch website: ' + error.message })
        };
    }
};
