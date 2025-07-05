import type React from "react";

const ACTION_ICONS: Record<string, string> = {
	stake: "💰",
	shuffle: "🔀",
	freeze: "❄️",
	teleport: "🌀",
	weaken: "🪶",
};

export interface ActionItem {
	id: number;
	type: "stake" | "shuffle" | "freeze" | "teleport" | "weaken";
	title: string;
	description: string;
}

interface ScenarioActionPanelProps {
	actions: ActionItem[];
	panelVisible: boolean;
}

const ScenarioActionPanel: React.FC<ScenarioActionPanelProps> = ({
	actions,
	panelVisible,
}) => {
	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				right: 0,
				height: "100%",
				width: 320,
				maxWidth: "90vw",
				background: "#232946",
				boxShadow: "-4px 0 16px #0006",
				transform: panelVisible ? "translateX(0)" : "translateX(100%)",
				transition: "transform 0.4s cubic-bezier(.77,0,.18,1)",
				zIndex: 10,
				display: "flex",
				flexDirection: "column",
				padding: 0,
			}}
		>
			<div
				style={{
					padding: 20,
					borderBottom: "1px solid #C5C6C7",
					fontWeight: 700,
					fontSize: 18,
					color: "#BFA046",
				}}
			>
				Scenario Actions
			</div>
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: 12,
					display: "flex",
					flexDirection: "column",
					gap: 16,
				}}
			>
				{actions.slice(0, 10).map((action) => (
					<div
						key={action.id}
						style={{
							background: "#F4F4F6",
							borderRadius: 12,
							boxShadow: "0 2px 8px #23294622",
							padding: 16,
							display: "flex",
							flexDirection: "column",
							gap: 4,
							position: "relative",
							minHeight: 64,
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
							}}
						>
							<div style={{ fontWeight: 700, color: "#232946", fontSize: 16 }}>
								{action.title}
							</div>
							<div style={{ fontSize: 24, marginLeft: 8 }}>
								{ACTION_ICONS[action.type]}
							</div>
						</div>
						<div style={{ color: "#232946", fontSize: 14, marginTop: 2 }}>
							{action.description}
						</div>
					</div>
				))}
				{actions.length === 0 && (
					<div
						style={{
							color: "#C5C6C7",
							textAlign: "center",
							marginTop: 32,
							fontStyle: "italic",
						}}
					>
						No actions yet.
					</div>
				)}
			</div>
		</div>
	);
};

export default ScenarioActionPanel;
