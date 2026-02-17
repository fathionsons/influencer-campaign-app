import type {
  Campaign,
  CampaignInfluencer,
  Influencer,
  NotificationDevice,
  Payout,
  Profile,
  Submission
} from './domain';

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type TableBase = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: Relationship[];
};

type GenericView = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: Relationship[];
};

type GenericFunction = {
  Args: Record<string, unknown> | never;
  Returns: unknown;
};

export interface Database {
  public: {
    Tables: Record<string, TableBase> & {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string | null;
          timezone?: string | null;
        };
        Update: {
          full_name?: string | null;
          timezone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      campaigns: {
        Row: Campaign;
        Insert: {
          owner_user_id: string;
          brand_name: string;
          campaign_name: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          budget?: number;
          status?: Campaign['status'];
        };
        Update: {
          brand_name?: string;
          campaign_name?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          budget?: number;
          status?: Campaign['status'];
          updated_at?: string;
        };
        Relationships: [];
      };
      influencers: {
        Row: Influencer;
        Insert: {
          owner_user_id: string;
          name: string;
          platform: Influencer['platform'];
          handle: string;
          followers?: number;
          engagement_rate?: number;
          email?: string | null;
        };
        Update: {
          name?: string;
          platform?: Influencer['platform'];
          handle?: string;
          followers?: number;
          engagement_rate?: number;
          email?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      campaign_influencers: {
        Row: CampaignInfluencer;
        Insert: {
          campaign_id: string;
          influencer_id: string;
          role?: string | null;
          agreed_fee?: number | null;
          status?: CampaignInfluencer['status'];
        };
        Update: {
          role?: string | null;
          agreed_fee?: number | null;
          status?: CampaignInfluencer['status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'campaign_influencers_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaign_influencers_influencer_id_fkey';
            columns: ['influencer_id'];
            isOneToOne: false;
            referencedRelation: 'influencers';
            referencedColumns: ['id'];
          }
        ];
      };
      submissions: {
        Row: Submission;
        Insert: {
          campaign_id: string;
          influencer_id: string;
          title: string;
          caption?: string | null;
          media_type?: Submission['media_type'];
          media_url: string;
          due_date: string;
          status?: Submission['status'];
          feedback?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          title?: string;
          caption?: string | null;
          media_type?: Submission['media_type'];
          media_url?: string;
          due_date?: string;
          status?: Submission['status'];
          feedback?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'submissions_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'submissions_influencer_id_fkey';
            columns: ['influencer_id'];
            isOneToOne: false;
            referencedRelation: 'influencers';
            referencedColumns: ['id'];
          }
        ];
      };
      payouts: {
        Row: Payout;
        Insert: {
          campaign_id: string;
          influencer_id: string;
          amount: number;
          currency?: string;
          status?: Payout['status'];
          due_date: string;
          paid_at?: string | null;
        };
        Update: {
          amount?: number;
          currency?: string;
          status?: Payout['status'];
          due_date?: string;
          paid_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payouts_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payouts_influencer_id_fkey';
            columns: ['influencer_id'];
            isOneToOne: false;
            referencedRelation: 'influencers';
            referencedColumns: ['id'];
          }
        ];
      };
      notification_devices: {
        Row: NotificationDevice;
        Insert: {
          user_id: string;
          one_signal_id: string;
          platform?: string | null;
          push_token?: string | null;
        };
        Update: {
          one_signal_id?: string | null;
          platform?: string | null;
          push_token?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, GenericView>;
    Functions: Record<string, GenericFunction>;
    Enums: Record<string, string>;
  };
}
