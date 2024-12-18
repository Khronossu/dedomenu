import openai from "./chatgpt";

const query = async (prompt: string, id: string, model: string) => {
  try {
    const res = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are ChatGPT, a helpful assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      top_p: 1,
      max_tokens: 1000,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Return the entire response object
    return res;
  } catch (err) {
    console.error("Error querying OpenAI API:", err);
    throw new Error((err as Error).message || "Failed to query OpenAI API.");
  }
};

export default query;