import { generateWithRetry } from "../src/lib/gemini.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Recommendations API Error: GEMINI_API_KEY is missing");
      return res.status(500).json({ error: "Thiếu GEMINI_API_KEY. Vui lòng cấu hình trong Secrets hoặc Environment Variables." });
    }

    const { profile, interests } = req.body;
    console.log("Generating recommendations for:", profile?.name);

    const prompt = `Bạn là chuyên gia tư vấn giáo dục toàn cầu của CampusHub. 
    Dựa trên hồ sơ sinh viên sau:
    - Tên: ${profile?.name || "Sinh viên"}
    - Chuyên ngành: ${profile?.major || "Chưa rõ"}
    - Sở thích: ${interests && interests.length > 0 ? interests.join(", ") : "Chưa cập nhật"}

    Nhiệm vụ: Hãy đề xuất từ 3 đến 5 cơ hội (sự kiện, cuộc thi, hoặc học bổng) đa dạng và hấp dẫn nhất, phù hợp với chuyên ngành và sở thích của sinh viên.
    
    Yêu cầu nội dung:
    1. Đa dạng hóa nguồn lực: Chủ động đề xuất các cơ hội quốc tế từ các tổ chức uy tín (UNESCO, Google Student Club, ASEAN Foundation...) bên cạnh các cơ hội tại Việt Nam.
    2. Tính thuyết phục: Giải thích rõ TẠI SAO cơ hội này phù hợp.
    3. Tính thực tế: Ưu tiên các cơ hội có thật, đang diễn ra hoặc thường niên.

    QUY TẮC PHẢN HỒI:
    - CHỈ trả về mảng JSON duy nhất. Không có văn bản giải thích nào khác.
    - Định dạng JSON mảng các đối tượng: [{ "type": "event" | "scholarship", "title": string, "reason": string }]`;

    const response = await generateWithRetry({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    if (!response || !response.text) {
      console.warn("Recommendations API: empty response from Gemini");
      return res.json([]);
    }
    
    const text = response.text;
    
    try {
      let jsonStr = text.trim();
      const arrayStart = jsonStr.indexOf('[');
      const arrayEnd = jsonStr.lastIndexOf(']');
      
      if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
        jsonStr = jsonStr.substring(arrayStart, arrayEnd + 1);
      } else {
        jsonStr = jsonStr.replace(/```json|```/g, "").trim();
      }

      const parsed = JSON.parse(jsonStr);
      res.json(Array.isArray(parsed) ? parsed : []);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Original text:", text);
      res.json([]);
    }
  } catch (error: any) {
    console.error("Recommendations API Error:", error.message);
    res.status(500).json({ error: "Lỗi khi tạo đề xuất", details: error.message });
  }
}
