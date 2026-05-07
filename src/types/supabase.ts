export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          school_id: string | null
          role: string
        }
        Insert: {
          id: string
          school_id?: string | null
          role?: string
        }
        Update: {
          id?: string
          school_id?: string | null
          role?: string
        }
      }
      materials: {
        Row: {
          id: string
          file_url: string
          file_name: string
          subject: string
          material_type: string
          school_id: string
          created_at: string
        }
        Insert: {
          id?: string
          file_url: string
          file_name: string
          subject: string
          material_type: string
          school_id: string
          created_at?: string
        }
        Update: {
          id?: string
          file_url?: string
          file_name?: string
          subject?: string
          material_type?: string
          school_id?: string
          created_at?: string
        }
      }
      syllabus: {
        Row: {
          id: string
          class_name: string
          subject: string
          content: string
        }
        Insert: {
          id?: string
          class_name: string
          subject: string
          content: string
        }
        Update: {
          id?: string
          class_name?: string
          subject?: string
          content?: string
        }
      }
      schools: {
        Row: {
          id: string
          name: string
          attendance_mode: string
        }
        Insert: {
          id?: string
          name: string
          attendance_mode?: string
        }
        Update: {
          id?: string
          name?: string
          attendance_mode?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          priority: string
          audience: string
          school_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          priority: string
          audience: string
          school_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          priority?: string
          audience?: string
          school_id?: string
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          date: string
          status: string
          school_id: string
        }
        Insert: {
          id?: string
          student_id: string
          date: string
          status: string
          school_id: string
        }
        Update: {
          id?: string
          student_id?: string
          date?: string
          status?: string
          school_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
