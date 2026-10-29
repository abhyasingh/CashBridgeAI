"""CashBridge AI Telegram Bot.

Bilingual (English + Hindi) conversational channel for MSME owners.
Calls the existing service layer without duplicating logic.
"""
from __future__ import annotations

import logging
from typing import Optional

from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Update,
)
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from app.bot.chart_renderer import render_forecast_chart_bytes
from app.config import TELEGRAM_BOT_TOKEN
from app.db.session import SessionLocal
from app.schemas.api_schemas import AssistantAskRequest
from app.services.assistant_service import assistant_service
from app.services.business_service import business_service
from app.services.forecast_service import forecast_service
from app.services.loan_service import LoanAcceptRequest, LoanOfferRequest, loan_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# User session language preference in-memory map: user_id -> 'en' | 'hi'
USER_LANG: dict[int, str] = {}
# Linked business per user: user_id -> business_id
USER_BIZ: dict[int, str] = {}


def get_user_lang(user_id: int) -> str:
    return USER_LANG.get(user_id, "en")


def get_user_biz(user_id: int) -> str:
    return USER_BIZ.get(user_id, "MSME0002")


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_user or not update.message:
        return
    user_id = update.effective_user.id
    USER_BIZ[user_id] = "MSME0002"  # Linked to demo business Sharma Garments
    lang = get_user_lang(user_id)

    if lang == "hi":
        text = (
            "नमस्ते! मैं आपका CashBridge AI सहायक हूँ।\n"
            "आपका खाता **Sharma Garments, Lucknow** से लिंक हो गया है।\n\n"
            "उपलब्ध कमांड:\n"
            "• /summary - वर्तमान बैलेंस व रनवे सारांश\n"
            "• /forecast - 13-सप्ताह का कैशफ्लो चार्ट\n"
            "• /alert - संभावित कमी की चेतावनी व समाधान\n"
            "• /loan - वन-टैप ब्रिज लोन कार्ड\n"
            "• /lang - Switch to English\n\n"
            "आप सीधे टेक्स्ट या वॉयस मैसेज भेजकर भी कोई भी सवाल पूछ सकते हैं।"
        )
    else:
        text = (
            "Welcome to **CashBridge AI**.\n"
            "Your account has been linked to **Sharma Garments, Lucknow** (Code: `CB-SHARMA-002`).\n\n"
            "Commands:\n"
            "• /summary — Cash balance and runway\n"
            "• /forecast — 13-week forecast chart\n"
            "• /alert — Active shortfall alert & drivers\n"
            "• /loan — Pre-approved bridge micro-loan\n"
            "• /lang — हिंदी में बदलें\n\n"
            "You can also ask questions via text or voice message."
        )
    await update.message.reply_text(text, parse_mode="Markdown")


async def summary_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_user or not update.message:
        return
    user_id = update.effective_user.id
    lang = get_user_lang(user_id)
    biz_id = get_user_biz(user_id)

    db = SessionLocal()
    try:
        summary = business_service.get_summary(db, biz_id)
    finally:
        db.close()

    if lang == "hi":
        text = (
            f"📊 **{summary.businessName} — खाता सारांश**\n\n"
            f"• बैंक बैलेंस: ₹{summary.currentBalance:,.0f}\n"
            f"• सुरक्षित बफर सीमा: ₹{summary.safeBufferThreshold:,.0f}\n"
            f"• सुरक्षित रनवे: **{summary.runwayDays} दिन**\n"
            f"• 7 दिनों में अपेक्षित आवक: +₹{summary.expectedInflow7Days:,.0f}\n"
            f"• 15 दिनों में देय खर्च: -₹{summary.outflowDue15Days:,.0f}\n"
            f"• स्थिति: ⚠️ **{summary.riskLevel}**"
        )
    else:
        text = (
            f"📊 **{summary.businessName} — Cash Summary**\n\n"
            f"• Current Balance: ₹{summary.currentBalance:,.0f}\n"
            f"• Safe Buffer Limit: ₹{summary.safeBufferThreshold:,.0f}\n"
            f"• Safe Runway: **{summary.runwayDays} Days**\n"
            f"• Expected Inflow (7d): +₹{summary.expectedInflow7Days:,.0f}\n"
            f"• Outflow Due (15d): -₹{summary.outflowDue15Days:,.0f}\n"
            f"• Risk Tier: ⚠️ **{summary.riskLevel}**"
        )
    await update.message.reply_text(text, parse_mode="Markdown")


