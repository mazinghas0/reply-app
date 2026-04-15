import type { BlogPost } from "./types";
import { post as reject_boss_message } from "./reject-boss-message";
import { post as kakao_reply_tips } from "./kakao-reply-tips";
import { post as business_email_reply } from "./business-email-reply";
import { post as ambiguous_message_reply } from "./ambiguous-message-reply";
import { post as apology_message_guide } from "./apology-message-guide";
import { post as first_date_message } from "./first-date-message";
import { post as comfort_message_guide } from "./comfort-message-guide";
import { post as late_reply_tips } from "./late-reply-tips";
import { post as interview_thank_you_email } from "./interview-thank-you-email";
import { post as polite_request_message } from "./polite-request-message";
import { post as congratulations_message } from "./congratulations-message";
import { post as breakup_message_guide } from "./breakup-message-guide";
import { post as business_partner_email_reply } from "./business-partner-email-reply";
import { post as friend_counseling_reply } from "./friend-counseling-reply";
import { post as parent_text_reply } from "./parent-text-reply";
import { post as colleague_reject_message } from "./colleague-reject-message";
import { post as used_market_message } from "./used-market-message";
import { post as absence_message } from "./absence-message";
import { post as follow_up_message } from "./follow-up-message";
import { post as thank_you_reply } from "./thank-you-reply";
import { post as retirement_farewell_message } from "./retirement-farewell-message";

export type { BlogPost };

export const posts: BlogPost[] = [
  reject_boss_message,
  kakao_reply_tips,
  business_email_reply,
  ambiguous_message_reply,
  apology_message_guide,
  first_date_message,
  comfort_message_guide,
  late_reply_tips,
  interview_thank_you_email,
  polite_request_message,
  congratulations_message,
  breakup_message_guide,
  business_partner_email_reply,
  friend_counseling_reply,
  parent_text_reply,
  colleague_reject_message,
  used_market_message,
  absence_message,
  follow_up_message,
  thank_you_reply,
  retirement_farewell_message,
];
