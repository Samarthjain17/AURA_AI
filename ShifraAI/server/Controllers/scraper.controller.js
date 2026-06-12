import axios from 'axios';
import * as cheerio from 'cheerio';
import User from '../models/user.model.js';

export const scrapeWebsiteAndTrain = async (req, res) => {
    try {
        const { userId, websiteUrl } = req.body;

        if (!userId || !websiteUrl) {
            return res.status(400).json({ error: "Missing User ID or Website URL" });
        }

        console.log(`🔍 Scraping started for: ${websiteUrl}`);

        // 1. Fetch the raw HTML of the website
        const response = await axios.get(websiteUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            } // User-Agent dena zaroori hai taaki website humein bot samajh kar block na kare
        });

        // 2. Load HTML into Cheerio (jQuery for Node.js)
        const $ = cheerio.load(response.data);

        // 3. Remove useless tags (CSS, Scripts, Images) to get clean text
        $('script, style, noscript, iframe, img, svg, video, footer, nav').remove();

        // 4. Extract raw text and clean up extra spaces
        let scrapedText = $('body').text().replace(/\s+/g, ' ').trim();

        // 5. Limit the text to ~5000 characters so we don't blow up Gemini's token limit
        if (scrapedText.length > 5000) {
            scrapedText = scrapedText.substring(0, 5000) + "...";
        }

        // 6. Save this scraped knowledge to the User's Database
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.websiteUrl = websiteUrl;
        user.scrapedContent = scrapedText;
        await user.save();

        console.log("✅ Website Scraped & AI Trained!");

        return res.status(200).json({ 
            message: "Website analyzed successfully!", 
            scrapedData: scrapedText 
        });

    } catch (error) {
        console.error("❌ Scraping Error:", error.message);
        return res.status(500).json({ error: "Failed to scrape the website. Make sure the URL is public and correct." });
    }
};