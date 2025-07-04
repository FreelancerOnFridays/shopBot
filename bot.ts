import { Bot, Context, InlineKeyboard, session, SessionFlavor } from "grammy";
import { I18n, I18nFlavor } from "@grammyjs/i18n";
import dotenv from "dotenv";
dotenv.config();

interface SessionData {
  __language_code?: string;
  pendingContact?: boolean;
  manualUsername?: string;
}
type MyContext = Context & SessionFlavor<SessionData> & I18nFlavor;

const ADMIN_ID = Number(process.env.ADMIN_ID);

const bot = new Bot<MyContext>(process.env.BOT_API_KEY!);

bot.use(
  session({
    initial: () => ({}),
  })
);

const i18n = new I18n<MyContext>({
  defaultLocale: "en",
  directory: "locales",
  useSession: true,
});
bot.use(i18n);

// keyboards
const chooseLanguageKeyboard = new InlineKeyboard()
  .text("English 🇬🇧", "lang_en")
  .row()
  .text("Русский 🇷🇺", "lang_ru");

// /start
bot.command("start", async (ctx) => {
  const isAdmin = ctx.from?.id === ADMIN_ID;

  if (isAdmin) {
    await ctx.reply("✅ Вы администратор. Заявки будут поступать сюда.");
  } else {
    await ctx.reply(ctx.t("start"), {
      reply_markup: chooseLanguageKeyboard,
      parse_mode: "MarkdownV2",
    });
  }
});

// choose language callback queries
bot.callbackQuery("lang_en", async (ctx) => {
  await ctx.i18n.setLocale("en");
  await ctx.deleteMessage();
  await ctx.reply(ctx.t("order"), {
    reply_markup: new InlineKeyboard().text(
      ctx.t("orderButton"),
      "leave_request"
    ),
    parse_mode: "MarkdownV2",
    
  });
});

bot.callbackQuery("lang_ru", async (ctx) => {
  await ctx.i18n.setLocale("ru");
  await ctx.deleteMessage();
  await ctx.reply(ctx.t("order"), {
    reply_markup: new InlineKeyboard().text(
      ctx.t("orderButton"),
      "leave_request"
    ),
    parse_mode: "MarkdownV2",
  });
});

// button to leave request
bot.callbackQuery("leave_request", async (ctx) => {

  if (!ctx.from?.username) {
    ctx.session.pendingContact = true;
    await ctx.reply(ctx.t("askUsername"), {
      parse_mode: "MarkdownV2",
    });
    return;
  }

  await sendRequestToAdmin(ctx, `@${ctx.from.username}`);
});

// username check
bot.on("message:text", async (ctx) => {
  if (!ctx.session.pendingContact) return;

  const input = ctx.message.text.trim();

  if (!input.startsWith("@") || input.length < 4) {
    await ctx.reply(ctx.t("invalidUsername"), {
      parse_mode: "MarkdownV2",
    });
    return;
  }

  ctx.session.manualUsername = input;
  ctx.session.pendingContact = false;

  await sendRequestToAdmin(ctx, input);
});

// send request to admin
async function sendRequestToAdmin(ctx: MyContext, username: string) {
  await ctx.reply(ctx.t("orderConfirm"), {
    parse_mode: "MarkdownV2",
  });

  const language = await ctx.i18n.getLocale();
  const date = new Date().toLocaleString("cs-CZ", {
  timeZone: "Europe/Prague",
  hour12: false, 
});

  const message = `📝 Новая заявка:

👤 Пользователь: ${username}
🌐 Язык: ${language}
🕒 Время: ${date}`;

  if (ctx.from?.id !== ADMIN_ID) {
    await ctx.api.sendMessage(ADMIN_ID, message);
  }
}

bot.start();
