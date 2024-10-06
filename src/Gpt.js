document.getElementById('generateButton').addEventListener('click', async () => {
    const resultDiv = document.getElementById('result');

    // Get user's geographical location
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const userLocation = await getUserLocation(latitude, longitude);

        // Placeholder for the fictional constellation image
        const constellationImage = "your_image_identifier"; // Replace with your image reference

        // Use OpenAI API to generate name and story based on the constellation image and location
        const response = await generateNameAndStory(constellationImage, userLocation);

        // Display the result
        resultDiv.innerHTML = response;
    });
});

// Function to get user location information
async function getUserLocation(latitude, longitude) {
    // You can use a geolocation API or mock data based on the coordinates
    // For simplicity, we'll return mock data here
    return {
        city: "Toronto", // Mock data; implement an actual API if needed
        country: "Canada",
    };
}

// Function to call OpenAI API and generate name and story
async function generateNameAndStory(constellationImage, location) {
    const apiKey = 'YOUR_OPENAI_API_KEY'; // Replace with your actual OpenAI API key
    const endpoint = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `Given a fictional constellation represented by the identifier "${constellationImage}", generate a name and an engaging story, considering cultural views from ${location.city}, ${location.country}.`
                }
            ],
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        return `Error: ${error}`;
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
