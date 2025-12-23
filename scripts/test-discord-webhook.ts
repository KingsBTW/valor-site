
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function testWebhook() {
    console.log('Testing Discord Webhook...');

    if (!DISCORD_WEBHOOK_URL) {
        console.error('❌ Error: DISCORD_WEBHOOK_URL is not defined in .env.local');
        console.log('Please add your Discord Webhook URL to .env.local');
        process.exit(1);
    }

    console.log(`Using Webhook URL: ${DISCORD_WEBHOOK_URL.substring(0, 35)}...`);

    const embed = {
        title: "New Order Completed",
        color: 0x22c55e, // Green for completed orders
        fields: [
            { name: "Order ID", value: `\`ORD-TEST-123\``, inline: true },
            { name: "Product", value: "Warp Infinite", inline: true },
            { name: "Variant", value: "Monthly Subscription", inline: true },
            { name: "Customer", value: "||test_buyer@gmail.com||", inline: true },
            { name: "Amount", value: "**$19.99**", inline: true },
            { name: "Payment", value: "Card", inline: true },
            { name: "Remaining Stock", value: "99 keys", inline: false },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: "Warp Cheats Sales (Test)" },
        thumbnail: { url: "https://i.postimg.cc/g2WLmFgX/warp-logo-blue-removebg-preview.png" },
    };

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: "🔔 Webhook Test",
                embeds: [embed],
            }),
        });

        if (response.ok) {
            console.log('✅ Success! Webhook sent successfully.');
        } else {
            console.error(`❌ Failed: Server returned ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error('Response:', text);
        }
    } catch (error) {
        console.error('❌ Error sending webhook:', error);
    }
}

testWebhook();
