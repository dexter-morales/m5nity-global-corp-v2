export interface BinaryNode {
    id: number;
    user_id: number;
    member_id?: number;
    members_account_id?: number;
    parent_id?: number | null;
    position?: "left" | "right" | null;
    level: number;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    leftChild?: BinaryNode | null;
    rightChild?: BinaryNode | null;
    meta?: {
        account_name?: string | null;
        member_name?: string | null;
        direct_sponsor_member?: string | null;
        placement_account_name?: string | null;
        placement_member_name?: string | null;
        joined_at?: string | null;
        left_group_value?: number | null;
        right_group_value?: number | null;
    };
}

export interface Payout {
    id: number;
    user_id: number;
    amount: number;
    level: number;
    type: string;
    created_at: string;
}
