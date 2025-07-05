import type React from "react";
import { createContext, useContext, useState } from "react";
import type { ActionItem } from "./ScenarioActionPanel";

interface ScenarioActionsContextType {
	actions: ActionItem[];
	setActions: React.Dispatch<React.SetStateAction<ActionItem[]>>;
}

const ScenarioActionsContext = createContext<
	ScenarioActionsContextType | undefined
>(undefined);

export const ScenarioActionsProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const [actions, setActions] = useState<ActionItem[]>([]);
	console.log(actions);
	return (
		<ScenarioActionsContext.Provider value={{ actions, setActions }}>
			{children}
		</ScenarioActionsContext.Provider>
	);
};

export function useScenarioActions() {
	const ctx = useContext(ScenarioActionsContext);
	if (!ctx)
		throw new Error(
			"useScenarioActions must be used within a ScenarioActionsProvider",
		);
	return ctx;
}
