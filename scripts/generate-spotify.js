const fs = require("fs");

const USER_ID = "1285711543622701077";
const API_URL = `https://api.lanyard.rest/v1/users/${USER_ID}`;

function escapeXml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

async function getAlbumArt(url) {
    if (!url) return null;

    try {
        const response = await fetch(url);

        if (!response.ok) return null;

        const buffer = Buffer.from(await response.arrayBuffer());

        return `data:image/jpeg;base64,${buffer.toString("base64")}`;
    } catch (error) {
        console.log("Album art error:", error.message);
        return null;
    }
}

async function main() {
    console.log("Getting Lanyard data...");

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`Lanyard API returned ${response.status}`);
    }

    const json = await response.json();

    if (!json.success) {
        throw new Error("Lanyard API returned success=false");
    }

    const data = json.data;
    const spotify = data?.spotify;

    let svg;

    if (!spotify || !data.listening_to_spotify) {
        svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="660"
     height="180"
     viewBox="0 0 660 180">

    <rect width="660"
          height="180"
          rx="14"
          fill="#14171c"/>

    <circle cx="45"
            cy="45"
            r="18"
            fill="#1DB954"/>

    <text x="75"
          y="51"
          fill="#ffffff"
          font-family="Arial, sans-serif"
          font-size="20"
          font-weight="bold">
        Spotify
    </text>

    <text x="330"
          y="105"
          text-anchor="middle"
          fill="#888888"
          font-family="Arial, sans-serif"
          font-size="16">
        Nothing playing right now
    </text>

</svg>
`;
    } else {
        const albumArt = await getAlbumArt(spotify.album_art_url);

        const song = escapeXml(spotify.song);
        const artist = escapeXml(spotify.artist);
        const album = escapeXml(spotify.album);

        svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="660"
     height="180"
     viewBox="0 0 660 180">

    <rect width="660"
          height="180"
          rx="14"
          fill="#14171c"/>

    ${
        albumArt
            ? `<image
                    href="${albumArt}"
                    x="20"
                    y="20"
                    width="140"
                    height="140"
                    preserveAspectRatio="xMidYMid slice"/>`
            : `<rect
                    x="20"
                    y="20"
                    width="140"
                    height="140"
                    rx="10"
                    fill="#1DB954"/>`
    }

    <circle cx="190"
            cy="42"
            r="10"
            fill="#1DB954"/>

    <text x="210"
          y="48"
          fill="#1DB954"
          font-family="Arial, sans-serif"
          font-size="15"
          font-weight="bold">
        Listening to Spotify
    </text>

    <text x="190"
          y="88"
          fill="#ffffff"
          font-family="Arial, sans-serif"
          font-size="22"
          font-weight="bold">
        ${song}
    </text>

    <text x="190"
          y="116"
          fill="#aaaaaa"
          font-family="Arial, sans-serif"
          font-size="16">
        ${artist}
    </text>

    <text x="190"
          y="143"
          fill="#777777"
          font-family="Arial, sans-serif"
          font-size="13">
        ${album}
    </text>

</svg>
`;
    }

    fs.mkdirSync("assets", { recursive: true });

    fs.writeFileSync(
        "assets/spotify.svg",
        svg.trim(),
        "utf8"
    );

    console.log("Spotify card generated successfully.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
