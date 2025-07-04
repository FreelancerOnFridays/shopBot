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
const token = process.env.BOT_API_KEY;
if (!token) {
    throw new Error("BOT_API_KEY is not defined in .env");
}
const bot = new grammy_1.Bot(token);
const i18n = new i18n_1.I18n({
    defaultLocale: "en",
    directory: "locales",
});
bot.use(i18n);
const chooseLanguageKeyboard = new grammy_1.InlineKeyboard()
    .text("English 🇬🇧", "en")
    .text("Русский 🇷🇺", "ru");
bot.command("start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply(ctx.t("start"), {
        reply_markup: chooseLanguageKeyboard,
    });
}));
bot.callbackQuery("en", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.i18n.useLocale("en");
    yield ctx.answerCallbackQuery();
    yield ctx.reply(ctx.t("order"), {
        reply_markup: new grammy_1.InlineKeyboard().text(ctx.t("orderButton"), "leave_request"),
    });
}));
bot.callbackQuery("ru", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.i18n.useLocale("ru");
    yield ctx.answerCallbackQuery();
    yield ctx.reply(ctx.t("order"));
}));
bot.callbackQuery("leave_request", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCallbackQuery();
    yield ctx.reply(ctx.t("orderConfirm"));
}));
bot.start();
