export interface Product {
    id: number;
    name: string;
    sku: string;
    description?: string;
    price: string | number;
    stock_quantity: number;
    reorder_level: number;
    expiration_date?: string;
    status: 'active' | 'inactive' | 'discontinued';
    is_low_stock: boolean;
    is_expired: boolean;
    is_expiring_soon: boolean;
    created_by?: number;
    updated_by?: number;
    creator?: {
        id: number;
        name: string;
    };
    updater?: {
        id: number;
        name: string;
    };
    packages?: Package[];
    transactions?: InventoryTransaction[];
    created_at: string;
    updated_at: string;
    total_moved?: number;
}

export interface Package {
    id: number;
    name: string;
    code: string;
    description?: string;
    price: string | number;
    status: 'active' | 'inactive';
    total_products_count: number;
    created_by?: number;
    updated_by?: number;
    creator?: {
        id: number;
        name: string;
    };
    updater?: {
        id: number;
        name: string;
    };
    products?: (Product & { pivot: { quantity: number } })[];
    created_at: string;
    updated_at: string;
}

export interface InventoryTransaction {
    id: number;
    product_id: number;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    previous_quantity: number;
    new_quantity: number;
    reference_type?: string;
    reference_id?: number;
    notes?: string;
    created_by?: number;
    product?: Product;
    creator?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

export interface InventoryStatistics {
    total_products: number;
    total_stock_value: number;
    low_stock_count: number;
    expired_count: number;
    expiring_soon_count: number;
    stock_in_count: number;
    stock_out_count: number;
    net_stock_change: number;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}
