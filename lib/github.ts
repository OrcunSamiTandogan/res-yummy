// GitHub Contents API yardımcıları.
// Admin paneli (Vercel) menü verisini ve görselleri bu katman üzerinden repoya yazar:
// commit -> Vercel otomatik rebuild -> site güncel. Data diski salt-okunur olduğu için
// "yazma" işi Git'e yapılır (git = veritabanı, her değişiklik geri alınabilir).

const API = "https://api.github.com";

export type RepoConfig = { token: string; repo: string; branch: string };

export type RemoteFile = { path: string; sha: string; content: string };

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} ortam değişkeni tanımlı değil`);
  return value;
}

export function repoConfig(): RepoConfig {
  return {
    token: requiredEnv("GITHUB_TOKEN"),
    repo: process.env.GITHUB_REPO ?? "OrcunSamiTandogan/res-yummy",
    branch: process.env.GITHUB_BRANCH ?? "master",
  };
}

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "res-yummy-admin",
  };
}

/** Repodan tek dosyayı okur (yoksa null). İçerik UTF-8 metin olarak döner. */
export async function readTextFile(path: string): Promise<RemoteFile | null> {
  const { token, repo, branch } = repoConfig();
  const res = await fetch(`${API}/repos/${repo}/contents/${path}?ref=${branch}`, {
    headers: headers(token),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub okuma hatası (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { sha: string; content: string };
  return {
    path,
    sha: data.sha,
    content: Buffer.from(data.content, "base64").toString("utf8"),
  };
}

/** Dosyanın sha değerini döner; yoksa null (yeni dosya). */
export async function fileSha(path: string): Promise<string | null> {
  const file = await readTextFile(path);
  return file ? file.sha : null;
}

/** Dosyayı base64 içerikle yazar/günceller ve commit sha'sını döner. */
export async function writeFile(opts: {
  path: string;
  contentBase64: string;
  message: string;
  sha?: string | null;
}): Promise<string> {
  const { token, repo, branch } = repoConfig();
  const body: Record<string, unknown> = {
    message: opts.message,
    content: opts.contentBase64,
    branch,
  };
  if (opts.sha) body.sha = opts.sha;

  const res = await fetch(`${API}/repos/${repo}/contents/${opts.path}`, {
    method: "PUT",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GitHub yazma hatası (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { commit?: { sha?: string } };
  return data.commit?.sha ?? "";
}

/** Metin dosyası yazar (UTF-8 -> base64). */
export async function writeTextFile(opts: {
  path: string;
  content: string;
  message: string;
  sha?: string | null;
}): Promise<string> {
  return writeFile({
    path: opts.path,
    contentBase64: Buffer.from(opts.content, "utf8").toString("base64"),
    message: opts.message,
    sha: opts.sha,
  });
}
