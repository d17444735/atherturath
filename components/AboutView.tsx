import React, { useState } from 'react';

const AboutView: React.FC = () => {
  // شعار معهد المخطوطات العربية
  const INSTITUTE_LOGO = "https://k.top4top.io/p_36875fco01.png"; 

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    suggestion: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const name = formData.name.trim();
    const email = formData.email.trim();
    const suggestion = formData.suggestion.trim();

    if (!name || !email) {
      setErrorMessage('يرجى إدخال الاسم الكامل والبريد الإلكتروني');
      setStatus('error');
      return;
    }

    if (!suggestion) {
      setErrorMessage('يرجى كتابة نص المقترح');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      const submissionData = new FormData();
      submissionData.append('الاسم الكامل للمرسل', name);
      submissionData.append('البريد الإلكتروني للمرسل', email);
      submissionData.append('نص الرسالة', suggestion);
      submissionData.append('_subject', 'مقترح جديد: إذاعة أثير التراث');
      submissionData.append('_captcha', 'false');
      submissionData.append('_template', 'table');

      const response = await fetch("https://formsubmit.co/MAIL_HOLDER", {
        method: "POST",
        body: submissionData,
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', suggestion: '' });
        setTimeout(() => setStatus('idle'), 10000);
      } else {
        throw new Error('تعذر الإرسال حالياً، يرجى المحاولة لاحقاً');
      }
    } catch (error: any) {
      setErrorMessage(error.message || "حدث خطأ غير متوقع.");
      setStatus('error');
    }
  };

  return (
    <div className="h-full w-full flex flex-col pt-6 px-4 md:px-0 font-readex overflow-hidden">
      {/* عنوان القسم */}
      <div className="mb-8 border-r-4 border-[#9d7902] pr-6 shrink-0">
        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter">عن أثير التراث</h2>
        <p className="text-[#9d7902] text-xs md:text-lg font-bold mt-2">صوت المخطوط في ذاكرة الأمة</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12 space-y-8">
        <div className="border border-white/10 rounded-[3rem] p-8 md:p-12 leading-relaxed backdrop-blur-xl">
          
          {/* النص التعريفي المحدث - تم تصغير الحجم بناءً على الطلب بشكل ملحوظ */}
          <div className="text-[13px] md:text-sm text-slate-300 font-light text-justify leading-relaxed max-w-3xl">
            <p className="mb-4">
              أثير التراث هي إذاعة معهد المخطوطات العربية، التابع للمنظمة العربية للتربية والثقافة والعلوم (ألكسو).
            </p>
            <p className="text-slate-400">
              تهدف الإذاعة إلى إحياء التراث العربي المخطوط، وتقديم برامج صوتية رصينة تتناول تاريخ المخطوطات، وسير العلماء والمؤلفين، وفنون النسخ والتجليد، إلى جانب تسليط الضوء على مناهج تحقيق النصوص التراثية وكنوز الذاكرة الحضارية.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <img 
              src={INSTITUTE_LOGO} 
              alt="معهد المخطوطات العربية" 
              className="w-full max-w-[140px] h-auto object-contain transition-transform hover:scale-105"
            />
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-12"></div>

          {/* نموذج المقترحات */}
          <div className="mt-8">
            <h3 className="text-xl md:text-2xl font-black text-white mb-6 text-center">شاركونا مقترحاتكم</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="الاسم الكامل *"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#9d7902]/50 transition-all placeholder:text-slate-600 font-readex text-sm"
                />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="البريد الإلكتروني *"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#9d7902]/50 transition-all placeholder:text-slate-600 font-readex text-sm"
                />
              </div>

              <textarea 
                required
                rows={4}
                value={formData.suggestion}
                onChange={(e) => setFormData({...formData, suggestion: e.target.value})}
                placeholder="اكتب مقترحك أو ملاحظتك *"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#9d7902]/50 transition-all placeholder:text-slate-600 resize-none text-sm font-readex"
              />

              <div className="flex flex-col items-center gap-3">
                <button 
                  type="submit"
                  disabled={status === 'sending'}
                  className={`w-full py-4 rounded-xl font-black text-base shadow-xl transition-all duration-300 transform active:scale-95 ${
                    status === 'sending' 
                      ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                      : 'bg-[#9d7902] text-white shadow-[#9d7902]/20 hover:bg-[#b58c03]'
                  }`}
                >
                  {status === 'sending' ? 'جاري الإرسال...' : 'إرسال المقترح'}
                </button>

                {status === 'success' && (
                  <p className="text-emerald-400 font-bold mt-2 text-sm">تم إرسال مقترحك بنجاح</p>
                )}
                
                {status === 'error' && (
                  <p className="text-red-400 font-bold text-sm">{errorMessage}</p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutView;