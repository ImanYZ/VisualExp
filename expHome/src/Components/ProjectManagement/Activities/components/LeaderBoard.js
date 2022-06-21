import React from "react";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import { formatPoints } from "../../../../utils/utils";

export const LeaderBoard = ({
	fullname,
	expanded,
	researchers,
	isResearcherCriteriaMet,
	makeResearcherChipContent,
}) => (
	<div id="Leaderboard">
		<h2 id="InternsLeaderboardHeader">Interns Leaderboard:</h2>
		<Paper
			sx={{
				display: "flex",
				justifyContent: "center",
				flexWrap: "wrap",
				listStyle: "none",
				p: 0.5,
				m: 0,
			}}
			component="ul"
		>
			{researchers.map((resear) => {
				return (
					<li key={resear.id} className="LeaderboardItem">
						<Chip
							icon={
								isResearcherCriteriaMet(resear) ? (
									<span className="ChipContent">😊</span>
								) : (
									<span className="ChipContent">😔</span>
								)
							}
							variant={resear.id === fullname ? "" : "outlined"}
							color={isResearcherCriteriaMet(resear) ? "success" : "error"}
							label={
								<span className="ChipContent">
									{resear.id === fullname && fullname + " - "}
									{expanded ? makeResearcherChipContent(resear) : formatPoints(resear.totalPoints)}
								</span>
							}
						/>
					</li>
				);
			})}
		</Paper>
	</div>
);