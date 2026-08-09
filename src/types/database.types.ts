/**
 * Hand-authored to match `supabase/migrations/0001_init.sql`, in the shape
 * `supabase gen types typescript` produces. Once a Supabase project exists,
 * replace this file with the generated version:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts
 */

export type Gender = "male" | "female" | "non_binary" | "other";
export type DatingGoal = "serious_relationship" | "casual_dating" | "friends" | "not_sure";
export type DatingApp = "tinder" | "bumble" | "hinge" | "other";
export type SubscriptionPlan = "free" | "premium_monthly" | "premium_annual";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete";
/** Broader than `DatingApp` — includes Meetic, used only by manual stats entry (see /dashboard/progression). */
export type DatingPlatform = "tinder" | "hinge" | "bumble" | "meetic" | "other";

export interface Recommendation {
  category: "photos" | "bio" | "conversation";
  title: string;
  detail: string;
}

export type PhotoSuggestedRole = "primary" | "secondary" | "remove";
export type AiFeature =
  | "profile_analysis"
  | "bio_generator"
  | "conversation_coach"
  | "match_simulator"
  | "dating_plan"
  | "dating_stats";
export type BioStyle = "funny" | "mysterious" | "confident" | "romantic" | "premium";

export type CoachMode = "auto" | "flirt" | "funny" | "natural" | "confident";

export type AffiliateCommissionStatus = "due" | "paid" | "void";

export interface ConversationSuggestion {
  tone: "funny" | "flirty" | "natural" | "confident";
  message: string;
  explanation: string;
}

export interface MatchPersona {
  gender: Gender;
  personality: string;
}

export interface MatchMessage {
  role: "user" | "match";
  content: string;
}

export type ReferralSource = "referral" | "creator";
export type FeedbackCategory = "bug" | "feature" | "general";

