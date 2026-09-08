// Unit-test: the ingestion helpers handle real Apify Reddit dataset shapes.
// live-posts.js is dependency-free, so it can be imported directly (offline).
process.env.APIFY_TOKEN = ""; // keep the network path off; we only test pure helpers

const mod = await import("../src/lib/live-posts.js");
const { mapApifyItem, relevanceScore, dedupePosts, MIN_RELEVANCE_SCORE } = mod;

let pass = 0;
let total = 0;
function check(label, ok, got) {
  total += 1;
  console.log(`${ok ? "PASS" : "FAIL"} — ${label}${ok ? "" : ` -> ${JSON.stringify(got)}`}`);
  if (ok) pass += 1;
}

// --- mapper: field variants from different Apify Reddit actors ---------------
const trudax = mapApifyItem({
  id: "t3_1a",
  parsedId: "1a",
  url: "https://reddit.com/r/ThailandTourism/x",
  createdAt: "2026-08-01T00:00:00Z",
  title: "T1",
  body: "B1",
  communityName: "ThailandTourism",
  numberOfUpvotes: 12,
  dataType: "post",
});
check(
  "trudax-style post maps with id/url/date",
  Boolean(
    trudax &&
      trudax.title === "T1" &&
      trudax.text === "B1" &&
      trudax.sub === "ThailandTourism" &&
      trudax.score === 12 &&
      trudax.id === "1a" &&
      trudax.url.includes("/r/ThailandTourism") &&
      trudax.createdAt === "2026-08-01T00:00:00Z"
  ),
  trudax
);

check(
  "practicaltools/harshmaur style maps",
  (() => {
    const p = mapApifyItem({ dataType: "post", title: "T2", text: "B2", subreddit: "r/travel", score: 34 });
    return Boolean(p && p.title === "T2" && p.text === "B2" && p.sub === "travel" && p.score === 34);
  })()
);

check(
  "reddit-raw style maps",
  (() => {
    const p = mapApifyItem({ dataType: "post", title: "T3", selftext: "B3", sub: "solotravel", upvotes: 7 });
    return Boolean(p && p.title === "T3" && p.text === "B3" && p.sub === "solotravel" && p.score === 7);
  })()
);

check(
  "nested community style maps",
  (() => {
    const p = mapApifyItem({
      dataType: "post",
      title: "T4",
      content: "B4",
      community: { name: "indonesia" },
      numberOfLikes: 3,
    });
    return Boolean(p && p.title === "T4" && p.sub === "indonesia" && p.score === 3);
  })()
);

check("comment items are dropped", mapApifyItem({ dataType: "comment", title: "c", body: "x" }) === null);
check("posts without titles are dropped", mapApifyItem({ dataType: "post", body: "no title" }) === null);

check(
  "boilerplate body falls back to html text",
  (() => {
    const p = mapApifyItem({
      dataType: "post",
      title: "Seoul adds English to taxi receipts to curb overcharging of foreigners",
      body: "&#32; submitted by &#32;  /u/chickenandliver   [link] &#32; [comments]",
      html: "<table><tr><td><p>Seoul taxi overcharging fix</p></td></tr></table>",
      communityName: "r/korea",
    });
    return Boolean(p && p.text.includes("Seoul taxi overcharging fix"));
  })()
);

// --- relevance: real shapes observed in a Seoul dataset run -------------------
const receipts = {
  title: "Seoul adds English to taxi receipts to curb overcharging of foreigners",
  text: "submitted by /u/chickenandliver [link] [comments]",
  sub: "korea",
  score: 0,
};
check(
  "taxi overcharging news post is relevant",
  relevanceScore(receipts, "Seoul") >= MIN_RELEVANCE_SCORE,
  relevanceScore(receipts, "Seoul")
);

const taxiGuide = {
  title: "[Local’s Guide] How to Use Taxis Like a Local in Korea (Seoul Focused)",
  text: "full taxi fare and meter guide for Seoul visitors",
  sub: "koreatravel",
  score: 0,
};
check(
  "taxi guide in a travel sub is relevant",
  relevanceScore(taxiGuide, "Seoul") >= MIN_RELEVANCE_SCORE,
  relevanceScore(taxiGuide, "Seoul")
);

const touristTrap = {
  title:
    "I finally visited Starfield Library in Coex Mall, Seoul. Is it actually worth the Instagram hype, or just a tourist trap?",
  text: "honest review for anyone planning a trip to Seoul",
  sub: "PlayLocalKorea",
  score: 0,
};
check(
  "tourist trap post is relevant",
  relevanceScore(touristTrap, "Seoul") >= MIN_RELEVANCE_SCORE,
  relevanceScore(touristTrap, "Seoul")
);

const junk = {
  title: "How i view South Korea as a South Korean",
  text: "submitted by /u/Terrorman123 [link] [comments]",
  sub: "mapporncirclejerk",
  score: 0,
};
check(
  "meme post with no city/risk signal is rejected",
  relevanceScore(junk, "Seoul") < MIN_RELEVANCE_SCORE,
  relevanceScore(junk, "Seoul")
);

// --- dedupe -------------------------------------------------------------------
const dupes = dedupePosts([
  { id: "1oc4ypq", title: "How to Use Taxis Like a Local in Korea (Seoul Focused)", url: "u1" },
  { id: "1ntun0z", title: "How to Use Taxis Like a Local in Korea (Seoul Focused)", url: "u2" },
  { id: "1qhscab", title: "Seoul adds English to taxi receipts to curb overcharging of foreigners", url: "u3" },
]);
check(
  "same guide posted to two subs collapses to one",
  dupes.length === 2,
  dupes.map((p) => p.title)
);

// --- module surface ------------------------------------------------------------
console.log("module exports:", Object.keys(mod).join(", "));
const r = await mod.fetchLivePosts("TestCity");
check(
  "no-token fetchLivePosts degrades gracefully",
  r.mode === "none" && r.posts.length === 0,
  { mode: r.mode, posts: r.posts.length }
);

console.log(pass === total ? `\nALL ${total} CASES PASS` : `\n${total - pass}/${total} CASE(S) FAILED`);
if (pass !== total) process.exit(1);