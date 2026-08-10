import React from 'react';
import { Store, Download, Eye, Star, Search } from 'lucide-react';

const TEMPLATES = [
  { id: 1, name: '教育通用模板', price: 9.9, sales: 128, rating: 4.8, preview: 'https://via.placeholder.com/400x250?text=教育模板' },
  { id: 2, name: '科技风格模板', price: 19.9, sales: 86, rating: 4.9, preview: 'https://via.placeholder.com/400x250?text=科技模板' },
  { id: 3, name: '语文课件模板', price: 12.9, sales: 64, rating: 4.7, preview: 'https://via.placeholder.com/400x250?text=语文模板' },
  { id: 4, name: '数学公式模板', price: 15.9, sales: 52, rating: 4.6, preview: 'https://via.placeholder.com/400x250?text=数学模板' },
  { id: 5, name: '英语教学模板', price: 14.9, sales: 93, rating: 4.9, preview: 'https://via.placeholder.com/400x250?text=英语模板' },
  { id: 6, name: '公开课精致模板', price: 29.9, sales: 37, rating: 4.9, preview: 'https://via.placeholder.com/400x250?text=公开课模板' },
];

export default function MarketPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">模板市场</h2>
          <p className="text-gray-500 mt-1">精选专业PPT模板，支持上传售卖</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="搜索模板..." className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover">
            <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-gray-400 text-sm">
              {t.name} 预览图
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{t.name}</h3>
                <span className="text-indigo-600 font-bold">¥{t.price}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" />{t.rating}</span>
                <span>已售 {t.sales}</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition">
                  <Eye size={15} /> 预览
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 gradient-primary text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
                  <Download size={15} /> 使用
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
