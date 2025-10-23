<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BinaryNode extends Model
{
    protected $fillable = ['user_id', 'parent_id', 'position', 'level'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(BinaryNode::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(BinaryNode::class, 'parent_id');
    }

    // public function leftChild()
    // {
    //     return $this->hasOne(BinaryNode::class, 'parent_id')->where('position', 'left');
    // }

    // public function rightChild()
    // {
    //     return $this->hasOne(BinaryNode::class, 'parent_id')->where('position', 'right');
    // }

    public function leftChild()
    {
        return $this->hasOne(BinaryNode::class, 'parent_left_id');
    }

    public function rightChild()
    {
        return $this->hasOne(BinaryNode::class, 'parent_right_id');
    }
}
