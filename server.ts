import express from "express";
import path from "path";
import dotenv from "dotenv";
import { generateWithRetry } from "./src/lib/gemini.js";

if (!process.env.VERCEL) {
  dotenv.config();
}

const app = express();
app.use(express.json());

// API Route for AI Recommendations
app.post("/api/recommendations", async (req, res) => {
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
});

// API Route for Smart Chat
app.post("/api/chat", async (req, res) => {
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
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  res.json({ 
    status: "ok", 
    environment: process.env.VERCEL ? "vercel" : "classic", 
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 5) + "..." : "none"
  });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Error Handler Catch-all:", err);
  res.status(500).json({ 
    error: "Lỗi hệ thống nghiêm trọng", 
    details: err.message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined 
  });
});

// Vite Middleware & Static Files
const setupServer = async () => {
  // Only setup listeners and Vite if we are NOT on Vercel
  if (process.env.VERCEL) return;

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
};

if (!process.env.VERCEL) {
  setupServer().catch(console.error);
}

export default app;