async def forecast_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_user or not update.message:
        return
    user_id = update.effective_user.id
    biz_id = get_user_biz(user_id)
    lang = get_user_lang(user_id)

    db = SessionLocal()
    try:
        points = forecast_service.get_13_week_forecast(db, biz_id)
        biz = business_service.get_profile(db, biz_id)
    finally:
        db.close()

    days = [p.day for p in points]
    p50s = [p.p50 for p in points]
    p10s = [p.p10 for p in points]
    p90s = [p.p90 for p in points]
    buffer = points[0].buffer

    chart_bytes = render_forecast_chart_bytes(
        business_name=biz.name,
        days=days,
        p50_values=p50s,
        p10_values=p10s,
        p90_values=p90s,
        buffer_threshold=buffer,
    )

    caption = (
        "📈 **13-सप्ताह कैशफ्लो अनुमान**\n"
        "18वें दिन बैलेंस ₹40,000 तक गिर सकता है (सुरक्षित बफर से ₹2.1L नीचे)।"
        if lang == "hi"
        else "📈 **13-Week Probabilistic Cash Projection**\n"
        "Day 18 dips to ₹40K (-₹2.1L below safe buffer limit). Use /alert to view reasons."
    )

    await update.message.reply_photo(photo=chart_bytes, caption=caption, parse_mode="Markdown")


