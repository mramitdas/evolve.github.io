export async function loadConfig() {
    const res = await fetch("config.json");
    return await res.json();
}
