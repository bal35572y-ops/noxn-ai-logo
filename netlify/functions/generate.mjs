
export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const apiKey = Netlify.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    return new Response(JSON.stringify({
      error: "لم يتم إعداد مفتاح OpenAI API بعد. أضفه في Netlify ضمن Environment variables."
    }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.json();
    const prompt = String(body.prompt || "").slice(0, 4000);
    const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];
    const size = allowedSizes.includes(body.size) ? body.size : "1024x1024";
    const quality = ["low", "medium", "high"].includes(body.quality)
      ? body.quality
      : "medium";

    if (prompt.length < 5) {
      return new Response(JSON.stringify({ error: "الوصف قصير جداً." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-image-2.5-flare",
          prompt,
          size,
          quality,
          output_format: "png",
          n: 1
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: result.error?.message || "رفض مزود الذكاء الاصطناعي الطلب."
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const image = result.data?.[0]?.b64_json;

    if (!image) {
      throw new Error("لم تصل صورة من مزود الذكاء الاصطناعي.");
    }

    return new Response(JSON.stringify({ image }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message || "حدث خطأ غير متوقع."
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
