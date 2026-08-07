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