export interface PlanDay {
  day: number;
  title: string;
  description: string;
  done: boolean;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          gender: Gender | null;
          age: number | null;
          country: string | null;
          dating_goal: DatingGoal | null;
          dating_apps_used: DatingApp[];
          daily_reminder_enabled: boolean | null;
          signup_referrer: string | null;
          signup_utm_source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["users"]["Row"], "id">> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          photos: string[];
          dating_app: DatingApp;
          photos_optimized: boolean;
          /** Hinge-style prompt/answer cards — see migration 0013 and lib/profile-prompts.ts. Null unless the user has gone through the Hinge prompts flow. */
          prompts: { prompt: string; answer: string }[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["profiles"]["Row"], "id">> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      onboarding_answers: {
        Row: {
          id: string;
          user_id: string;
          question: string;
          answer: string;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["onboarding_answers"]["Row"], "id">> & {
          user_id: string;
          question: string;
          answer: string;
        };
        Update: Partial<Database["public"]["Tables"]["onboarding_answers"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "onboarding_answers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string | null;
          overall_score: number;
          photo_score: number | null;
          bio_score: number | null;
          conversation_score: number | null;
          attractiveness_score: number | null;
          recommendations: Recommendation[];
          free_insights: string[];
          is_simulated: boolean;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["analyses"]["Row"], "id">> & {
          user_id: string;
          overall_score: number;
        };
        Update: Partial<Database["public"]["Tables"]["analyses"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "analyses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analyses_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string | null;
          plan: SubscriptionPlan;
          status: SubscriptionStatus | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["subscriptions"]["Row"], "id">> & {
          user_id: string;
          stripe_customer_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      photo_analyses: {
        Row: {
          id: string;
          analysis_id: string;
          user_id: string;
          photo_path: string;
          position: number;
          score: number;
          confidence_score: number | null;
          attractiveness_score: number | null;
          technical_score: number | null;
          pros: string[];
          cons: string[];
          recommendation: string;
          suggested_role: PhotoSuggestedRole;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["photo_analyses"]["Row"], "id">> & {
          analysis_id: string;
          user_id: string;
          photo_path: string;
          position: number;
          score: number;
        };
        Update: Partial<Database["public"]["Tables"]["photo_analyses"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "photo_analyses_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "analyses";
            referencedColumns: ["id"];
          },
        ];
      };
      bio_generations: {
        Row: {
          id: string;
          user_id: string;
          style: string;
          source_bio: string | null;
          generated_bios: string[];
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["bio_generations"]["Row"], "id">> & {
          user_id: string;
          style: string;
        };
        Update: Partial<Database["public"]["Tables"]["bio_generations"]["Row"]>;
        Relationships: [];
      };
      conversation_coach_sessions: {
        Row: {
          id: string;
          user_id: string;
          input_text: string;
          suggestions: ConversationSuggestion[];
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["conversation_coach_sessions"]["Row"], "id">> & {
          user_id: string;
          input_text: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversation_coach_sessions"]["Row"]>;
        Relationships: [];
      };
      match_simulator_sessions: {
        Row: {
          id: string;
          user_id: string;
          persona: MatchPersona;
          messages: MatchMessage[];
          conversation_score: number | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["match_simulator_sessions"]["Row"], "id">> & {
          user_id: string;
          persona: MatchPersona;
        };
        Update: Partial<Database["public"]["Tables"]["match_simulator_sessions"]["Row"]>;
        Relationships: [];
      };
      dating_plans: {
        Row: {
          id: string;
          user_id: string;
          days: PlanDay[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["dating_plans"]["Row"], "id">> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["dating_plans"]["Row"]>;
        Relationships: [];
      };
      ai_usage_events: {
        Row: {
          id: string;
          user_id: string;
          feature: AiFeature;
          credits_used: number;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["ai_usage_events"]["Row"], "id">> & {
          user_id: string;
          feature: AiFeature;
        };
        Update: Partial<Database["public"]["Tables"]["ai_usage_events"]["Row"]>;
        Relationships: [];
      };
      referrals: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["referrals"]["Row"], "id">> & {
          user_id: string;
          code: string;
        };
        Update: Partial<Database["public"]["Tables"]["referrals"]["Row"]>;
        Relationships: [];
      };
      creators: {
        Row: {
          id: string;
          slug: string;
          name: string;
          headline: string | null;
          promo_code: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["creators"]["Row"], "id">> & {
          slug: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["creators"]["Row"]>;
        Relationships: [];
      };
      referral_invites: {
        Row: {
          id: string;
          referrer_user_id: string | null;
          creator_id: string | null;
          referred_user_id: string;
          source: ReferralSource;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["referral_invites"]["Row"], "id">> & {
          referred_user_id: string;
          source: ReferralSource;
        };
        Update: Partial<Database["public"]["Tables"]["referral_invites"]["Row"]>;
        Relationships: [];
      };
      referral_rewards: {
        Row: {
          id: string;
          user_id: string;
          reward_days: number;
          reason: string;
          granted_at: string;
          expires_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["referral_rewards"]["Row"], "id">> & {
          user_id: string;
          reward_days: number;
          reason: string;
          expires_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["referral_rewards"]["Row"]>;
        Relationships: [];
      };
      affiliates: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          commission_rate: number;
          active: boolean;
          display_name: string | null;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["affiliates"]["Row"], "id">> & {
          user_id: string;
          code: string;
        };
        Update: Partial<Database["public"]["Tables"]["affiliates"]["Row"]>;
        Relationships: [];
      };
      affiliate_invites: {
        Row: {
          id: string;
          token: string;
          label: string | null;
          commission_rate: number;
          used_at: string | null;
          used_by_affiliate_id: string | null;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["affiliate_invites"]["Row"], "id">> & {
          token: string;
        };
        Update: Partial<Database["public"]["Tables"]["affiliate_invites"]["Row"]>;
        Relationships: [];
      };
      affiliate_clicks: {
        Row: {
          id: string;
          affiliate_id: string;
          occurred_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["affiliate_clicks"]["Row"], "id">> & {
          affiliate_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["affiliate_clicks"]["Row"]>;
        Relationships: [];
      };
      affiliate_referrals: {
        Row: {
          id: string;
          affiliate_id: string;
          referred_user_id: string;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["affiliate_referrals"]["Row"], "id">> & {
          affiliate_id: string;
          referred_user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["affiliate_referrals"]["Row"]>;
        Relationships: [];
      };
      affiliate_commissions: {
        Row: {
          id: string;
          affiliate_id: string;
          referred_user_id: string;
          stripe_checkout_session_id: string;
          amount_cents: number;
          commission_cents: number;
          status: AffiliateCommissionStatus;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["affiliate_commissions"]["Row"], "id">> & {
          affiliate_id: string;
          referred_user_id: string;
          stripe_checkout_session_id: string;
          amount_cents: number;
          commission_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["affiliate_commissions"]["Row"]>;
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          category: FeedbackCategory;
          context: string | null;
          helpful: boolean | null;
          message: string | null;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["feedback"]["Row"], "id">> & {
          user_id: string;
          category: FeedbackCategory;
        };
        Update: Partial<Database["public"]["Tables"]["feedback"]["Row"]>;
        Relationships: [];
      };
      dating_stats: {
        Row: {
          id: string;
          user_id: string;
          platform: DatingPlatform;
          period_start: string;
          period_end: string;
          likes: number;
          matches: number;
          conversations: number;
          replies: number;
          dates: number;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["dating_stats"]["Row"], "id">> & {
          user_id: string;
          platform: DatingPlatform;
          period_start: string;
          period_end: string;
        };
        Update: Partial<Database["public"]["Tables"]["dating_stats"]["Row"]>;
        Relationships: [];
      };
      admin_access_codes: {
        Row: {
          id: string;
          code: string;
          label: string | null;
          is_active: boolean;
          created_at: string;
          expires_at: string | null;
          last_used_at: string | null;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["admin_access_codes"]["Row"], "id">> & {
          code: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_access_codes"]["Row"]>;
        Relationships: [];
      };
      admin_sessions: {
        Row: {
          id: string;
          token: string;
          access_code_id: string;
          created_at: string;
          expires_at: string;
          last_seen_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["admin_sessions"]["Row"], "id">> & {
          token: string;
          access_code_id: string;
          expires_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_sessions"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "admin_sessions_access_code_id_fkey";
            columns: ["access_code_id"];
            isOneToOne: false;
            referencedRelation: "admin_access_codes";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_events: {
        Row: {
          id: string;
          user_id: string | null;
          anon_id: string | null;
          event: string;
          properties: Record<string, unknown>;
          occurred_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["activity_events"]["Row"], "id">> & {
          event: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_events"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "activity_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      manual_payments: {
        Row: {
          id: string;
          user_id: string;
          amount_cents: number;
          note: string | null;
          paid_at: string;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["manual_payments"]["Row"], "id">> & {
          user_id: string;
          amount_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["manual_payments"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "manual_payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      gender: Gender;
      dating_goal: DatingGoal;
      dating_app: DatingApp;
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
