"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const i18n_1 = require("@grammyjs/i18n");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ADMIN_ID = Number(process.env.ADMIN_ID);
const bot = new grammy_1.Bot(process.env.BOT_API_KEY);
bot.use((0, grammy_1.session)({
    initial: () => ({}),
}));
const i18n = new i18n_1.I18n({
    defaultLocale: "en",
    directory: "locales",
    useSession: true,
});
bot.use(i18n);
// keyboards
const chooseLanguageKeyboard = new grammy_1.InlineKeyboard()
    .text("English 🇬🇧", "lang_en")
    .row()
    .text("Русский 🇷🇺", "lang_ru");
// /start
bot.command("start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const isAdmin = ((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id) === ADMIN_ID;
    if (isAdmin) {
        yield ctx.reply("✅ Вы администратор. Заявки будут поступать сюда.");
    }
    else {
        yield ctx.reply(ctx.t("start"), {
            reply_markup: chooseLanguageKeyboard,
            parse_mode: "MarkdownV2",
        });
    }
}));
// choose language callback queries
bot.callbackQuery("lang_en", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.i18n.setLocale("en");
    yield ctx.deleteMessage();
    yield ctx.reply(ctx.t("order"), {
        reply_markup: new grammy_1.InlineKeyboard().text(ctx.t("orderButton"), "leave_request"),
        parse_mode: "MarkdownV2",
    });
}));
bot.callbackQuery("lang_ru", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.i18n.setLocale("ru");
    yield ctx.deleteMessage();
    yield ctx.reply(ctx.t("order"), {
        reply_markup: new grammy_1.InlineKeyboard().text(ctx.t("orderButton"), "leave_request"),
        parse_mode: "MarkdownV2",
    });
}));
// button to leave request
bot.callbackQuery("leave_request", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.username)) {
        ctx.session.pendingContact = true;
        yield ctx.reply(ctx.t("askUsername"), {
            parse_mode: "MarkdownV2",
        });
        return;
    }
    yield sendRequestToAdmin(ctx, `@${ctx.from.username}`);
}));
// username check
bot.on("message:text", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.session.pendingContact)
        return;
    const input = ctx.message.text.trim();
    if (!input.startsWith("@") || input.length < 4) {
        yield ctx.reply(ctx.t("invalidUsername"), {
            parse_mode: "MarkdownV2",
        });
        return;
    }
    ctx.session.manualUsername = input;
    ctx.session.pendingContact = false;
    yield sendRequestToAdmin(ctx, input);
}));
// send request to admin
function sendRequestToAdmin(ctx, username) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        yield ctx.reply(ctx.t("orderConfirm"), {
            parse_mode: "MarkdownV2",
        });
        const language = yield ctx.i18n.getLocale();
        const date = new Date().toLocaleString("cs-CZ", {
            timeZone: "Europe/Prague",
            hour12: false,
        });
        const message = `📝 Новая заявка:

👤 Пользователь: ${username}
🌐 Язык: ${language}
🕒 Время: ${date}`;
        if (((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id) !== ADMIN_ID) {
            yield ctx.api.sendMessage(ADMIN_ID, message);
        }
    });
}
bot.start();
