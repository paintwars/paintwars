import type React from "react";
import { useRef, useState } from "react";

interface Message {
	id: number;
	user: string;
	avatar?: string;
	text?: string;
	image?: string;
	reactions?: string[];
	pinned?: boolean;
}

const initialMessages: Message[] = [
	{
		id: 1,
		user: "askmarion.eth",
		avatar: undefined,
		text: "What's the #1 chain 🧿🧿",
		pinned: true,
	},
	{
		id: 2,
		user: "designsb.eth",
		avatar: undefined,
		text: "thanks bOMBADILUS",
	},
	{
		id: 3,
		user: "bombadilus.eth",
		avatar: undefined,
		text: "Samurai and their body position can be safely changed as you see fit",
	},
	{
		id: 4,
		user: "designsb.eth",
		avatar: undefined,
		text: "Bombadilus",
	},
	{
		id: 5,
		user: "designsb.eth",
		avatar: undefined,
		text: "my capitals 🤣",
	},
];

const ChatDisplay: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [input, setInput] = useState("");
	const [image, setImage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleSend = () => {
		if (!input && !image) return;
		setMessages((msgs) => [
			...msgs,
			{
				id: msgs.length + 1,
				user: "me.eth",
				text: input || undefined,
				image: image || undefined,
				avatar:
					"https://images.zapper.xyz/z/?path=zapper-fi-assets/nfts/medias/ca59f356027d5e17e82a750f8dc01264ac7019ac458cb44c187846f59fdd7a66.png&width=250&checksum=tKLDTulAvcuK538Rtoi_eM_moosAqIkSmQstZK8Y6oU",
			},
		]);
		setInput("");
		setImage(null);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (ev) => {
				setImage(ev.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const pinnedMessages = messages.filter((m) => m.pinned);
	const chatMessages = messages.filter((m) => !m.pinned);

	return (
		<div
			style={{
				position: "relative",
				width: "100%",
				height: "100%",
				background: "#181A20",
				color: "#fff",
				display: "flex",
				flexDirection: "column",
				borderRadius: 16,
				overflow: "hidden",
				fontFamily: "Menlo, monospace",
			}}
		>
			{/* Pinned Messages */}
			{pinnedMessages.length > 0 && (
				<div
					style={{
						borderBottom: "1px solid #222",
						padding: 12,
						background: "#23242a",
					}}
				>
					<div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
						📌 Pinned Messages
					</div>
					{pinnedMessages.map((msg) => (
						<div
							key={msg.id}
							style={{
								background: "#2a2c33",
								borderRadius: 12,
								padding: 8,
								marginBottom: 4,
								color: "#ffe082",
								fontWeight: 600,
								fontFamily: "Menlo, monospace",
							}}
						>
							{msg.text}
						</div>
					))}
				</div>
			)}
			{/* Chat Messages */}
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: 16,
					display: "flex",
					flexDirection: "column",
					gap: 12,
				}}
			>
				{chatMessages.map((msg) => (
					<div
						key={msg.id}
						style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
					>
						{/* Avatar */}
						<div
							style={{
								width: 32,
								height: 32,
								borderRadius: "50%",
								backgroundColor: "#111",
								backgroundImage: `url(${msg.avatar})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
								backgroundRepeat: "no-repeat",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontWeight: 700,
								fontSize: 16,
								color: "#fff",
								flexShrink: 0,
							}}
						>
							{msg.avatar ? "" : msg.user[0].toUpperCase()}
						</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontWeight: 700, fontSize: 14, color: "#bdbdbd" }}>
								{msg.user}
							</div>
							{msg.text && (
								<div
									style={{
										background: "#23242a",
										borderRadius: 12,
										padding: "8px 12px",
										marginTop: 2,
										fontSize: 15,
										color: "#fff",
										fontFamily: "Menlo, monospace",
									}}
								>
									{msg.text}
								</div>
							)}
							{msg.image && (
								<div style={{ marginTop: 8 }}>
									<img
										src={msg.image}
										alt="chat-img"
										style={{
											maxWidth: 220,
											borderRadius: 10,
											border: "1px solid #333",
											boxShadow: "0 2px 8px #0004",
										}}
									/>
								</div>
							)}
							{/* Reactions (stub UI) */}
							{msg.reactions && msg.reactions.length > 0 && (
								<div style={{ marginTop: 6, display: "flex", gap: 4 }}>
									{msg.reactions.map((r, i) => (
										<span key={`${msg.id}-${r}-${i}`} style={{ fontSize: 18 }}>
											{r}
										</span>
									))}
								</div>
							)}
						</div>
					</div>
				))}
			</div>
			{/* Input Area */}
			<div
				style={{
					borderTop: "1px solid #222",
					background: "#23242a",
					padding: 12,
					display: "flex",
					alignItems: "center",
					gap: 8,
				}}
			>
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					style={{
						background: "#23242a",
						border: "none",
						color: "#ffe082",
						fontSize: 20,
						cursor: "pointer",
						borderRadius: 8,
						padding: 4,
					}}
					title="Send image"
				>
					📎
				</button>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					style={{ display: "none" }}
					onChange={handleImageChange}
				/>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Reply..."
					style={{
						flex: 1,
						background: "#181A20",
						color: "#fff",
						border: "none",
						borderRadius: 8,
						padding: "8px 12px",
						fontSize: 15,
						outline: "none",
						fontFamily: "Menlo, monospace",
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleSend();
					}}
				/>
				{image && (
					<img
						src={image}
						alt="preview"
						style={{
							width: 32,
							height: 32,
							borderRadius: 6,
							objectFit: "cover",
							border: "1px solid #333",
						}}
					/>
				)}
				<button
					type="button"
					onClick={handleSend}
					style={{
						background: "#ffe082",
						color: "#23242a",
						border: "none",
						borderRadius: 8,
						padding: "8px 16px",
						fontWeight: 700,
						fontSize: 15,
						cursor: "pointer",
						marginLeft: 4,
					}}
				>
					Send
				</button>
			</div>
		</div>
	);
};

export default ChatDisplay;
