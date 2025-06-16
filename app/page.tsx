"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Shuffle } from "lucide-react";
// import { getPlayerData } from "@/lib/riot-api"; // 서버 사이드 함수이므로 주석 처리

interface Player {
	id: string;
	nickname: string;
	tag: string;
	tier: string;
	rank: string;
	mainRole: string;
	mainChampion: string;
	winRate: number;
	isLoading: boolean;
	isSearched: boolean;
}

const tiers = [
	{ name: "Iron", color: "bg-slate-500" },
	{ name: "Bronze", color: "bg-amber-600" },
	{ name: "Silver", color: "bg-slate-400" },
	{ name: "Gold", color: "bg-yellow-500" },
	{ name: "Platinum", color: "bg-teal-500" },
	{ name: "Emerald", color: "bg-green-500" },
	{ name: "Diamond", color: "bg-blue-500" },
	{ name: "Master", color: "bg-purple-600" },
	{ name: "Grandmaster", color: "bg-red-600" },
];

const roles = ["Top", "Jungle", "Mid", "ADC", "Support"];

export default function LoLTeamBalancer() {
	const [players, setPlayers] = useState<Player[]>(
		Array.from({ length: 10 }, (_, i) => ({
			id: `player-${i + 1}`,
			nickname: "",
			tag: "",
			tier: "",
			rank: "",
			mainRole: "",
			mainChampion: "",
			winRate: 0,
			isLoading: false,
			isSearched: false,
		}))
	);
	const [teams, setTeams] = useState<{ team1: Player[]; team2: Player[] } | null>(null);

	const handlePlayerChange = (index: number, field: keyof Player, value: string) => {
		setPlayers((prev) => prev.map((player, i) => (i === index ? { ...player, [field]: value } : player)));
	};

	const fetchPlayerData = async (index: number) => {
		const player = players[index];
		if (!player.nickname || !player.tag) return;

		setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, isLoading: true } : p)));

		try {
			// API 라우트를 통해 플레이어 데이터 조회
			const url = `/api/player?gameName=${encodeURIComponent(player.nickname)}&tagLine=${encodeURIComponent(player.tag)}`;
			console.log("플레이어 API 요청 URL:", url);

			const response = await fetch(url);
			console.log("플레이어 API 응답 상태:", response.status);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("플레이어 API 에러 응답:", errorText);
				throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
			}

			const playerData = await response.json();
			console.log("플레이어 데이터 수신:", playerData);
			setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, ...playerData, isLoading: false } : p)));
		} catch (error) {
			console.error("플레이어 데이터 조회 실패:", error);
			// 에러 발생 시 사용자에게 알림
			alert(`${player.nickname}#${player.tag} 소환사 조회 실패: ${error instanceof Error ? error.message : String(error)}`);
			setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, isLoading: false } : p)));
		}
	};

	const balanceTeams = () => {
		const validPlayers = players.filter((p) => p.isSearched);
		if (validPlayers.length !== 10) return;

		const shuffled = [...validPlayers].sort(() => Math.random() - 0.5);
		setTeams({
			team1: shuffled.slice(0, 5),
			team2: shuffled.slice(5, 10),
		});
	};

	const getTierInfo = (tierName: string) => {
		return tiers.find((t) => t.name === tierName) || tiers[0];
	};

	const searchedCount = players.filter((p) => p.isSearched).length;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-6xl mx-auto px-6 py-8">
					<div className="text-center">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">LoL 팀 밸런서</h1>
						<p className="text-gray-600">10명의 소환사 정보를 입력하고 균형잡힌 팀을 만들어보세요</p>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-6 py-8">
				{!teams ? (
					<>
						{/* Player Input Section */}
						<div className="mb-8">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold text-gray-900">소환사 정보 입력</h2>
								<div className="text-sm text-gray-500">{searchedCount}/10명 완료</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
								{players.map((player, index) => (
									<Card key={player.id} className="bg-white border border-gray-200 hover:border-gray-300 transition-colors">
										<CardContent className="p-4">
											<div className="space-y-3">
												<div className="flex gap-2">
													<Input placeholder="닉네임" value={player.nickname} onChange={(e) => handlePlayerChange(index, "nickname", e.target.value)} className="text-sm" />
													<Input placeholder="태그" value={player.tag} onChange={(e) => handlePlayerChange(index, "tag", e.target.value)} className="w-20 text-sm" />
												</div>

												<Button
													onClick={() => fetchPlayerData(index)}
													disabled={!player.nickname || !player.tag || player.isLoading}
													variant={player.isSearched ? "secondary" : "default"}
													size="sm"
													className="w-full"
												>
													{player.isLoading ? (
														<div className="flex items-center gap-2">
															<div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
															조회중
														</div>
													) : player.isSearched ? (
														"조회완료"
													) : (
														<div className="flex items-center gap-2">
															<Search className="h-3 w-3" />
															조회
														</div>
													)}
												</Button>

												{player.isSearched && (
													<div className="space-y-2 pt-2 border-t border-gray-100">
														<div className="flex items-center gap-2">
															<div className={`w-3 h-3 rounded-full ${getTierInfo(player.tier).color}`} />
															<span className="text-xs font-medium text-gray-700">
																{player.tier} {player.rank}
															</span>
														</div>
														<div className="text-xs text-gray-600">{player.mainRole}</div>
														<div className="text-xs text-gray-900 font-medium">{player.mainChampion}</div>
														<Badge variant="secondary" className="text-xs">
															승률 {player.winRate}%
														</Badge>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>

						{/* Balance Button */}
						<div className="text-center">
							<Button onClick={balanceTeams} disabled={searchedCount !== 10} size="lg" className="px-8 py-3">
								<Shuffle className="h-5 w-5 mr-2" />팀 밸런싱 시작
							</Button>
							{searchedCount !== 10 && <p className="text-sm text-gray-500 mt-2">모든 소환사의 정보를 조회해주세요 ({searchedCount}/10)</p>}
						</div>
					</>
				) : (
					<>
						{/* Team Results */}
						<div className="mb-6 text-center">
							<h2 className="text-2xl font-bold text-gray-900 mb-2">팀 배정 결과</h2>
							<Button onClick={() => setTeams(null)} variant="outline" size="sm">
								다시 배정하기
							</Button>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{/* Blue Team */}
							<Card className="bg-white border-l-4 border-l-blue-500">
								<CardHeader className="pb-4">
									<CardTitle className="text-blue-600 flex items-center gap-2">
										<div className="w-4 h-4 bg-blue-500 rounded-full" />
										블루팀
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{teams.team1.map((player, index) => (
										<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
											<div className="flex items-center gap-3">
												<div className={`w-6 h-6 rounded-full ${getTierInfo(player.tier).color}`} />
												<div>
													<div className="font-medium text-gray-900">
														{player.nickname}#{player.tag}
													</div>
													<div className="text-sm text-gray-600">
														{player.tier} {player.rank}
													</div>
												</div>
											</div>
											<div className="text-right">
												<div className="text-sm font-medium text-gray-900">{player.mainRole}</div>
												<div className="text-sm text-gray-600">{player.mainChampion}</div>
											</div>
										</div>
									))}
								</CardContent>
							</Card>

							{/* Red Team */}
							<Card className="bg-white border-l-4 border-l-red-500">
								<CardHeader className="pb-4">
									<CardTitle className="text-red-600 flex items-center gap-2">
										<div className="w-4 h-4 bg-red-500 rounded-full" />
										레드팀
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{teams.team2.map((player, index) => (
										<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
											<div className="flex items-center gap-3">
												<div className={`w-6 h-6 rounded-full ${getTierInfo(player.tier).color}`} />
												<div>
													<div className="font-medium text-gray-900">
														{player.nickname}#{player.tag}
													</div>
													<div className="text-sm text-gray-600">
														{player.tier} {player.rank}
													</div>
												</div>
											</div>
											<div className="text-right">
												<div className="text-sm font-medium text-gray-900">{player.mainRole}</div>
												<div className="text-sm text-gray-600">{player.mainChampion}</div>
											</div>
										</div>
									))}
								</CardContent>
							</Card>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
