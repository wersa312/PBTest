const { VK } = require('vk-io'),
	{ Keyboard } = require('vk-io'),
	{ randElement, dateFormat, clubLink } = require("./api/utils"),
	config = require("./config"),
	fs = require("fs"),

	express = require("express"),
	bodyParser = require('body-parser'),
	cors = require('cors'),

	vkGroup = new VK({
		token: "1eece49765a8baf8fe8b3e185c0709d3f10b8e65c9028dff8315fb61dca824eacbcb76c1a4b93c3fa974e",
		lang: "ru",
		apiMode: "parallel",
		apiLimit: 20
	}),
	vkManager = new VK({
		token: "354774208f808a6fba282de46623ff9c5b8ff0266080d9cc199c871984124a5d1f67b281177f3d2ce1e8c",
		lang: "ru",
		apiMode: "parallel",
		apiLimit: 20
	}),
	vkApi = new VK({
		token: "354774208f808a6fba282de46623ff9c5b8ff0266080d9cc199c871984124a5d1f67b281177f3d2ce1e8c",
		apiMode: "parallel"
	});

let users = {},
	clans = {},
	chats = {},
	bans = require("./vars/bans.json"),
	enableManage = require("./vars/manage.json"),

	commands = [],
	managerCommands = [],
	payloadCommands = {},
	payloadCallbackCommands = {},
	sceneCommands = {},

	vkFromDb, clanFromDb, regAcc, chatFromDb, regChat,

	/*whitelist = { 231812819: 1 },*/

	app = express();

const dbb = require("./database.json");

app.use(cors());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

function loadCmd(file) {
	let cmd = require("./commands/" + file);
	if (!Array.isArray(cmd)) {
		cmd = [cmd];
	}
	cmd.forEach(c => {
		if (c.enabled == null || c.enabled) {
			c.status = (c.status != null ? c.status : 0);
			if (c.r) commands.push(c);
			if (c.mr) managerCommands.push(c);
			if (c.payload) payloadCommands[c.payload] = c;
			if (c.payload_callback) payloadCallbackCommands[c.payload_callback] = c;
			if (c.scene) sceneCommands[c.scene] = c;
		}
	});
}

function loadCommands() {
	fs.readdirSync("./commands").forEach(function (file) {
		if (file.endsWith(".js")) {
			try {
				loadCmd(file);
			} catch (err) {
				console.log("↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓");
				console.log("Ошибка подгрузки с " + file);
				console.log(err);
				console.log("↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑");
			}
		} else {
			fs.readdirSync("./commands/" + file).forEach(function (dirfile) {
				try {
					if (dirfile.endsWith(".js")) loadCmd(file + "/" + dirfile);
				} catch (err) {
					console.log("↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓");
					console.log("Ошибка подгрузки с /" + file + "/" + dirfile);
					console.log(err);
					console.log("↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑");
				}
			});
		}

	});
	return;
}

function invalidStatus(msg) {
	msg.send("🚫 Нет доступа", {
		template: JSON.stringify({
			"type": "carousel",
			"elements": [
				{
					title: 'Premium 400 ₽',
					description: 'Preimum статус - открывает весь функционал бота и дает некоторые преимущества.',
					photo_id: '-151782797_457948202',
					buttons: [
						{
							action: {
								type: 'text',
								label: 'Подробнее',
								payload: { "command": 'donate', "params": 'premium' }
							},
							color: 'primary'
						},
						{
							action: {
								type: 'open_link',
								label: '↗ На сайт',
								link: 'https://pocketbot.ru'
							}
						}
					],
					action: { "type": "open_link", "link": "https://pocketbot.ru" }
				},
				{
					title: 'V.I.P. 200 ₽',
					description: 'V.I.P. открывает дополнительный функционал бота и дает некоторые преимущества.',
					photo_id: '-151782797_457948203',
					buttons: [
						{
							action: {
								type: 'text',
								label: 'Подробнее',
								payload: { "command": 'donate', "params": 'vip' }
							},
							color: 'primary'
						},
						{
							action: {
								type: 'open_link',
								label: '↗ На сайт',
								link: 'https://pocketbot.ru'
							}
						}
					],
					action: { "type": "open_link", "link": "https://pocketbot.ru" }
				}
			]
		})
	});
}

