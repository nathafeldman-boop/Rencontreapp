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

export interface Recommendation {
  category: "photos" | "bio" | "conversation";
  title: string;
  detail: string;
}

export type PhotoSuggestedRole = "primary" | "secondary" | "remove";
export type AiFeature = "profile_analysis" | "bio_generator" | "conversation_coach" | "match_simulator" | "dating_plan";
export type BioStyle = "funny" | "mysterious" | "confident" | "romantic" | "premium";

export interface ConversationSuggestion {
  tone: "funny" | "flirty" | "natural";
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
