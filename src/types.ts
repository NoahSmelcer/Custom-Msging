export type Profile = { id: string; display_name: string; role: 'member' | 'admin' }
export type Message = { id: string; sender_id: string; body: string; created_at: string; failed?: boolean; pending?: boolean }
