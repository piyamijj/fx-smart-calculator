import { NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, imageBase64 } = body;

    if (!question && !imageBase64) {
      return NextResponse.json(
        { error: "Soru metni veya görsel gereklidir." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables.");
      return NextResponse.json(
        { error: "Sunucu yapılandırma hatası: Yapay zeka çözücü şu anda aktif değil." },
        { status: 500 }
      );
    }

    const systemPrompt = `Sen gelişmiş bir matematik öğretmenisin. Sana verilen matematik problemini (metin ve/veya görsel olarak) adım adım, anlaşılır ve detaylı bir şekilde çözmelisin.
Lütfen şu kurallara kesinlikle uy:
1. Çözümü tamamen Türkçe olarak yaz.
2. Sadece nihai cevabı verme; çözüme giden her adımı numaralandırarak (Adım 1, Adım 2 vb.) ve mantığını açıklayarak göster.
3. Çözümün en sonunda nihai cevabı net bir şekilde belirt.
4. Karmaşık LaTeX formülleri kullanma. Bunun yerine düz metin veya basit matematiksel semboller kullan (örn. x^2, sqrt(x), pi, * vb.).
5. Önemli terimleri veya adımları vurgulamak için hafif markdown kalın yazı stilini (**kalın**) kullanabilirsin.`;

    const parts: any[] = [];

    if (imageBase64) {
      const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);

      if (!matches || matches.length < 3) {
        return NextResponse.json(
          { error: "Geçersiz görsel formatı." },
          { status: 400 }
        );
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      parts.push({
        text: `$${systemPrompt}\n\nKullanıcı Sorusu: $${question || "Lütfen ekteki görseldeki matematik problemini çözün."}`,
      });

      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    } else {
      parts.push({
        text: `$${systemPrompt}\n\nKullanıcı Sorusu: $${question}`,
      });
    }

    const requestBody = {
      contents: [{ parts }],
    };

    const geminiResponse = await fetch(`$${GEMINI_ENDPOINT}?key=$${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const apiError = geminiData?.error;
      console.error("Gemini REST API Error:", {
        httpStatus: geminiResponse.status,
        code: apiError?.code,
        status: apiError?.status,
        message: apiError?.message,
      });

      let clientMessage =
        "Yapay zeka çözümü alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";

      const apiStatus: string = (apiError?.status || "").toString();
      const apiMsg: string = (apiError?.message || "").toString();

      if (/PERMISSION_DENIED|UNAUTHENTICATED/i.test(apiStatus) || /api key/i.test(apiMsg)) {
        clientMessage =
          "API anahtarı geçersiz veya yetkisiz görünüyor. Lütfen GEMINI_API_KEY değerini kontrol edin.";
      } else if (/RESOURCE_EXHAUSTED/i.test(apiStatus) || geminiResponse.status === 429) {
        clientMessage =
          "Yapay zeka kullanım kotanız dolmuş görünüyor. Lütfen daha sonra tekrar deneyin.";
      } else if (/NOT_FOUND/i.test(apiStatus) || geminiResponse.status === 404) {
        clientMessage =
          "Seçilen yapay zeka modeline şu anda ulaşılamıyor. Lütfen daha sonra tekrar deneyin.";
      }

      return NextResponse.json({ error: clientMessage }, { status: 500 });
    }

    const responseText: string | undefined =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error("Gemini REST API returned no text. Full response:", geminiData);
      throw new Error("Empty response from Gemini API");
    }

    return NextResponse.json({ solution: responseText });
  } catch (error: any) {
    console.error("Solve Route Error:", {
      message: error?.message,
      raw: error,
    });

    return NextResponse.json(
      { error: "Yapay zeka çözümü alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin." },
      { status: 500 }
    );
  }
}
