export type EncashmentStatus =
    | 'pending'
    | 'approved'
    | 'processed'
    | 'released'
    | 'rejected'
    | 'cancelled';

export type PaymentType = 'voucher' | 'cheque' | 'bank_transfer';

export interface Encashment {
    id: number;
    encashment_no: string;
    amount: number;
    status: EncashmentStatus;
    member: {
        id: number;
        name: string;
        MID: string;
        email: string;
        address?: string;
        mobile?: string;
    };
    member_notes?: string | null;
    admin_notes?: string | null;
    accounting_notes?: string | null;
    cashier_notes?: string | null;
    approved_by?: {
        id: number;
        name: string;
    } | null;
    approved_at?: string | null;
    processed_by?: {
        id: number;
        name: string;
    } | null;
    processed_at?: string | null;
    voucher_no?: string | null;
    payment_type?: PaymentType | null;
    released_by?: {
        id: number;
        name: string;
    } | null;
    released_at?: string | null;
    received_by?: {
        id: number;
        name: string;
    } | null;
    received_by_name?: string | null;
    received_at?: string | null;
    rejected_by?: {
        id: number;
        name: string;
    } | null;
    rejected_at?: string | null;
    rejection_reason?: string | null;
    created_at: string;
    updated_at: string;
}
