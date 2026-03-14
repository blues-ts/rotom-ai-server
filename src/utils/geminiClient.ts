// geminiClient.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.warn('Warning: GOOGLE_GENAI_API_KEY is not set. Gemini Vision API will not work.');
}

export const genAI = process.env.GOOGLE_GENAI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY)
  : null;

/**
 * Scans a Pokemon card image using Gemini Vision API
 * @param imageBase64 - Base64 encoded image (with or without data URI prefix)
 * @returns Structured card data extracted from the image
 */
export async function scanCardWithGemini(imageBase64: string) {
  if (!genAI) {
    throw new Error('GOOGLE_GENAI_API_KEY is not configured');
  }

  // Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  // Use Gemini 2.0 Flash for cost efficiency and vision capabilities
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash'
  });

  const prompt = `Analyze this Pokemon Trading Card Game card image and extract the following information in JSON format:

{
  "name": "Card name exactly as shown (e.g., 'Pikachu', 'Charizard VMAX', 'Mew ex')",
  "setName": "Set name if visible (e.g., 'Paldean Fates', 'Base Set', 'Obsidian Flames')",
  "cardNumber": "Card number in set (e.g., '25/102', '001/185', '232/091')",
  "confidence": "Your confidence level (0-1) in the overall identification",
  "alternates": [
    {
      "cardNumber": "Alternative card number if digits are unclear",
      "confidence": "Confidence for this alternative (0-1)"
    }
  ]
}

Important:
- Return ONLY valid JSON, no markdown formatting or code blocks
- If you cannot determine a field, use null
- Be VERY careful with digits that look similar: 3/5/8 can be confused, 0/6/8 can be confused, 1/7 can be confused
- If a digit is unclear or blurry, provide the most likely reading as cardNumber and alternatives in the alternates array
- The cardNumber should include the full format with slash (e.g., "25/102" not just "25")
- Look for the set symbol or set name on the card to identify the setName
- For the setName, use the common English name (e.g., "Paldean Fates" not "SV4.5")`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg', // Default to JPEG, could be enhanced to detect actual type
        },
      },
      { text: prompt },
    ]);

    const response = result.response;
    const text = response.text();

    // Log token usage for cost tracking
    // Try multiple paths as SDK structure may vary
    const usageMetadata =
      result.response?.usageMetadata ||
      (result as any).usageMetadata ||
      (response as any).usageMetadata;

    if (usageMetadata) {
      const promptTokens = usageMetadata.promptTokenCount || usageMetadata.prompt_tokens || 0;
      const candidatesTokens = usageMetadata.candidatesTokenCount || usageMetadata.completion_tokens || 0;
      const totalTokens = usageMetadata.totalTokenCount || usageMetadata.total_tokens || (promptTokens + candidatesTokens);
      const cachedTokens = usageMetadata.cachedContentTokenCount || usageMetadata.cached_content_tokens || 0;

      console.log('Gemini API Token Usage:', {
        promptTokens,
        candidatesTokens,
        totalTokens,
        cachedContentTokens: cachedTokens,
      });

      // Calculate estimated cost (Gemini 2.0 Flash: $0.15 per 1M input tokens, $0.60 per 1M output tokens)
      const inputCost = (promptTokens / 1_000_000) * 0.15;
      const outputCost = (candidatesTokens / 1_000_000) * 0.60;
      const totalCost = inputCost + outputCost;

      console.log('Estimated Cost:', {
        inputCost: `$${inputCost.toFixed(6)}`,
        outputCost: `$${outputCost.toFixed(6)}`,
        totalCost: `$${totalCost.toFixed(6)}`,
      });
    } else {
      console.warn('Token usage metadata not available in response');
    }

    // Try to extract JSON from the response (handle markdown code blocks if present)
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/i, '');

    // Parse JSON
    const cardData = JSON.parse(jsonText);

    // Validate required fields
    if (!cardData.name || cardData.name === null) {
      throw new Error('Card name is required but was not found in the image');
    }
    if (!cardData.cardNumber || cardData.cardNumber === null) {
      throw new Error('Card number is required but was not found in the image');
    }

    // Ensure alternates is always an array
    if (!cardData.alternates || !Array.isArray(cardData.alternates)) {
      cardData.alternates = [];
    }

    // Ensure setName is a string or null
    if (cardData.setName === undefined) {
      cardData.setName = null;
    }

    console.log('Gemini scan result:', cardData);
    return cardData;
  } catch (error) {
    console.error('Gemini Vision API error:', error);
    throw new Error(`Failed to analyze card with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
