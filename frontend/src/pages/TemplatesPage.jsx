import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Loader2, Lock } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    client.get('/templates/').then((res) => {
      setTemplates(res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12"><Loader2 className="animate-spin inline-block" size={32} /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">模板市场</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm card-hover">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold">{t.name}</h3>
              {t.price_tier !== 'free' && <Lock size={18} className="text-gray-400" />}
            </div>
            <p className="text-gray-500 text-sm mb-3">{t.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {t.features?.map((f, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{f}</span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${
                t.price_tier === 'free' ? 'text-green-600' :
                t.price_tier === 'pro' ? 'text-orange-600' : 'text-purple-600'
              }`}>
                {t.price_tier === 'free' ? '免费' : t.price_tier === 'pro' ? 'Pro' : '学校版'}
              </span>
              <button onClick={() => navigate('/prep/generate')}
                className="text-blue-600 text-sm font-semibold hover:underline">
                使用此模板 →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
