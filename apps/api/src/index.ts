import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { etag } from "hono/etag";

// NOTE: 環境変数の紐付け
type Bindings = {
  APP_NAME: string;
  article: KVNamespace;
  MAP_API_KEY: string; // NOTE: npx wrangler secret put MAP_API_KEY で環墧変数を設定済み
};

export type Article = {
  datetime: number;
  text: string;
  lat?: string;
  lon?: string;
  location?: string;
  images?: string[];
};

export type Param = {
  text: string;
  lat?: string;
  lon?: string;
  location?: string;
  images?: string[];
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("*", cors(), etag());
app.use("*", prettyJSON());

app.use("*", (c, next) => {
  console.log("middleware");
  return next();
});

// NOTE: TOP
app.get("/", async (c) => {
  return c.html(`<h1>${c.env.APP_NAME}</h1>`);
});

// NOTE: 記事一覧
app.get("/articles", async (c) => {
  const keys = await c.env.article.list();

  console.log("keys", keys);
  return c.json({ message: "ok", data: keys.keys }, 200);
});

// NOTE: 記事投稿
app.post("/articles", async (c) => {
  try {
    const param = await c.req.json<Param>();

    if (!param.text) throw new Error("text is required");

    const datetime = Math.floor(Date.now() / 1000);

    const article: Article = {
      datetime: datetime,
      text: param.text,
      lat: param.lat,
      lon: param.lon,
      location: param.location,
      images: param.images,
    };

    await c.env.article.put(datetime.toString(), JSON.stringify(article));

    return c.json({ message: "ok", id: datetime }, 200);
  } catch (e: any) {
    console.log(e.message);
    return c.json({ error: "invalid request" }, 400);
  }
});

// NOTE: 記事取得
app.get("/articles/:id", async (c) => {
  const id = c.req.param("id");
  const article = await c.env.article.get(id);
  if (!article) return c.json({ error: "not found" }, 404);

  return c.json({ message: "ok", data: JSON.parse(article) as Article }, 200);
});

// NOTE: 記事削除
app.delete("/articles/:id", async (c) => {
  const id = c.req.param("id");
  const article = await c.env.article.get(id);
  if (!article) return c.json({ error: "not found" }, 404);

  await c.env.article.delete(id);
  return c.json({ message: "ok" }, 200);
});

// NOTE: 位置情報から周辺の施設を取得
app.get("/nearby/:lat/:lon", async (c) => {
  const lat = c.req.param("lat");
  const lon = c.req.param("lon");
  if (!(lat && lon)) return c.json({ error: "invalid request" }, 400);

  type places = {
    results: {
      name: string;
    }[];
  };

  const result = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&key=${c.env.MAP_API_KEY}&language=ja`
  );

  const result_json = (await result.json()) as places;
  const locations = result_json.results.map((n) => n.name);

  return c.json({ message: "ok", locations: locations }, 200);
});

// NOTE: サンプルページを返すエンドポイント
app.get("/sample", (c) => {
  return c.html("<h1>サンプルページ</h1>");
});

// NOTE: 役割一覧を返すエンドポイント
app.get("/roles", (c) => {
  return c.json({ roles: ["admin", "user"] });
});

export default app;
