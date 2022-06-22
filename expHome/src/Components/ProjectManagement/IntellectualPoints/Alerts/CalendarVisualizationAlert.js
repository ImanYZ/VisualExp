import React from "react";
import Alert from "@mui/material/Alert";

export const CalendarVisualizationAlert = () => (
	<Alert className="VoteActivityAlert" severity="success">
		<h2>Calendar visualization:</h2>
		<ul>
			<li>
				<strong>Each small square</strong> indicates a day. The shades of
				the color indicate the number of points you earned on that day. You
				can hover your mouse over each of the green squares to see the exact
				date and the number of points you earned on that day.
			</li>
			<li>
				<strong>A point per day</strong>: you've earned one point for every
				25 upvotes you cast on your colleagues' activities in every single
				day. So, on each single day, you've earned one or zero points.
			</li>
		</ul>
	</Alert>
);
