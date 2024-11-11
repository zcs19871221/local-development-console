export default function safeParse(json: string) {
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}
