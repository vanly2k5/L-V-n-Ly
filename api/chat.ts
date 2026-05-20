import { generateWithRetry } from "../src/lib/gemini.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Chat API Error: GEMINI_API_KEY is missing");
      return res.status(500).json({ 
        error: "Chưa cấu hình Gemini API Key. Bạn hãy kiểm tra lại trong phần Settings > Secrets nhé!" 
      });
    }

    const { message, history } = req.body;
    console.log("Chat request received:", message);

    const contents = history ? [...history] : [];
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await generateWithRetry({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: "Bạn là CampusHub Assistant - trợ lý sinh viên ảo thông minh. Hãy trả lời bằng tiếng Việt, súc tích, thân thiện và luôn sẵn lòng hỗ trợ về học tập, ngoại khóa, học bổng. Sử dụng emoji phù hợp.",
      }
    });

    if (!response || !response.text) {
      throw new Error("Không thể nhận phản hồi văn bản từ Gemini AI.");
    }

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat API Detailed Error:", error);
    res.status(500).json({ 
      error: "Hệ thống đang bận một chút, bạn thử lại sau giây lát nhé! 🛠️",
      details: error.message
    });
  }
}
