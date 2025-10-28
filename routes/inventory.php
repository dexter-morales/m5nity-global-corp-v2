<?php

use App\Http\Controllers\InventoryReportController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ProductController;
use App\Models\InventoryProduct;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Inventory Routes
|--------------------------------------------------------------------------
|
| Routes for managing products, packages, and inventory reports.
| Access is controlled by policies based on user roles.
|
*/

// Bind 'product' parameter to InventoryProduct model
Route::bind('product', function ($value) {
    return InventoryProduct::findOrFail($value);
});

Route::middleware(['auth', 'verified'])->prefix('inventory')->group(function () {

    // Product Routes
    Route::resource('products', ProductController::class);
    Route::post('products/{inventoryProduct}/adjust-stock', [ProductController::class, 'adjustStock'])
        ->name('products.adjust-stock');

    // Package Routes
    Route::resource('packages', PackageController::class);

    // Inventory Reports Routes
    Route::prefix('reports')->name('inventory-reports.')->group(function () {
        Route::get('/', [InventoryReportController::class, 'index'])->name('index');
        Route::get('/export/csv', [InventoryReportController::class, 'exportCsv'])->name('export.csv');
        Route::get('/export/excel', [InventoryReportController::class, 'exportExcel'])->name('export.excel');
        Route::get('/export/pdf', [InventoryReportController::class, 'exportPdf'])->name('export.pdf');
    });
});
