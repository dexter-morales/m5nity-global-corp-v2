<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Inventory Report - {{ ucfirst($type) }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .summary-box {
            background: #f5f5f5;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .summary-item {
            display: inline-block;
            width: 48%;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #4a5568;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }
        .badge-success {
            background: #48bb78;
            color: white;
        }
        .badge-danger {
            background: #f56565;
            color: white;
        }
        .badge-warning {
            background: #ed8936;
            color: white;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Inventory Report</h1>
        <p><strong>Report Type:</strong> {{ ucfirst(str_replace('_', ' ', $type)) }}</p>
        <p><strong>Period:</strong> {{ $startDate->format('M d, Y') }} - {{ $endDate->format('M d, Y') }}</p>
        <p><strong>Generated:</strong> {{ now()->format('M d, Y H:i:s') }}</p>
    </div>

    @if($type === 'summary' || isset($data['statistics']))
    <div class="summary-box">
        <h2>Summary Statistics</h2>
        <div class="summary-item">
            <strong>Total Products:</strong> {{ $data['statistics']['total_products'] }}
        </div>
        <div class="summary-item">
            <strong>Total Stock Value:</strong> ₱{{ number_format($data['statistics']['total_stock_value'], 2) }}
        </div>
        <div class="summary-item">
            <strong>Low Stock Products:</strong> {{ $data['statistics']['low_stock_count'] }}
        </div>
        <div class="summary-item">
            <strong>Expired Products:</strong> {{ $data['statistics']['expired_count'] }}
        </div>
        <div class="summary-item">
            <strong>Stock In (Period):</strong> {{ $data['statistics']['stock_in_count'] }}
        </div>
        <div class="summary-item">
            <strong>Stock Out (Period):</strong> {{ $data['statistics']['stock_out_count'] }}
        </div>
    </div>
    @endif

    @if($type === 'stock_levels' && isset($data['products']))
    <h2>Stock Levels</h2>
    <table>
        <thead>
            <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th class="text-right">Stock Qty</th>
                <th class="text-right">Reorder Level</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total Value</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['products'] as $product)
            <tr>
                <td>{{ $product->sku }}</td>
                <td>{{ $product->name }}</td>
                <td class="text-right">{{ $product->stock_quantity }}</td>
                <td class="text-right">{{ $product->reorder_level }}</td>
                <td class="text-right">₱{{ number_format($product->price, 2) }}</td>
                <td class="text-right">₱{{ number_format($product->stock_quantity * $product->price, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(($type === 'low_stock' || $type === 'summary') && isset($data['low_stock']))
    <h2>Low Stock Products</h2>
    <table>
        <thead>
            <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th class="text-right">Current Stock</th>
                <th class="text-right">Reorder Level</th>
                <th class="text-right">Shortage</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['low_stock'] as $product)
            <tr>
                <td>{{ $product->sku }}</td>
                <td>{{ $product->name }}</td>
                <td class="text-right">{{ $product->stock_quantity }}</td>
                <td class="text-right">{{ $product->reorder_level }}</td>
                <td class="text-right">{{ $product->reorder_level - $product->stock_quantity }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(($type === 'expiration' || $type === 'summary') && (isset($data['expired']) || isset($data['expiring_soon'])))
    <h2>Expiration Report</h2>
    <table>
        <thead>
            <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th class="text-right">Stock</th>
                <th>Expiration Date</th>
                <th class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @if(isset($data['expired']))
            @foreach($data['expired'] as $product)
            <tr>
                <td>{{ $product->sku }}</td>
                <td>{{ $product->name }}</td>
                <td class="text-right">{{ $product->stock_quantity }}</td>
                <td>{{ $product->expiration_date ? $product->expiration_date->format('M d, Y') : 'N/A' }}</td>
                <td class="text-center"><span class="badge badge-danger">Expired</span></td>
            </tr>
            @endforeach
            @endif
            @if(isset($data['expiring_soon']))
            @foreach($data['expiring_soon'] as $product)
            <tr>
                <td>{{ $product->sku }}</td>
                <td>{{ $product->name }}</td>
                <td class="text-right">{{ $product->stock_quantity }}</td>
                <td>{{ $product->expiration_date ? $product->expiration_date->format('M d, Y') : 'N/A' }}</td>
                <td class="text-center"><span class="badge badge-warning">Expiring Soon</span></td>
            </tr>
            @endforeach
            @endif
        </tbody>
    </table>
    @endif

    @if(($type === 'fast_moving' || $type === 'summary') && isset($data['fast_moving']))
    <h2>Fast Moving Products</h2>
    <table>
        <thead>
            <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th class="text-right">Current Stock</th>
                <th class="text-right">Units Sold</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['fast_moving'] as $product)
            <tr>
                <td>{{ $product->sku }}</td>
                <td>{{ $product->name }}</td>
                <td class="text-right">{{ $product->stock_quantity }}</td>
                <td class="text-right">{{ $product->total_moved ?? 0 }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(($type === 'slow_moving' || $type === 'summary') && isset($data['slow_moving']))
    <h2>Slow Moving Products</h2>
    <table>
        <thead>
            <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th class="text-right">Current Stock</th>
                <th class="text-right">Units Sold</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['slow_moving'] as $product)
            <tr>
                <td>{{ $product->sku }}</td>
                <td>{{ $product->name }}</td>
                <td class="text-right">{{ $product->stock_quantity }}</td>
                <td class="text-right">{{ $product->total_moved ?? 0 }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if($type === 'transactions' && isset($data['transactions']))
    <h2>Stock Transactions</h2>
    <table>
        <thead>
            <tr>
                <th>Date/Time</th>
                <th>SKU</th>
                <th>Product</th>
                <th>Type</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Prev Stock</th>
                <th class="text-right">New Stock</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['transactions'] as $transaction)
            <tr>
                <td>{{ $transaction->created_at->format('M d, Y H:i') }}</td>
                <td>{{ $transaction->product->sku ?? 'N/A' }}</td>
                <td>{{ $transaction->product->name ?? 'N/A' }}</td>
                <td class="text-center">
                    @if($transaction->type === 'in')
                        <span class="badge badge-success">IN</span>
                    @elseif($transaction->type === 'out')
                        <span class="badge badge-danger">OUT</span>
                    @else
                        <span class="badge badge-warning">ADJ</span>
                    @endif
                </td>
                <td class="text-right">{{ $transaction->quantity }}</td>
                <td class="text-right">{{ $transaction->previous_quantity }}</td>
                <td class="text-right">{{ $transaction->new_quantity }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer">
        <p>This is a system-generated report. No signature required.</p>
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    </div>
</body>
</html>