let MongoClient = require('mongodb').MongoClient,
	ObjectID = require('mongodb').ObjectID,
	db;
MongoClient.connect("mongodb://localhost:27017", {
	useUnifiedTopology: true
}, function (err, database) {
	if (err) return console.log("Ошибка загрузки DB: " + err);
	db = database.db(config.db);
	db.stats((err, res) => {
		if (err) return console.log(err);
		console.log("Успешное подключение к DB (" + res.db + ")" +
			"\nРазделов: " + res.collections +
			"\nОбъектов: " + res.objects +
			"\nРазмер базы:" + (res.dataSize / 1024 / 1024).toFixed(2) + "МБ");
	});

	/*let arr = [];
	for (let i in dbb.clans) {
		dbb.clans[i].id = parseInt(i);
		arr.push(dbb.clans[i])
	}
	db.collection('clans').insertMany(arr)*/

	module.exports = {
		db,
		ObjectID,
		Keyboard,
		vkGroup,
		vkApi,
		vkManager,
		users,
		clans,
		chats,
		bans,
		app
	};

	app.get("/api/test", function (req, res) {
		res.send("okay");
	});

	app.listen(config.port);

	loadCommands();

	vkFromDb = require("./api/acc").vkFromDb;
	regAcc = require("./api/acc").regAcc;

	clanFromDb = require("./api/clan").clanFromDb;

	chatFromDb = require("./api/chat").chatFromDb;
	regChat = require("./api/chat").regChat;

	setInterval(() => {
		for (let i in users) {
			if (isNaN(users[i].money)) users[i].money = 0;
		}
	}, 3000);

	vkGroup.updates.on('message', async (msg, next) => {
		if (msg.isUser) {
			//if (!whitelist[msg.senderId]) return;
			if (msg.isChat) msg.send = send(msg.peerId);
			if (bans[msg.senderId]) {
				if (msg.isChat) return;
				let ban = bans[msg.senderId];
				return msg.send(`🚫 Вы заблокированы в данном проекте по причине ${ban.reason}`);
			}
			if (msg.eventType == "chat_invite_user" && msg.eventMemberId == -151782797) {
				return msg.send(`👋 Спасибо, что пригласили меня.\n📔 Мои команды можно узнать, написав: "${clubLink("/помощь")}" (без ковычек).\n\n🤖 Команды нужно начинать с упоминанием меня (@pocketbot) или с "/". Примеры:\n🔹 @pocketbot, помощь\n🔹 /профиль\n\n✉ Выдайте ${clubLink("доступ ко всей переписке")} или ${clubLink("права администратора беседы")}, если хотите пользоваться ботом без обращении: https://vk.cc/axqplQ`, { attachment: "photo-178960148_457239034" });
			}

			if (msg.isChat) {
				await chatFromDb(msg.chatId);
				if (!chats[msg.chatId]) await regChat(msg.chatId);
				chats[msg.chatId].lastActivity = +new Date();
				chats[msg.chatId].stat++;
				chats[msg.chatId].members[msg.senderId] = {
					time: +new Date()
				}
				if (!chats[msg.chatId].settings.on) {
					if (!msg.text || msg.text.toLowerCase() != "бот включить") return;
					vkGroup.api.messages.getConversationMembers({
						peer_id: msg.peerId
					}).then(chat => {
						for (let i in chat.items) {
							if (chat.items[i].member_id == msg.senderId) {
								if (chat.items[i].is_admin) {
									chats[msg.chatId].settings.on = true;
									msg.send("✅ Бот включен");
								}
							}
						}
					}).catch(() => {
						chats[msg.chatId].settings.on = true;
						msg.send("✅ Бот включен\n\n⚠️ У бота нет прав администратора, поэтому бота мог включить любой участник беседы");
					});
				}
				if (msg.eventType == "chat_kick_user" && chats[msg.chatId].settings.kick_leave && (msg.senderId == msg.eventMemberId)) vkGroup.api.messages.removeChatUser({ chat_id: msg.chatId, member_id: msg.eventMemberId });
			}

			if (msg.messagePayload) {
				let msgPayload = msg.messagePayload;
				if (msgPayload.command == "not_supported_button") msgPayload = JSON.parse(msg.messagePayload.payload);
				if (!payloadCommands[msgPayload.command]) return;
				if (msgPayload["toId"]) {
					if (msgPayload.toId != msg.senderId) return;
				}
				await vkFromDb(msg.senderId);
				if (!users[msg.senderId]) await regAcc(msg.senderId);
				if (users[msg.senderId].status.type < payloadCommands[msgPayload.command].status) {
					if (payloadCommands[msgPayload.command].status > 3) return;
					return invalidStatus(msg);
				}
				if (users[msg.senderId].clan) {
					await clanFromDb(users[msg.senderId].clan);
					clans[users[msg.senderId].clan].lastActivity = + new Date();
				}
				if (msgPayload["params"]) msg.params = msgPayload.params;
				msg.type = "payload";
				msg.prefix = `@id${msg.senderId} (${users[msg.senderId].nick})${users[msg.senderId].clan && !users[msg.senderId].pclan ? ` [${clans[users[msg.senderId].clan].name}]` : ''}, `;
				users[msg.senderId].lastActivity = + new Date();
				try {
					payloadCommands[msgPayload.command].f(msg, users[msg.senderId]);
				} catch (err) {
					console.log(err);
				}
			} else {
				if (msg.hasText) {
					msg.text = msg.text.replace(/^(\[club[0-9]+\|.*\] ?|@club[0-9]+ (.*))[, ]+/i, "");
					if (msg.text.startsWith("/")) msg.text = msg.text.substring(1);
				}
				let notFinded = true;
				for (let i = 0, len = commands.length; i < len; i++) {
					if (commands[i].r) {
						let cmd = commands[i];
						if (cmd.r.test(msg.text)) {
							notFinded = false;
							await vkFromDb(msg.senderId);
							if (!users[msg.senderId]) await regAcc(msg.senderId);
							if (users[msg.senderId].status.type < cmd.status) {
								if (cmd.status > 3) return;
								return invalidStatus(msg);
							}
							if (users[msg.senderId].clan) {
								await clanFromDb(users[msg.senderId].clan);
								clans[users[msg.senderId].clan].lastActivity = + new Date();
							}
							msg.prefix = `@id${msg.senderId} (${users[msg.senderId].nick})${users[msg.senderId].clan && !users[msg.senderId].pclan ? ` [${clans[users[msg.senderId].clan].name}]` : ''}, `;
							msg.match = msg.text.match(cmd.r);
							msg.type = "cmd";
							users[msg.senderId].lastActivity = + new Date();
							try {
								cmd.f(msg, users[msg.senderId])
							} catch (err) {
								console.log(err);
							}
						}
					}
				}
				if (notFinded && msg.isFromUser) {
					await vkFromDb(msg.senderId);
					if (!users[msg.senderId]) await regAcc(msg.senderId);
					if (users[msg.senderId].scene) {
						if (users[msg.senderId].status.type < sceneCommands[users[msg.senderId].scene].status && sceneCommands[users[msg.senderId].scene].status < 4) {
							if (sceneCommands[users[msg.senderId].scene] > 4) return;
							return invalidStatus(msg);
						}
						if (users[msg.senderId].clan) {
							await clanFromDb(users[msg.senderId].clan);
							clans[users[msg.senderId].clan].lastActivity = + new Date();
						}
						msg.prefix = `@id${msg.senderId} (${users[msg.senderId].nick})${users[msg.senderId].clan && !users[msg.senderId].pclan ? ` [${clans[users[msg.senderId].clan].name}]` : ''}, `;
						msg.type = "scene";
						users[msg.senderId].lastActivity = + new Date();
						try {
							sceneCommands[users[msg.senderId].scene].f(msg, users[msg.senderId]);
						} catch (err) {
							console.log(err);
						}
					} else {
						msg.send(`🚫 Увы, такой команды я не знаю ${randElement(["😵", "🤯", "😧", "😥", "😰", ""])} `);
					}
				}
			}
		}
		next();
	});

	vkGroup.updates.on('message_event', async (msg, next) => {
		msg.senderId = msg.userId;
		msg.chatId = msg.peerId - 2e9;
		if (!payloadCallbackCommands[msg.payload.payload.command]) return;
		if (msg.payload.payload["toId"]) {
			if (msg.payload.payload.toId != msg.senderId) return;
		}
		await vkFromDb(msg.senderId);
		if (!users[msg.senderId]) await regAcc(msg.senderId);
		if (msg.isChat) {
			await chatFromDb(msg.chatId);
			if (!chats[msg.chatId]) await regChat(msg.chatId);
			chats[msg.chatId].lastActivity = +new Date();
			chats[msg.chatId].stat++;
			chats[msg.chatId].members[msg.senderId] = {
				time: +new Date()
			}
		}
		if (users[msg.senderId].status.type < payloadCallbackCommands[msg.payload.payload.command].status) {
			return
		}
		if (users[msg.senderId].clan) {
			await clanFromDb(users[msg.senderId].clan);
			clans[users[msg.senderId].clan].lastActivity = + new Date();
		}
		if (msg.payload.payload["params"]) msg.params = msg.payload.payload.params;
		msg.type = "payload_callback";
		msg.prefix = `@id${msg.senderId} (${users[msg.senderId].nick})${users[msg.senderId].clan && !users[msg.senderId].pclan ? ` [${clans[users[msg.senderId].clan].name}]` : ''}, `;
		users[msg.senderId].lastActivity = + new Date();
		try {
			payloadCallbackCommands[msg.payload.payload.command].f(msg, users[msg.senderId]);
		} catch (err) {
			console.log(err);
		}
		next();
	});
	vkGroup.updates.start().catch(console.error);

	vkManager.updates.on('message', async (msg, next) => {
		if (msg.isUser) {
			if (!enableManage[msg.peerId]) return;

			if (msg.eventType == "chat_invite_user" || msg.eventType == "chat_invite_user_by_link") {
				let id = (msg.eventType == "chat_invite_user" ? msg.eventMemberId : msg.senderId);
				if (id < 0) return;
				let [user] = await vkManager.api.users.get({ user_id: id });
				msg.send(
					`👋 @id${id} (${user.first_name} ${user.last_name}), добро пожаловать!\n` +
					`📜 Ознакомься с правилами беседы в закрепленном сообщений`
				);
			}

			for (let i = 0, len = managerCommands.length; i < len; i++) {
				if (managerCommands[i].mr) {
					let cmd = managerCommands[i];
					if (cmd.mr.test(msg.text)) {
						await vkFromDb(msg.senderId);
						if (!users[msg.senderId]) await regAcc(msg.senderId);
						if (users[msg.senderId].status.type < 100) return;
						msg.match = msg.text.match(cmd.mr);
						users[msg.senderId].lastActivity = + new Date();
						try {
							cmd.f(msg, users[msg.senderId])
						} catch (err) {
							console.log(err);
						}
					}
				}
			}
		}
		next();
	});
	vkManager.updates.start().catch(console.error);
});


const readline = require('readline');
const send = require('./api/send');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on('line', (input) => {
	console.log(eval(input));
});