async def alert_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_user or not update.message:
        return
    user_id = update.effective_user.id
    lang = get_user_lang(user_id)

    keyboard = [
        [
            InlineKeyboardButton("🔍 Why? (कारण देखें)", callback_data="btn_why"),
            InlineKeyboardButton("⚡ Get ₹2.3L Loan", callback_data="btn_get_loan"),
        ],
        [InlineKeyboardButton("✖ Dismiss", callback_data="btn_dismiss")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if lang == "hi":
        text = (
            "🚨 **संभावित नकदी संकट चेतावनी (Day 18)**\n\n"
            "• कमी की राशि: **₹2,10,000**\n"
            "• अपेक्षित तारीख: 12 नवंबर 2026\n"
            "• मॉडल सटीकता: 82% विश्वास\n\n"
            "क्या आप इस कमी के कारण देखना चाहते हैं या समाधान लोन स्वीकृत करना चाहते हैं?"
        )
    else:
        text = (
            "🚨 **Proactive Cash Deficit Alert (Day 18)**\n\n"
            "• Projected Shortfall: **₹2,10,000**\n"
            "• Horizon: 18 Days Ahead (12 Nov 2026)\n"
            "• Confidence: 82% Model Probability\n\n"
            "Inspect explainable drivers or activate pre-approved micro-loan."
        )
    await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")


async def loan_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_user or not update.message:
        return
    user_id = update.effective_user.id
    lang = get_user_lang(user_id)
    biz_id = get_user_biz(user_id)

    db = SessionLocal()
    try:
        offer = loan_service.get_offer(db, LoanOfferRequest(businessId=biz_id))
    finally:
        db.close()

    keyboard = [
        [InlineKeyboardButton("✅ I Agree & Confirm (स्वीकारें)", callback_data="btn_accept_loan")],
        [InlineKeyboardButton("✖ Cancel", callback_data="btn_dismiss")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if lang == "hi":
        text = (
            f"💳 **CashBridge वन-टैप ब्रिज लोन (डेमो)**\n\n"
            f"• स्वीकृत राशि: **₹{offer.sanctionedAmount:,.0f}**\n"
            f"• अवधि: {offer.tenureDays} दिन\n"
            f"• ब्याज दर: {offer.interestRateFlatPercent:.2f}% (कुल ₹{offer.interestAmount:,.0f})\n"
            f"• प्रोसेसिंग शुल्क + GST: ₹{offer.processingFeeAmount + offer.gstOnFee:,.0f}\n"
            f"• बैंक में आने वाली राशि: ₹{offer.netDisbursalAmount:,.0f}\n"
            f"• कुल चुकौती: ₹{offer.totalRepayableAmount:,.0f}\n"
            f"• लिंक बिल: {offer.linkedCustomerName} (#{offer.linkedInvoiceNumber})\n\n"
            f"_कपूर रिटेलर्स का बिल आते ही स्वतः कट जाएगा। सिमुलेटेड ऋणदाता।_"
        )
    else:
        text = (
            f"💳 **CashBridge 1-Tap Micro-Credit (Demo)**\n\n"
            f"• Sanctioned Credit: **₹{offer.sanctionedAmount:,.0f}**\n"
            f"• Tenure: {offer.tenureDays} Days\n"
            f"• Interest Rate: {offer.interestRateFlatPercent:.2f}% flat (₹{offer.interestAmount:,.0f})\n"
            f"• Processing Fee + GST: ₹{offer.processingFeeAmount + offer.gstOnFee:,.0f}\n"
            f"• Net Disbursed: ₹{offer.netDisbursalAmount:,.0f}\n"
            f"• Total Repayable: ₹{offer.totalRepayableAmount:,.0f}\n"
            f"• Earmarked Invoice: {offer.linkedCustomerName} (#{offer.linkedInvoiceNumber})\n\n"
            f"_Auto-repaid upon invoice settlement. Regulated NBFC partner mock._"
        )
    await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")


async def button_callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if not query or not query.data:
        return
    await query.answer()

    user_id = query.from_user.id
    lang = get_user_lang(user_id)
    biz_id = get_user_biz(user_id)
    data = query.data

    if data == "btn_why":
        db = SessionLocal()
        try:
            analysis = forecast_service.get_shortfall_analysis(db, "alt_gap_01", lang)
        finally:
            db.close()

        lines = ["🔍 **Why is there a ₹2.1L gap?**\n" if lang == "en" else "🔍 **₹2.1L की कमी के मुख्य कारण:**\n"]
        for f in analysis.factors:
            title = f.titleHi if lang == "hi" else f.titleEn
            lines.append(f"• **{title}**: ₹{f.impactAmount:,.0f} ({f.percentageContribution:.0f}%)")
        await query.message.reply_text("\n".join(lines), parse_mode="Markdown")

    elif data == "btn_get_loan":
        await loan_command(update, context)

    elif data == "btn_accept_loan":
        db = SessionLocal()
        try:
            res = loan_service.accept_loan(
                db,
                LoanAcceptRequest(
                    offerId="CB-LN-001",
                    consentAgreed=True,
                    linkedInvoiceNumber="INV-2026-089",
                    businessId=biz_id,
                ),
            )
        finally:
            db.close()

        msg = (
            f"🎉 **लोन सफलतापूर्वक स्वीकृत!**\n\n"
            f"• लोन आईडी: `{res.loanId}`\n"
            f"• वितरित राशि: ₹{res.disbursedAmount:,.0f}\n"
            f"• खाता: {res.targetAccountMasked}\n"
            f"• चुकौती देय तिथि: {res.repaymentDueDate}\n"
            f"• स्टेटस: DISBURSED (सिमुलेटेड)"
            if lang == "hi"
            else f"🎉 **Bridge Credit Disbursed!**\n\n"
            f"• Loan ID: `{res.loanId}`\n"
            f"• Net Disbursed: ₹{res.disbursedAmount:,.0f}\n"
            f"• Account: {res.targetAccountMasked}\n"
            f"• Repayment Due: {res.repaymentDueDate}\n"
            f"• Status: DISBURSED (Demo Environment)"
        )
        await query.message.reply_text(msg, parse_mode="Markdown")

    elif data == "btn_dismiss":
        await query.message.reply_text("✅ Alert dismissed.")


async def lang_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_user or not update.message:
        return
    user_id = update.effective_user.id
    current = get_user_lang(user_id)
    new_lang = "en" if current == "hi" else "hi"
    USER_LANG[user_id] = new_lang
    msg = "भाषा बदलकर **हिंदी** कर दी गई है।" if new_lang == "hi" else "Language switched to **English**."
    await update.message.reply_text(msg, parse_mode="Markdown")


async def text_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_user or not update.message or not update.message.text:
        return
    user_id = update.effective_user.id
    text = update.message.text
    lang = get_user_lang(user_id)
    biz_id = get_user_biz(user_id)

    db = SessionLocal()
    try:
        reply = assistant_service.ask(
            db,
            AssistantAskRequest(question=text, language=lang, businessId=biz_id),  # type: ignore[arg-type]
        )
    finally:
        db.close()

    await update.message.reply_text(reply.answer)


async def voice_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Pluggable voice transcription handler (Whisper / Google Cloud Speech stub)."""
    if not update.effective_user or not update.message:
        return
    user_id = update.effective_user.id
    lang = get_user_lang(user_id)

    # Simulated voice transcription
    transcribed_text = "मेरा बैलेंस और आगामी कमी का विवरण क्या है?" if lang == "hi" else "What is my cash runway and shortfall?"
    await update.message.reply_text(f"🎙️ *Voice Transcribed*: \"{transcribed_text}\"", parse_mode="Markdown")
    
    # Process transcribed text
    update.message.text = transcribed_text
    await text_message_handler(update, context)


def create_bot_app() -> Optional[Application]:
    if not TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN == "your_token_here":
        logger.warning("TELEGRAM_BOT_TOKEN is not set. Bot application cannot be started.")
        return None

    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("summary", summary_command))
    app.add_handler(CommandHandler("forecast", forecast_command))
    app.add_handler(CommandHandler("alert", alert_command))
    app.add_handler(CommandHandler("loan", loan_command))
    app.add_handler(CommandHandler("lang", lang_command))
    app.add_handler(CallbackQueryHandler(button_callback_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_message_handler))
    app.add_handler(MessageHandler(filters.VOICE, voice_message_handler))

    return app
