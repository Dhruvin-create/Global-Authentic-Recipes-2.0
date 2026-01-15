/**
 * Generate recipe image using Hugging Face Inference API.
 * Expects: POST with { title, ingredients, platingStyle, difficulty }
 * Returns: { imageUrl: "data:image/jpeg;base64,..." }
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { title, ingredients, platingStyle, difficulty } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Recipe title is required' });
  }

  try {
    // Build a detailed prompt for the image generation
    const ingredientsList = (ingredients || '').split('\n').filter(Boolean).slice(0, 5).join(', ');
    const prompt = `Professional food photography of ${title}. ${platingStyle ? `Plating style: ${platingStyle}. ` : ''}Ingredients include: ${ingredientsList}. Authentic, appetizing, restaurant-quality plating, high resolution, studio lighting.`;

    const hfToken = process.env.HUGGING_FACE_API_KEY;
    if (!hfToken) {
      console.warn('HUGGING_FACE_API_KEY not set; returning placeholder image');
      return res.status(200).json({ 
        imageUrl: `https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=60&txt=${encodeURIComponent(title)}`,
        message: 'Using placeholder. Set HUGGING_FACE_API_KEY to generate real images.'
      });
    }

    // Call Hugging Face Inference API (Stable Diffusion)
    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1', {
      headers: { Authorization: `Bearer ${hfToken}` },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt, negative_prompt: 'blurry, low quality, watermark' }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('HF API error:', errorData);
      throw new Error(`Hugging Face API failed: ${response.status}`);
    }

    // Response is a JPEG blob; convert to base64 data URL
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Image generation error:', error);
    // Fallback to Unsplash placeholder on error
    res.status(200).json({ 
      imageUrl: `https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=60`,
      error: error.message,
      message: 'Failed to generate image; using fallback placeholder.'
    });
  }
}
