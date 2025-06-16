import { NextResponse } from "next/server";

export async function GET() {
	const apiKey = process.env.RIOT_API_KEY;

	return NextResponse.json({
		timestamp: new Date().toISOString(),
		nodeEnv: process.env.NODE_ENV,
		hasRiotApiKey: !!apiKey,
		riotApiKeyLength: apiKey?.length || 0,
		riotApiKeyPrefix: apiKey?.substring(0, 10) + "..." || "N/A",
		riotApiKeyStartsWithRGAPI: apiKey?.startsWith("RGAPI-") || false,
		riotApiKeyHasSpaces: apiKey?.includes(" ") || false,
		riotApiKeyHasNewlines: apiKey?.includes("\n") || apiKey?.includes("\r") || false,
		allEnvKeys: Object.keys(process.env).filter((key) => key.includes("RIOT") || key.includes("API")),
		cwd: process.cwd(),
	});
}
